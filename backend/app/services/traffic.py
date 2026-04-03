"""Traffic data service.

Orchestrates data from simulation (or real APIs when keys are provided)
and assembles the final TrafficResponse for a given city.

Integration points for real APIs:
- Yandex Traffic API → real-time traffic_score, congestion data
- 2GIS API → geocoding, road segments, routing
Both are stubbed and will fall back to simulation when keys are empty.
"""

from __future__ import annotations

import logging
from typing import Optional

import requests

from app.config import settings
from app.data.cities import CityMeta, CITIES
from app.models.schemas import (
    TrafficResponse, CityCenter, CongestionPoint,
    Incident, RoadSegmentCondition,
)
from app.services.simulation import (
    simulate_traffic_score,
    simulate_avg_speed,
    simulate_incidents,
    simulate_road_conditions,
    simulate_congestion_trend,
)
from app.services.ai_advisor import build_ai_insight

logger = logging.getLogger(__name__)


# ── Real API stubs ───────────────────────────────────────────────────────────

def _fetch_yandex_traffic(city: CityMeta) -> Optional[float]:
    """Fetch real-time traffic score from Yandex Traffic API.

    Returns traffic_score (0-10) or None if unavailable.
    """
    api_key = settings.yandex_traffic_api_key
    if not api_key:
        return None

    try:
        # TODO: Replace with actual Yandex Traffic API endpoint
        # url = f"https://api.traffic.yandex.net/v1/score?lat={city.lat}&lng={city.lng}&key={api_key}"
        # resp = requests.get(url, timeout=5)
        # resp.raise_for_status()
        # return resp.json().get("score")
        logger.info("Yandex Traffic API key present but integration not yet implemented — falling back to simulation.")
        return None
    except requests.RequestException as exc:
        logger.warning("Yandex Traffic API error for %s: %s", city.city_id, exc)
        return None


def _fetch_2gis_roads(city: CityMeta) -> Optional[list[dict]]:
    """Fetch road segment data from 2GIS API.

    Returns list of road segments or None if unavailable.
    """
    api_key = settings.twogis_api_key
    if not api_key:
        return None

    try:
        # TODO: Replace with actual 2GIS API endpoint
        # url = f"https://catalog.api.2gis.com/3.0/items?q=roads&point={city.lng},{city.lat}&key={api_key}"
        # resp = requests.get(url, timeout=5)
        # resp.raise_for_status()
        # return resp.json().get("result", {}).get("items", [])
        logger.info("2GIS API key present but integration not yet implemented — falling back to simulation.")
        return None
    except requests.RequestException as exc:
        logger.warning("2GIS API error for %s: %s", city.city_id, exc)
        return None


# ── Main service ─────────────────────────────────────────────────────────────

def get_city_traffic(city_id: str) -> Optional[TrafficResponse]:
    """Build a full TrafficResponse for the given city.

    Uses real APIs when keys are configured; otherwise falls back to
    smart simulation.

    Returns None if city_id is not found.
    """
    city = CITIES.get(city_id.lower())
    if city is None:
        return None

    # 1. Traffic score — try real API first
    traffic_score = _fetch_yandex_traffic(city)
    if traffic_score is None:
        traffic_score = simulate_traffic_score(city)

    # 2. Average speed (derived from score)
    avg_speed = simulate_avg_speed(traffic_score)

    # 3. Incidents — simulation (real API integration placeholder)
    incidents = simulate_incidents(city, traffic_score)

    # 4. Road conditions
    road_condition_pct, road_segments = simulate_road_conditions(city)

    # 5. Congestion trend
    congestion_trend = simulate_congestion_trend(city)

    # 6. AI insight (RAG + ChatGPT when OPENAI_API_KEY is set, else rule-based)
    ai_insight = build_ai_insight(
        city=city,
        traffic_score=traffic_score,
        incidents=incidents,
        road_conditions=road_segments,
        avg_speed=avg_speed,
        congestion_trend=congestion_trend,
    )

    return TrafficResponse(
        city_id=city.city_id,
        city_name=city.city_name,
        center=CityCenter(lat=city.lat, lng=city.lng),
        traffic_score=traffic_score,
        incidents=incidents,
        road_condition_percent=road_condition_pct,
        road_conditions=road_segments,
        avg_speed_kmh=avg_speed,
        congestion_trend_12h=congestion_trend,
        ai_insight=ai_insight,
    )


def list_available_cities() -> list[str]:
    """Return sorted list of available city IDs."""
    return sorted(CITIES.keys())
