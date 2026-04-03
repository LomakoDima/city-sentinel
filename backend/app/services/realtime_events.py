"""Real-time traffic event simulation engine.

Generates realistic road incidents that appear and disappear over time,
placed on actual road geometry coordinates from OSRM cache.
Events have a lifespan (TTL), severity escalation, and time-of-day weighting.

Designed to power WebSocket push updates to the frontend.
"""

from __future__ import annotations

import hashlib
import json
import random
import time
import math
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional
from enum import Enum

from app.data.cities import CITIES, CityMeta

KZ_TZ = timezone(timedelta(hours=5))
CACHE_DIR = Path(__file__).resolve().parent.parent / "data" / "_geometry_cache"


# ── Event types & templates ──────────────────────────────────────────────────

class EventType(str, Enum):
    ACCIDENT = "ДТП"
    REPAIR = "ремонт"
    CLOSURE = "перекрытие"
    CONGESTION = "затор"
    WEATHER = "погода"
    POLICE = "полиция"


class EventSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


EVENT_DESCRIPTIONS: dict[EventType, list[str]] = {
    EventType.ACCIDENT: [
        "Столкновение двух автомобилей, правая полоса занята",
        "ДТП с участием 3-х авто, движение затруднено",
        "Мелкое ДТП без пострадавших, объезд по левой полосе",
        "Столкновение на перекрёстке, образовалась пробка ~500м",
        "Наезд на препятствие, ожидается эвакуатор",
        "Лобовое столкновение, вызваны экстренные службы",
        "ДТП с участием автобуса, пассажиры эвакуированы",
    ],
    EventType.REPAIR: [
        "Плановый ремонт покрытия, движение по одной полосе",
        "Замена дорожного полотна, ограничение до 40 км/ч",
        "Ремонт ливневой канализации, частичное перекрытие",
        "Укладка нового асфальта, объезд через дворы",
        "Замена бордюрного камня, сужение до 1 полосы",
    ],
    EventType.CLOSURE: [
        "Перекрытие из-за коммунальных работ",
        "Временное перекрытие для проведения мероприятия",
        "Перекрытие из-за провала дорожного полотна",
        "Полное перекрытие участка, объезд по параллельной улице",
        "Перекрытие для пропуска спецтранспорта",
    ],
    EventType.CONGESTION: [
        "Плотный поток, скорость менее 15 км/ч",
        "Затор на перекрёстке, движение стоит",
        "Пробка из-за неработающего светофора",
        "Затруднённое движение, время проезда +20 мин",
        "Пробка на подъезде к развязке",
    ],
    EventType.WEATHER: [
        "Гололёд на дороге, снижайте скорость",
        "Сильный дождь, видимость менее 100м",
        "Снегопад, дорога скользкая",
        "Туман, рекомендуется снизить скорость до 40 км/ч",
        "Подтопление дороги после ливня",
    ],
    EventType.POLICE: [
        "Патруль ДПС, проверка документов",
        "Контрольно-пропускной пост, возможны задержки",
        "Полицейский рейд, проверка на алкоголь",
        "Сопровождение спецкортежа, временные ограничения",
    ],
}

EVENT_TTL_RANGES: dict[EventType, tuple[int, int]] = {
    EventType.ACCIDENT:   (300, 2400),     # 5–40 min
    EventType.REPAIR:     (1800, 14400),   # 30 min – 4 hours
    EventType.CLOSURE:    (600, 7200),     # 10 min – 2 hours
    EventType.CONGESTION: (180, 1200),     # 3–20 min
    EventType.WEATHER:    (600, 3600),     # 10–60 min
    EventType.POLICE:     (300, 1800),     # 5–30 min
}

EVENT_TYPE_WEIGHTS = {
    EventType.ACCIDENT:   0.25,
    EventType.REPAIR:     0.10,
    EventType.CLOSURE:    0.08,
    EventType.CONGESTION: 0.35,
    EventType.WEATHER:    0.12,
    EventType.POLICE:     0.10,
}

SEVERITY_WEIGHTS = {
    EventSeverity.LOW:      0.40,
    EventSeverity.MEDIUM:   0.30,
    EventSeverity.HIGH:     0.20,
    EventSeverity.CRITICAL: 0.10,
}


