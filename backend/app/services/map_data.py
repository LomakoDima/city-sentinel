"""Map data service — assembles polylines + enriched incidents for the map layer."""

from __future__ import annotations

import hashlib
import logging
import random
from datetime import datetime, timedelta, timezone
from typing import Optional, Literal

from app.data.cities import CityMeta, CITIES
from app.data.road_geometry import RoadSegment
from app.services.osrm_router import resolve_city_roads
from app.models.schemas import (
    CityCenter, MapDataResponse, MapIncident,
    TrafficPolyline, IncidentType, IncidentSeverity,
)
from app.services.simulation import _seeded_rng, _current_hour_factor, _population_factor
from app.services.rag_context import build_incident_context
from app.services.openai_advisor import call_openai_incident_recommendation

logger = logging.getLogger(__name__)

KZ_TZ = timezone(timedelta(hours=5))

# ── AI recommendation templates (fallback when OpenAI is unavailable) ────────

_AI_RECS: dict[str, list[str]] = {
    "ДТП": [
        "Изменить фазу светофора на перекрёстке {road} на +20 секунд зелёного для разгрузки.",
        "Перенаправить потоки с {road} через параллельные улицы. Оповестить навигаторы.",
        "Выставить патруль для ручного регулирования на {road}. Ожидаемое время ликвидации: 40 мин.",
    ],
    "ремонт": [
        "Рекомендуется перевести {road} в режим реверсивного движения на время работ.",
        "Установить знаки объезда и опубликовать маршрут в навигационных сервисах для {road}.",
        "Перенести работы на {road} в ночное окно (23:00–05:00) для минимизации заторов.",
    ],
    "перекрытие": [
        "Активировать объездной маршрут для {road}. Синхронизировать светофоры на альтернативе.",
        "Оповестить экстренные службы о перекрытии {road}. Время восстановления: ~2 часа.",
        "Развернуть временные знаки и информационные табло вокруг {road}.",
    ],
}

_DELAY_MAP: dict[str, dict[str, tuple[int, int]]] = {
    "ДТП":        {"low": (5, 10), "medium": (10, 20), "high": (15, 35)},
    "ремонт":     {"low": (3, 8),  "medium": (8, 15),  "high": (12, 25)},
    "перекрытие": {"low": (5, 12), "medium": (10, 20), "high": (15, 30)},
}


def _assign_congestion(
    segments: list[RoadSegment],
    traffic_score: float,
    rng: random.Random,
) -> list[TrafficPolyline]:
    """Assign congestion levels to road segments based on traffic score."""
    polylines: list[TrafficPolyline] = []

    for seg in segments:
        # Base probability shifts with traffic_score
        roll = rng.random() * 10
        if roll < traffic_score - 2:
            level: Literal["free", "slow", "heavy"] = "heavy"
        elif roll < traffic_score + 2:
            level = "slow"
        else:
            level = "free"

        polylines.append(TrafficPolyline(
            road_name=seg.road_name,
            coords=seg.coords,
            congestion_level=level,
        ))
    return polylines


def _enrich_incidents(
    city: CityMeta,
    traffic_score: float,
    rng: random.Random,
) -> list[MapIncident]:
    """Generate map-ready incidents with timestamps, delays, and AI recommendations."""
    from app.services.simulation import simulate_incidents

    raw = simulate_incidents(city, traffic_score)
    now = datetime.now(KZ_TZ)
    enriched: list[MapIncident] = []

    for i, inc in enumerate(raw):
        # Timestamp: somewhere in last 1-90 minutes
        mins_ago = rng.randint(1, 90)
        ts = now - timedelta(minutes=mins_ago)
        timestamp = ts.strftime("%H:%M")

        # Delay
        sev = inc.severity.value
        inc_type = inc.type.value
        lo, hi = _DELAY_MAP.get(inc_type, {}).get(sev, (5, 15))
        delay = rng.randint(lo, hi)

        # AI recommendation — try ChatGPT with RAG, fallback to template
        rec = None
        from app.config import settings as _settings
        if _settings.use_openai:
            try:
                ctx = build_incident_context(
                    city=city,
                    incident_type=inc_type,
                    incident_severity=sev,
                    road_name=inc.road_name,
                    description=inc.description,
                    lat=inc.lat,
                    lng=inc.lng,
                )
                rec = call_openai_incident_recommendation(ctx)
            except Exception as exc:
                logger.warning("OpenAI incident rec failed: %s", exc)

        if not rec:
            templates = _AI_RECS.get(inc_type, _AI_RECS["ДТП"])
            rec = rng.choice(templates).format(road=inc.road_name)

        # Stable ID
        id_seed = f"{city.city_id}:{inc.road_name}:{i}"
        inc_id = hashlib.md5(id_seed.encode()).hexdigest()[:8]

        enriched.append(MapIncident(
            id=inc_id,
            type=inc.type,
            severity=inc.severity,
            lat=inc.lat,
            lng=inc.lng,
            road_name=inc.road_name,
            description=inc.description,
            timestamp=timestamp,
            delay_minutes=delay,
            ai_recommendation=rec,
        ))

    return enriched


# ── Public API ───────────────────────────────────────────────────────────────

def get_map_data(city_id: str) -> Optional[MapDataResponse]:
    """Build the full map data payload for a given city."""
    city = CITIES.get(city_id.lower())
    if city is None:
        return None

    rng = _seeded_rng(city.city_id)

    # Traffic score for congestion colouring
    from app.services.simulation import simulate_traffic_score
    traffic_score = simulate_traffic_score(city)

    # Road polylines with congestion (OSRM-resolved geometry)
    segments = resolve_city_roads(city.city_id)
    polylines = _assign_congestion(segments, traffic_score, rng)

    # Enriched incidents
    incidents = _enrich_incidents(city, traffic_score, rng)

    return MapDataResponse(
        city_id=city.city_id,
        city_name=city.city_name,
        center=CityCenter(lat=city.lat, lng=city.lng),
        zoom=13 if city.population > 1_000_000 else 12,
        polylines=polylines,
        incidents=incidents,
    )
