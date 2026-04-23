"""Pydantic v2 schemas for the Smart Road Management API."""

from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


# ── Enums ────────────────────────────────────────────────────────────────────

class IncidentType(str, Enum):
    ACCIDENT = "ДТП"
    REPAIR = "ремонт"
    CLOSURE = "перекрытие"


class IncidentSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class RoadCondition(str, Enum):
    GOOD = "good"
    FAIR = "fair"
    REPAIR_NEEDED = "repair_needed"
    CRITICAL = "critical"


class AIPriority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


# ── Sub-models ───────────────────────────────────────────────────────────────

class CityCenter(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


class Incident(BaseModel):
    type: IncidentType
    severity: IncidentSeverity = IncidentSeverity.MEDIUM
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    road_name: str
    description: str


class RoadSegmentCondition(BaseModel):
    road_name: str
    condition: RoadCondition
    wear_percent: int = Field(ge=0, le=100)


class CongestionPoint(BaseModel):
    hour: str
    score: float = Field(ge=0, le=10)


class AIInsight(BaseModel):
    summary: str
    priority: AIPriority
    actions: list[str]
    confidence: float = Field(ge=0, le=1, default=0.85)
    model_version: str = "v3.2"
    # ── Explainability (XAI) ────────────────────────────────────────────
    reasoning: list[str] = Field(
        default_factory=list,
        description="Step-by-step reasoning chain showing how the AI arrived at its conclusion",
    )
    data_sources: list[str] = Field(
        default_factory=list,
        description="List of concrete data points the AI used for this analysis",
    )


# ── Top-level response ───────────────────────────────────────────────────────

class TrafficResponse(BaseModel):
    city_id: str
    city_name: str
    center: CityCenter
    traffic_score: float = Field(ge=0, le=10)
    incidents: list[Incident]
    road_condition_percent: int = Field(ge=0, le=100)
    road_conditions: list[RoadSegmentCondition] = Field(default_factory=list)
    avg_speed_kmh: int = Field(ge=0)
    congestion_trend_12h: list[CongestionPoint]
    ai_insight: AIInsight


class CityListItem(BaseModel):
    city_id: str
    city_name: str
    center: CityCenter
    population: int = 0


class LatLng(BaseModel):
    lat: float
    lng: float


class TrafficPolyline(BaseModel):
    road_name: str
    coords: list[list[float]]          # [[lat, lng], ...]
    congestion_level: Literal["free", "slow", "heavy"]


class MapIncident(BaseModel):
    id: str
    type: IncidentType
    severity: IncidentSeverity
    lat: float
    lng: float
    road_name: str
    description: str
    timestamp: str                      # ISO-like "HH:MM"
    delay_minutes: int = 0
    ai_recommendation: str = ""


class MapDataResponse(BaseModel):
    city_id: str
    city_name: str
    center: CityCenter
    zoom: int = 12
    polylines: list[TrafficPolyline]
    incidents: list[MapIncident]


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    version: str
    simulation_enabled: bool
    cities_available: int
    use_openai: bool = False
