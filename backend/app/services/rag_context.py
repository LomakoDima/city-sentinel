"""RAG context builder for the AI advisor.

Converts real city state data (traffic, incidents, road conditions, trends)
into a structured text document that gets injected into the LLM prompt.

This is the core anti-hallucination mechanism: the LLM receives ONLY
verified facts from our data pipeline and is instructed to reason
exclusively from them.
"""

from __future__ import annotations

from datetime import datetime, timezone, timedelta

from app.data.cities import CityMeta, CONGESTION_PROFILES
from app.models.schemas import (
    Incident, RoadSegmentCondition, CongestionPoint,
)

KZ_TZ = timezone(timedelta(hours=5))


def build_city_context(
    city: CityMeta,
    traffic_score: float,
    avg_speed: int,
    incidents: list[Incident],
    road_conditions: list[RoadSegmentCondition],
    congestion_trend: list[CongestionPoint],
) -> str:
    """Build a structured RAG context document from verified city data.

    The output is a plain-text document with clearly labelled sections
    that the LLM can reference. Every fact in this document comes from
    our data pipeline — nothing is invented.
    """
    now = datetime.now(KZ_TZ)
    lines: list[str] = []

    # ── Header ──────────────────────────────────────────────────────────
    lines.append("=" * 60)
    lines.append(f"ОТЧЁТ О ТРАНСПОРТНОЙ ОБСТАНОВКЕ")
    lines.append(f"Город: {city.city_name} (ID: {city.city_id})")
    lines.append(f"Координаты центра: {city.lat}°N, {city.lng}°E")
    lines.append(f"Население: {city.population:,} чел.")
    lines.append(f"Дата и время: {now.strftime('%Y-%m-%d %H:%M')} (UTC+5)")
    lines.append("=" * 60)

    # ── Key metrics ─────────────────────────────────────────────────────
    lines.append("")
    lines.append("## КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ")
    lines.append(f"- Балл пробок: {traffic_score}/10")
    lines.append(f"- Средняя скорость потока: {avg_speed} км/ч")
    lines.append(f"- Количество активных инцидентов: {len(incidents)}")

    # Road condition summary
    good = sum(1 for r in road_conditions if r.condition.value == "good")
    fair = sum(1 for r in road_conditions if r.condition.value == "fair")
    repair = sum(1 for r in road_conditions if r.condition.value == "repair_needed")
    critical = sum(1 for r in road_conditions if r.condition.value == "critical")
    total_roads = len(road_conditions)
    if total_roads > 0:
        avg_wear = round(sum(r.wear_percent for r in road_conditions) / total_roads)
    else:
        avg_wear = 0
    lines.append(f"- Дорог всего: {total_roads}")
    lines.append(f"  - Хорошее состояние: {good}")
    lines.append(f"  - Удовлетворительное: {fair}")
    lines.append(f"  - Требует ремонта: {repair}")
    lines.append(f"  - Критическое: {critical}")
    lines.append(f"  - Средний износ: {avg_wear}%")

    # ── Road network ────────────────────────────────────────────────────
    lines.append("")
    lines.append("## ДОРОЖНАЯ СЕТЬ ГОРОДА")
    lines.append(f"Основные магистрали ({len(city.major_roads)} шт.):")
    for road in city.major_roads:
        lines.append(f"  - {road}")

    # ── Incidents ───────────────────────────────────────────────────────
    lines.append("")
    lines.append("## АКТИВНЫЕ ИНЦИДЕНТЫ")
    if not incidents:
        lines.append("Инцидентов не зафиксировано.")
    else:
        for i, inc in enumerate(incidents, 1):
            lines.append(f"  Инцидент #{i}:")
            lines.append(f"    Тип: {inc.type.value}")
            lines.append(f"    Серьёзность: {inc.severity.value}")
            lines.append(f"    Улица: {inc.road_name}")
            lines.append(f"    Координаты: {inc.lat}°N, {inc.lng}°E")
            lines.append(f"    Описание: {inc.description}")

    # ── Road conditions detail ──────────────────────────────────────────
    lines.append("")
    lines.append("## СОСТОЯНИЕ ДОРОЖНОГО ПОКРЫТИЯ (по сегментам)")
    for seg in road_conditions:
        condition_label = {
            "good": "хорошее",
            "fair": "удовлетворительное",
            "repair_needed": "требует ремонта",
            "critical": "критическое",
        }.get(seg.condition.value, seg.condition.value)
        lines.append(f"  - {seg.road_name}: {condition_label} (износ {seg.wear_percent}%)")

    # ── Congestion trend ────────────────────────────────────────────────
    lines.append("")
    lines.append("## ТРЕНД ЗАГРУЖЕННОСТИ (12 часов)")
    for pt in congestion_trend:
        bar = "█" * int(pt.score)
        lines.append(f"  {pt.hour}: {pt.score}/10 {bar}")

    # ── Alternative roads ───────────────────────────────────────────────
    blocked_roads = {inc.road_name for inc in incidents}
    free_roads = [r for r in city.major_roads if r not in blocked_roads]
    lines.append("")
    lines.append("## СВОБОДНЫЕ МАГИСТРАЛИ (без инцидентов)")
    if free_roads:
        for r in free_roads:
            lines.append(f"  - {r}")
    else:
        lines.append("  Все основные магистрали затронуты инцидентами.")

    lines.append("")
    lines.append("=" * 60)
    lines.append("КОНЕЦ ОТЧЁТА")
    lines.append("=" * 60)

    return "\n".join(lines)


def build_incident_context(
    city: CityMeta,
    incident_type: str,
    incident_severity: str,
    road_name: str,
    description: str,
    lat: float,
    lng: float,
) -> str:
    """Build a focused RAG context for a single incident recommendation.

    Used by the map_data service to generate per-incident AI recommendations.
    """
    now = datetime.now(KZ_TZ)

    # Find alternative roads
    alternatives = [r for r in city.major_roads if r != road_name][:4]

    lines: list[str] = [
        f"ИНЦИДЕНТ НА КАРТЕ — г. {city.city_name}",
        f"Время: {now.strftime('%H:%M')} (UTC+5)",
        f"",
        f"Тип: {incident_type}",
        f"Серьёзность: {incident_severity}",
        f"Улица: {road_name}",
        f"Координаты: {lat}°N, {lng}°E",
        f"Описание: {description}",
        f"",
        f"Дорожная сеть города ({len(city.major_roads)} магистралей):",
    ]
    for r in city.major_roads:
        marker = " [ИНЦИДЕНТ]" if r == road_name else ""
        lines.append(f"  - {r}{marker}")

    lines.append(f"")
    lines.append(f"Альтернативные маршруты (свободные):")
    for r in alternatives:
        lines.append(f"  - {r}")

    return "\n".join(lines)
