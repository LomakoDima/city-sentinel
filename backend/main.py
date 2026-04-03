"""Smart Road Management Dashboard — API entry point.

Run with:
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models.schemas import HealthResponse
from app.routers.traffic import router as traffic_router
from app.routers.websocket import router as ws_router

logging.basicConfig(
    level=logging.DEBUG if settings.app_debug else logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)

app = FastAPI(
    title="Smart Road Management API",
    version="1.0.0",
    description="Data service for the City Sentinel dashboard — monitors traffic, incidents and road conditions across Kazakhstan cities.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(traffic_router)
app.include_router(ws_router)


@app.get("/health", response_model=HealthResponse, tags=["system"])
def health_check() -> HealthResponse:
    from app.data.cities import CITIES
    return HealthResponse(
        status="ok",
        version=app.version,
        simulation_enabled=settings.simulation_enabled,
        cities_available=len(CITIES),
    )

