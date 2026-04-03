"""OSRM-based road geometry resolver.

Uses the free OSRM demo server to snap waypoints to real road networks
and return dense polylines. Results are cached to a JSON file to avoid
repeated API calls.
"""

from __future__ import annotations

import json
import logging
import time
from pathlib import Path
from typing import Optional

import httpx
import polyline as polyline_codec

from app.data.road_geometry import RoadWaypoints, RoadSegment, get_road_waypoints

logger = logging.getLogger(__name__)

OSRM_BASE = "https://router.project-osrm.org"
CACHE_DIR = Path(__file__).resolve().parent.parent / "data" / "_geometry_cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Rate-limit: max 1 request per second to be polite to the demo server
_last_request_time: float = 0.0


def _cache_path(city_id: str) -> Path:
    return CACHE_DIR / f"{city_id}_roads.json"


def _load_cache(city_id: str) -> Optional[dict[str, list[list[float]]]]:
    """Load cached geometry {road_name: [[lat, lng], ...]}."""
    path = _cache_path(city_id)
    if path.exists():
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(data, dict) and len(data) > 0:
                return data
        except (json.JSONDecodeError, OSError) as e:
            logger.warning("Cache read failed for %s: %s", city_id, e)
    return None


def _save_cache(city_id: str, data: dict[str, list[list[float]]]) -> None:
    """Persist resolved geometry to disk."""
    try:
        _cache_path(city_id).write_text(
            json.dumps(data, ensure_ascii=False), encoding="utf-8"
        )
    except OSError as e:
        logger.warning("Cache write failed for %s: %s", city_id, e)


def _fetch_osrm_route(waypoints: list[list[float]]) -> Optional[list[list[float]]]:
    """Call OSRM /route/v1/driving with waypoints, return [[lat,lng], ...]."""
    global _last_request_time

    # OSRM expects lng,lat order in URL
    coords_str = ";".join(f"{wp[1]},{wp[0]}" for wp in waypoints)
    url = (
        f"{OSRM_BASE}/route/v1/driving/{coords_str}"
        f"?overview=full&geometries=polyline&steps=false"
    )

    # Rate limiting
    elapsed = time.time() - _last_request_time
    if elapsed < 1.0:
        time.sleep(1.0 - elapsed)

    try:
        _last_request_time = time.time()
        resp = httpx.get(url, timeout=10.0)
        resp.raise_for_status()
        data = resp.json()

        if data.get("code") != "Ok" or not data.get("routes"):
            logger.warning("OSRM returned no route: %s", data.get("code"))
            return None

        encoded_polyline = data["routes"][0]["geometry"]
        # polyline library decodes to [(lat, lng), ...]
        decoded = polyline_codec.decode(encoded_polyline)
        return [[lat, lng] for lat, lng in decoded]

    except Exception as e:
        logger.error("OSRM request failed: %s", e)
        return None


def resolve_city_roads(city_id: str) -> list[RoadSegment]:
    """Resolve all roads for a city via OSRM with disk caching.

    Returns RoadSegment objects with dense coordinate arrays that follow
    actual road geometry from OpenStreetMap data.
    """
    waypoint_defs = get_road_waypoints(city_id)
    if not waypoint_defs:
        return []

    # Try cache first
    cache = _load_cache(city_id)
    if cache and len(cache) >= len(waypoint_defs):
        logger.info("Using cached geometry for %s (%d roads)", city_id, len(cache))
        segments = []
        for wp_def in waypoint_defs:
            coords = cache.get(wp_def.road_name)
            if coords and len(coords) >= 2:
                segments.append(RoadSegment(
                    road_name=wp_def.road_name,
                    city_id=city_id,
                    coords=coords,
                ))
        if segments:
            return segments

    # Resolve from OSRM
    logger.info("Fetching geometry from OSRM for %s (%d roads)...", city_id, len(waypoint_defs))
    resolved: dict[str, list[list[float]]] = {}
    segments: list[RoadSegment] = []

    for wp_def in waypoint_defs:
        coords = _fetch_osrm_route(wp_def.waypoints)
        if coords and len(coords) >= 2:
            resolved[wp_def.road_name] = coords
            segments.append(RoadSegment(
                road_name=wp_def.road_name,
                city_id=city_id,
                coords=coords,
            ))
            logger.info("  ✓ %s: %d points", wp_def.road_name, len(coords))
        else:
            # Fallback: use raw waypoints if OSRM fails
            resolved[wp_def.road_name] = wp_def.waypoints
            segments.append(RoadSegment(
                road_name=wp_def.road_name,
                city_id=city_id,
                coords=wp_def.waypoints,
            ))
            logger.warning("  ✗ %s: OSRM failed, using raw waypoints", wp_def.road_name)

    # Save cache
    if resolved:
        _save_cache(city_id, resolved)

    return segments