# ── Live Event dataclass ─────────────────────────────────────────────────────

@dataclass
class LiveEvent:
    id: str
    city_id: str
    event_type: EventType
    severity: EventSeverity
    lat: float
    lng: float
    road_name: str
    description: str
    created_at: float          # time.time()
    expires_at: float          # time.time() + TTL
    delay_minutes: int = 0
    updated: bool = False      # flag for "event changed" push

    def is_expired(self) -> bool:
        return time.time() > self.expires_at

    def remaining_seconds(self) -> int:
        return max(0, int(self.expires_at - time.time()))

    def to_dict(self) -> dict:
        now_kz = datetime.now(KZ_TZ)
        created_kz = datetime.fromtimestamp(self.created_at, KZ_TZ)
        return {
            "id": self.id,
            "city_id": self.city_id,
            "type": self.event_type.value,
            "severity": self.severity.value,
            "lat": self.lat,
            "lng": self.lng,
            "road_name": self.road_name,
            "description": self.description,
            "timestamp": created_kz.strftime("%H:%M"),
            "delay_minutes": self.delay_minutes,
            "remaining_seconds": self.remaining_seconds(),
            "is_new": (time.time() - self.created_at) < 10,
        }


# ── Road coordinate picker ───────────────────────────────────────────────────

def _load_road_coords(city_id: str) -> dict[str, list[list[float]]]:
    """Load cached OSRM road geometry for a city."""
    cache_file = CACHE_DIR / f"{city_id}_roads.json"
    if cache_file.exists():
        try:
            return json.loads(cache_file.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            pass
    return {}


def _pick_road_point(
    city: CityMeta,
    road_coords: dict[str, list[list[float]]],
    rng: random.Random,
) -> tuple[str, float, float]:
    """Pick a random point on a real road in the city."""
    if road_coords:
        road_name = rng.choice(list(road_coords.keys()))
        coords = road_coords[road_name]
        if coords and len(coords) >= 2:
            # Pick a random point along the road
            idx = rng.randint(0, len(coords) - 1)
            lat, lng = coords[idx]
            # Add tiny jitter (±30m) to avoid exact overlap
            lat += rng.uniform(-0.0003, 0.0003)
            lng += rng.uniform(-0.0004, 0.0004)
            return road_name, round(lat, 5), round(lng, 5)

    # Fallback: random point near city center
    road_name = rng.choice(city.major_roads) if city.major_roads else "улица Центральная"
    lat = city.lat + rng.uniform(-0.015, 0.015)
    lng = city.lng + rng.uniform(-0.02, 0.02)
    return road_name, round(lat, 5), round(lng, 5)


# ── Hour-of-day activity factor ──────────────────────────────────────────────

def _hour_activity_factor() -> float:
    """0.0–1.0 factor: high during rush hours, low at night."""
    now = datetime.now(KZ_TZ)
    h = now.hour + now.minute / 60.0
    # Night trough (2–5am), morning rush (7–9), evening rush (17–19)
    night = 0.05
    morning = 0.9 * math.exp(-((h - 8.0) ** 2) / 3)
    day = 0.5 * math.exp(-((h - 13.0) ** 2) / 8)
    evening = 1.0 * math.exp(-((h - 17.5) ** 2) / 3)
    return max(night, morning, day, evening)


# ── Global event store ────────────────────────────────────────────────────────

class RealtimeEventStore:
    """Manages live events for all cities. Thread-safe for single-process use."""

    def __init__(self):
        self._events: dict[str, LiveEvent] = {}  # event_id -> LiveEvent
        self._road_coords_cache: dict[str, dict] = {}
        self._rng = random.Random(42)
        self._last_generation: dict[str, float] = {}  # city_id -> last time

    def _get_road_coords(self, city_id: str) -> dict[str, list[list[float]]]:
        if city_id not in self._road_coords_cache:
            self._road_coords_cache[city_id] = _load_road_coords(city_id)
        return self._road_coords_cache[city_id]

    def _generate_event(self, city: CityMeta) -> LiveEvent:
        """Create a single new random event for a city."""
        rng = self._rng
        road_coords = self._get_road_coords(city.city_id)

        # Pick event type
        types = list(EVENT_TYPE_WEIGHTS.keys())
        weights = list(EVENT_TYPE_WEIGHTS.values())
        event_type = rng.choices(types, weights=weights)[0]

        # Pick severity
        sevs = list(SEVERITY_WEIGHTS.keys())
        sev_w = list(SEVERITY_WEIGHTS.values())
        severity = rng.choices(sevs, weights=sev_w)[0]

        # Pick road and coordinates
        road_name, lat, lng = _pick_road_point(city, road_coords, rng)

        # Description
        desc = rng.choice(EVENT_DESCRIPTIONS[event_type])

        # TTL
        ttl_lo, ttl_hi = EVENT_TTL_RANGES[event_type]
        ttl = rng.randint(ttl_lo, ttl_hi)

        # Delay
        delay_map = {
            EventSeverity.LOW: (2, 8),
            EventSeverity.MEDIUM: (5, 15),
            EventSeverity.HIGH: (10, 25),
            EventSeverity.CRITICAL: (15, 40),
        }
        d_lo, d_hi = delay_map[severity]
        delay = rng.randint(d_lo, d_hi)

        # Unique ID
        now = time.time()
        id_seed = f"{city.city_id}:{road_name}:{now}:{rng.random()}"
        event_id = hashlib.md5(id_seed.encode()).hexdigest()[:10]

        return LiveEvent(
            id=event_id,
            city_id=city.city_id,
            event_type=event_type,
            severity=severity,
            lat=lat,
            lng=lng,
            road_name=road_name,
            description=desc,
            created_at=now,
            expires_at=now + ttl,
            delay_minutes=delay,
        )

    def tick(self) -> dict[str, list[dict]]:
        """Advance simulation: expire old events, maybe create new ones.

        Returns {city_id: [new_events_as_dict, ...]} for cities that changed.
        """
        now = time.time()
        changes: dict[str, list[dict]] = {}

        # Remove expired events
        expired_ids = [eid for eid, ev in self._events.items() if ev.is_expired()]
        expired_by_city: dict[str, list[str]] = {}
        for eid in expired_ids:
            ev = self._events.pop(eid)
            expired_by_city.setdefault(ev.city_id, []).append(eid)

        # Record expired as changes (removals)
        for city_id, eids in expired_by_city.items():
            changes.setdefault(city_id, [])

        # Maybe generate new events
        activity = _hour_activity_factor()

        for city_id, city in CITIES.items():
            last_gen = self._last_generation.get(city_id, 0)
            pop_factor = min(city.population / 2_100_000, 1.0)

            # How often to generate: busier cities + rush hour → more frequent
            interval = max(5, 30 - activity * 20 * pop_factor)

            if now - last_gen < interval:
                continue

            self._last_generation[city_id] = now

            # Probability of spawning an event this tick
            spawn_chance = activity * pop_factor * 0.6
            if self._rng.random() < spawn_chance:
                # Limit max active events per city
                city_events = [e for e in self._events.values() if e.city_id == city_id]
                max_events = max(3, int(pop_factor * 12))
                if len(city_events) < max_events:
                    new_event = self._generate_event(city)
                    self._events[new_event.id] = new_event
                    changes.setdefault(city_id, []).append(new_event.to_dict())

        return changes

    def get_city_events(self, city_id: str) -> list[dict]:
        """Get all active events for a city."""
        return [
            ev.to_dict()
            for ev in self._events.values()
            if ev.city_id == city_id and not ev.is_expired()
        ]

    def get_all_events(self) -> dict[str, list[dict]]:
        """Get all active events grouped by city."""
        result: dict[str, list[dict]] = {}
        for ev in self._events.values():
            if not ev.is_expired():
                result.setdefault(ev.city_id, []).append(ev.to_dict())
        return result

    def get_expired_ids(self, city_id: str, known_ids: set[str]) -> list[str]:
        """Return IDs from known_ids that are no longer active."""
        active_ids = {
            ev.id for ev in self._events.values()
            if ev.city_id == city_id and not ev.is_expired()
        }
        return [eid for eid in known_ids if eid not in active_ids]


# Singleton store
event_store = RealtimeEventStore()
