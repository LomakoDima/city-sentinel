"""Traffic API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.data.cities import CITIES
from app.models.schemas import TrafficResponse, CityListItem, CityCenter, MapDataResponse
from app.services.traffic import get_city_traffic
from app.services.map_data import get_map_data

router = APIRouter(prefix="/api", tags=["traffic"])


@router.get("/traffic/{city_id}", response_model=TrafficResponse)
def traffic_by_city(city_id: str) -> TrafficResponse:
    """Get real-time traffic data for a specific city.

    The response includes:
    - Traffic congestion score (0–10)
    - Active incidents with coordinates and severity
    - Road condition breakdown per major road segment
    - 12-hour congestion trend
    - AI-generated insight with recommended actions
    """
    result = get_city_traffic(city_id)
    if result is None:
        available = ", ".join(sorted(CITIES.keys()))
        raise HTTPException(
            status_code=404,
            detail=f"Unknown city_id '{city_id}'. Available: {available}",
        )
    return result


@router.get("/map-data/{city_id}", response_model=MapDataResponse)
def map_data_by_city(city_id: str) -> MapDataResponse:
    """Get GIS map layer data for a specific city.

    Returns traffic polylines with congestion levels and enriched
    incident markers with timestamps, delays, and AI recommendations.
    """
    result = get_map_data(city_id)
    if result is None:
        available = ", ".join(sorted(CITIES.keys()))
        raise HTTPException(
            status_code=404,
            detail=f"Unknown city_id '{city_id}'. Available: {available}",
        )
    return result


@router.get("/cities", response_model=list[CityListItem])
def list_cities() -> list[CityListItem]:
    """List all available cities with metadata."""
    return [
        CityListItem(
            city_id=meta.city_id,
            city_name=meta.city_name,
            center=CityCenter(lat=meta.lat, lng=meta.lng),
            population=meta.population,
        )
        for meta in sorted(CITIES.values(), key=lambda c: c.city_name)
    ]
