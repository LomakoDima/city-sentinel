"""Smart simulation engine.

Generates realistic traffic data based on:
- Time of day (rush-hour curves)
- City population (larger cities → more incidents, worse congestion)
- Seasonal/random noise seeded per-city for reproducibility within a time window

The generated data is deterministic for a given (city, hour) pair within
a 5-minute window so repeated requests don't flicker.
"""

from __future__ import annotations

import hashlib
import math
import random
from datetime import datetime, timezone, timedelta
from typing import Sequence

from app.data.cities import CityMeta, CONGESTION_PROFILES
from app.models.schemas import (
    Incident, IncidentType, IncidentSeverity,
    RoadSegmentCondition, RoadCondition,
    CongestionPoint,
)

# ── Timezone for Kazakhstan (UTC+5 / UTC+6 — we use +5 Almaty-ish) ──────────
KZ_TZ = timezone(timedelta(hours=5))


def _seeded_rng(city_id: str, bucket_minutes: int = 5) -> random.Random:
    """Return a Random instance seeded by city + current time bucket.

    This ensures the simulation output is stable for `bucket_minutes`
    so that rapid polling from the frontend sees consistent data.
    """
    now = datetime.now(KZ_TZ)
    bucket = now.replace(
        minute=(now.minute // bucket_minutes) * bucket_minutes,
        second=0, microsecond=0,
    )
    seed_str = f"{city_id}:{bucket.isoformat()}"
    seed_int = int(hashlib.sha256(seed_str.encode()).hexdigest()[:16], 16)
    return random.Random(seed_int)


def _current_hour_factor() -> float:
    """Return a 0‑1 factor representing how 'rush-hour' the current time is.

    Peaks at 08:30 and 17:30, trough at 03:00.
    """
    now = datetime.now(KZ_TZ)
    h = now.hour + now.minute / 60.0
    morning = math.exp(-((h - 8.5) ** 2) / 4)
    evening = math.exp(-((h - 17.5) ** 2) / 4)
    return max(morning, evening, 0.05)


def _population_factor(population: int) -> float:
    """Normalize population to a 0.3–1.0 multiplier."""
    return min(max(population / 2_100_000, 0.3), 1.0)


# ── Public API ───────────────────────────────────────────────────────────────

def simulate_traffic_score(city: CityMeta) -> float:
    """Generate a traffic congestion score 0–10."""
    rng = _seeded_rng(city.city_id)
    base = _current_hour_factor() * 10
    pop = _population_factor(city.population)
    noise = rng.gauss(0, 0.5)
    score = base * pop + noise
    return round(min(max(score, 0.0), 10.0), 1)


def simulate_avg_speed(traffic_score: float) -> int:
    """Derive average speed from traffic score (inverse relationship)."""
    # score 0 → ~60 km/h, score 10 → ~8 km/h
    speed = 60 - traffic_score * 5.2
    return max(8, round(speed))


def simulate_incidents(city: CityMeta, traffic_score: float) -> list[Incident]:
    """Generate random incidents weighted by traffic severity and population."""
    rng = _seeded_rng(city.city_id)
    pop = _population_factor(city.population)

    # Expected count: high traffic + large city → more incidents
    lam = traffic_score * pop * 0.35
    count = min(rng.randint(0, max(1, round(lam))), 5)

    if count == 0:
        return []

    types = list(IncidentType)
    severities = list(IncidentSeverity)
    severity_weights = {
        IncidentSeverity.LOW: 0.5,
        IncidentSeverity.MEDIUM: 0.35,
        IncidentSeverity.HIGH: 0.15,
    }

    descriptions_map: dict[IncidentType, list[str]] = {
        IncidentType.ACCIDENT: [
            "Столкновение двух автомобилей, занята правая полоса.",
            "ДТП с участием 3 авто, движение затруднено.",
            "Мелкое ДТП, объезд по левой полосе.",
            "Столкновение на перекрёстке, пробка 500 м.",
            "Наезд на препятствие, ожидается эвакуатор.",
        ],
        IncidentType.REPAIR: [
            "Плановый ремонт покрытия, движение по одной полосе.",
            "Замена дорожного полотна, ограничение до 40 км/ч.",
            "Ремонт ливневой канализации, частичное перекрытие.",
            "Укладка нового асфальта, объезд через дворы.",
        ],
        IncidentType.CLOSURE: [
            "Перекрытие из-за коммунальных работ до 20:00.",
            "Временное перекрытие для проведения мероприятия.",
            "Перекрытие из-за провала дорожного полотна.",
            "Полное перекрытие участка, объезд по параллельной улице.",
        ],
    }

    incidents: list[Incident] = []
    used_roads: set[str] = set()
    available_roads = list(city.major_roads) if city.major_roads else ["улица Центральная"]

    for _ in range(count):
        inc_type = rng.choice(types)
        severity = rng.choices(severities, weights=[severity_weights[s] for s in severities])[0]

        # Pick a road we haven't used yet
        free_roads = [r for r in available_roads if r not in used_roads]
        if not free_roads:
            free_roads = available_roads
        road = rng.choice(free_roads)
        used_roads.add(road)

        # Offset lat/lng randomly within ~2 km of city center
        lat = city.lat + rng.uniform(-0.015, 0.015)
        lng = city.lng + rng.uniform(-0.02, 0.02)

        desc = rng.choice(descriptions_map[inc_type])

        incidents.append(Incident(
            type=inc_type,
            severity=severity,
            lat=round(lat, 4),
            lng=round(lng, 4),
            road_name=road,
            description=desc,
        ))

    return incidents


def simulate_road_conditions(city: CityMeta) -> tuple[int, list[RoadSegmentCondition]]:
    """Generate road condition percent and per-road segment statuses.

    Returns (overall_percent, segments).
    """
    rng = _seeded_rng(city.city_id)
    pop = _population_factor(city.population)

    segments: list[RoadSegmentCondition] = []
    roads = city.major_roads if city.major_roads else ["улица Центральная"]

    total_wear = 0
    for road in roads:
        # Higher population → more wear; add randomness
        base_wear = rng.randint(5, 35) * pop
        wear = min(round(base_wear + rng.gauss(0, 5)), 80)
        wear = max(wear, 2)

        if wear < 15:
            cond = RoadCondition.GOOD
        elif wear < 30:
            cond = RoadCondition.FAIR
        elif wear < 55:
            cond = RoadCondition.REPAIR_NEEDED
        else:
            cond = RoadCondition.CRITICAL

        segments.append(RoadSegmentCondition(
            road_name=road,
            condition=cond,
            wear_percent=wear,
        ))
        total_wear += wear

    avg_wear = round(total_wear / len(segments)) if segments else 0
    overall_condition = max(0, min(100, 100 - avg_wear))
    return overall_condition, segments


def simulate_congestion_trend(city: CityMeta) -> list[CongestionPoint]:
    """Return 12-hour congestion trend with light noise applied to the base profile."""
    rng = _seeded_rng(city.city_id)
    base = CONGESTION_PROFILES.get(city.city_id)
    if not base:
        # Fallback: generate a generic curve
        base = [{"hour": f"{h:02d}:00", "score": 3.0 + 2 * math.sin((h - 6) * math.pi / 12)}
                for h in range(7, 19)]

    points: list[CongestionPoint] = []
    for entry in base:
        noise = rng.gauss(0, 0.2)
        score = round(min(max(float(entry["score"]) + noise, 0), 10), 1)  # type: ignore[arg-type]
        points.append(CongestionPoint(hour=str(entry["hour"]), score=score))
    return points
