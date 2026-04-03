"""WebSocket router for real-time traffic event streaming."""

from __future__ import annotations

import asyncio
import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.realtime_events import event_store

logger = logging.getLogger(__name__)

router = APIRouter(tags=["realtime"])


@router.websocket("/ws/events/{city_id}")
async def ws_city_events(websocket: WebSocket, city_id: str):
    """Stream real-time traffic events for a specific city.

    Protocol:
    - On connect: sends {"type": "snapshot", "events": [...]} with all active events
    - Every ~3s: sends {"type": "update", "new": [...], "expired": [...]} with changes
    - Client can send {"type": "ping"} to keep alive
    """
    await websocket.accept()
    logger.info("WS connected: city=%s", city_id)

    # Send initial snapshot
    events = event_store.get_city_events(city_id)
    await websocket.send_text(json.dumps({
        "type": "snapshot",
        "city_id": city_id,
        "events": events,
    }, ensure_ascii=False))

    known_ids: set[str] = {e["id"] for e in events}

    try:
        while True:
            # Tick the simulation engine
            event_store.tick()

            # Get current events
            current_events = event_store.get_city_events(city_id)
            current_ids = {e["id"] for e in current_events}

            # Find new events
            new_events = [e for e in current_events if e["id"] not in known_ids]

            # Find expired events
            expired_ids = [eid for eid in known_ids if eid not in current_ids]

            # Only send if something changed
            if new_events or expired_ids:
                msg = {
                    "type": "update",
                    "city_id": city_id,
                    "new": new_events,
                    "expired": expired_ids,
                    "total_active": len(current_events),
                }
                await websocket.send_text(json.dumps(msg, ensure_ascii=False))
                known_ids = current_ids

            # Sleep before next tick
            await asyncio.sleep(3)

    except WebSocketDisconnect:
        logger.info("WS disconnected: city=%s", city_id)
    except Exception as e:
        logger.error("WS error: city=%s, error=%s", city_id, e)


@router.websocket("/ws/events")
async def ws_all_events(websocket: WebSocket):
    """Stream real-time events for ALL cities (for overview dashboards)."""
    await websocket.accept()
    logger.info("WS connected: all cities")

    all_events = event_store.get_all_events()
    await websocket.send_text(json.dumps({
        "type": "snapshot",
        "events": all_events,
    }, ensure_ascii=False))

    known_ids: set[str] = set()
    for events in all_events.values():
        for e in events:
            known_ids.add(e["id"])

    try:
        while True:
            event_store.tick()

            all_current = event_store.get_all_events()
            current_ids: set[str] = set()
            for events in all_current.values():
                for e in events:
                    current_ids.add(e["id"])

            new_by_city: dict[str, list] = {}
            for city_id, events in all_current.items():
                new_evs = [e for e in events if e["id"] not in known_ids]
                if new_evs:
                    new_by_city[city_id] = new_evs

            expired = list(known_ids - current_ids)

            if new_by_city or expired:
                await websocket.send_text(json.dumps({
                    "type": "update",
                    "new_by_city": new_by_city,
                    "expired": expired,
                }, ensure_ascii=False))
                known_ids = current_ids

            await asyncio.sleep(3)

    except WebSocketDisconnect:
        logger.info("WS disconnected: all cities")
    except Exception as e:
        logger.error("WS all error: %s", e)
