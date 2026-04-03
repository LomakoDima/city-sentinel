"""AI-powered traffic advice engine with RAG + ChatGPT integration.

Architecture:
1. RAG context builder serialises verified city data into a structured document.
2. The document is sent to OpenAI ChatGPT as the sole knowledge source.
3. A strict system prompt forbids the LLM from inventing any facts.
4. JSON-mode response is validated against the AIInsight schema.
5. If OpenAI is unavailable or key is empty → deterministic rule-based fallback.

Anti-hallucination guarantees:
- LLM receives ONLY pipeline-verified data (no web search, no memory).
- System prompt explicitly forbids inventing streets, numbers, events.
- Temperature 0.3 minimises creative drift.
- Output is Pydantic-validated before returning.
"""

from __future__ import annotations

import logging

from app.config import settings
from app.data.cities import CityMeta
from app.models.schemas import (
    AIInsight, AIPriority,
    Incident, IncidentType, IncidentSeverity,
    RoadSegmentCondition, RoadCondition,
    CongestionPoint,
)
from app.services.rag_context import build_city_context
from app.services.openai_advisor import call_openai_insight

logger = logging.getLogger(__name__)


# ── Deterministic fallback (rule-based) ─────────────────────────────────────

def _find_alternative_roads(city: CityMeta, blocked_roads: set[str]) -> list[str]:
    """Return up to 3 roads not currently affected by incidents."""
    return [r for r in city.major_roads if r not in blocked_roads][:3]


def _count_by_severity(incidents: list[Incident]) -> dict[IncidentSeverity, int]:
    counts: dict[IncidentSeverity, int] = {s: 0 for s in IncidentSeverity}
    for inc in incidents:
        counts[inc.severity] += 1
    return counts


def _fallback_rule_insight(
    city: CityMeta,
    traffic_score: float,
    incidents: list[Incident],
    road_conditions: list[RoadSegmentCondition],
    avg_speed: int,
) -> AIInsight:
    """Deterministic rule-based fallback when OpenAI is unavailable."""

    severity_counts = _count_by_severity(incidents)
    has_high_severity = severity_counts[IncidentSeverity.HIGH] > 0
    has_accident = any(i.type == IncidentType.ACCIDENT for i in incidents)
    critical_roads = [r for r in road_conditions if r.condition == RoadCondition.CRITICAL]
    repair_roads = [r for r in road_conditions if r.condition == RoadCondition.REPAIR_NEEDED]
    blocked_roads = {i.road_name for i in incidents}
    alternatives = _find_alternative_roads(city, blocked_roads)

    # ── HIGH priority ────────────────────────────────────────────────────
    if traffic_score > 8 or (has_accident and has_high_severity):
        accident_roads = [i.road_name for i in incidents if i.type == IncidentType.ACCIDENT]
        accident_str = ", ".join(accident_roads[:2]) if accident_roads else "ключевые магистрали"
        alt_str = ", ".join(alternatives[:2]) if alternatives else "параллельные улицы"

        summary = (
            f"Критическая загруженность в г. {city.city_name}. "
            f"Балл пробок: {traffic_score}/10, средняя скорость: {avg_speed} км/ч. "
        )
        if accident_roads:
            summary += f"Зафиксировано ДТП: {accident_str}. Высокий риск каскадных заторов."
        else:
            summary += "Высокая плотность потока на всех основных коридорах."

        actions = [
            f"Перенаправить транспортный поток с {accident_str} на {alt_str}.",
            "Увеличить цикл зелёного сигнала на выездах из перегруженных узлов на 20%.",
            "Оповестить экстренные службы и выставить патрули для ручного регулирования.",
        ]
        if critical_roads:
            actions.append(
                f"Срочный ремонт: {', '.join(r.road_name for r in critical_roads[:2])} "
                f"(износ {critical_roads[0].wear_percent}%)."
            )
        if len(incidents) > 3:
            actions.append(
                "Активировать план массовой эвакуации транспорта с центральных улиц."
            )

        reasoning = [
            f"Балл пробок {traffic_score}/10 превышает критический порог (>8) или зафиксировано ДТП высокой серьёзности.",
            f"Средняя скорость потока {avg_speed} км/ч значительно ниже нормы, что указывает на системную перегрузку.",
            f"Обнаружено {len(incidents)} инцидент(ов), затрагивающих ключевые магистрали города.",
            "Приоритет HIGH назначен по правилу: score>8 ИЛИ (ДТП + severity=high).",
        ]
        data_sources = [
            f"Балл пробок: {traffic_score}/10",
            f"Средняя скорость: {avg_speed} км/ч",
            f"Активных инцидентов: {len(incidents)}",
        ]
        for inc in incidents[:3]:
            data_sources.append(f"{inc.type.value} на {inc.road_name}, серьёзность: {inc.severity.value}")
        if critical_roads:
            data_sources.append(f"Критические дороги: {', '.join(r.road_name for r in critical_roads[:2])}")

        return AIInsight(
            summary=summary,
            priority=AIPriority.HIGH,
            actions=actions,
            confidence=0.92,
            model_version="rule-engine-v3.2",
            reasoning=reasoning,
            data_sources=data_sources,
        )

    # ── MEDIUM priority ──────────────────────────────────────────────────
    if traffic_score > 5 or len(incidents) >= 2 or has_accident:
        incident_roads = [i.road_name for i in incidents[:2]]
        inc_str = ", ".join(incident_roads) if incident_roads else "отдельные участки"
        alt_str = ", ".join(alternatives[:2]) if alternatives else "объездные маршруты"

        summary = (
            f"Устойчивый рост нагрузки в г. {city.city_name}. "
            f"Балл пробок: {traffic_score}/10, скорость потока: {avg_speed} км/ч. "
        )
        if incidents:
            summary += f"Инциденты на: {inc_str}."
        else:
            summary += "Превышен порог загруженности ключевых коридоров."

        actions = [
            "Синхронизировать светофоры на магистралях с максимальной плотностью потока.",
            f"Опубликовать маршруты объезда ({alt_str}) в навигационных сервисах.",
            "Сместить дорожные работы на вечернее/ночное окно с низкой загрузкой.",
        ]
        if repair_roads:
            actions.append(
                f"Запланировать ремонт: {', '.join(r.road_name for r in repair_roads[:2])}."
            )

        reasoning = [
            f"Балл пробок {traffic_score}/10 выше среднего порога (>5) или обнаружены множественные инциденты.",
            f"Средняя скорость {avg_speed} км/ч — умеренное замедление движения.",
            f"Зафиксировано {len(incidents)} инцидент(ов) на дорожной сети.",
            "Приоритет MEDIUM назначен по правилу: score>5 ИЛИ ≥2 инцидентов ИЛИ есть ДТП.",
        ]
        data_sources = [
            f"Балл пробок: {traffic_score}/10",
            f"Средняя скорость: {avg_speed} км/ч",
            f"Активных инцидентов: {len(incidents)}",
        ]
        for inc in incidents[:3]:
            data_sources.append(f"{inc.type.value} на {inc.road_name}, серьёзность: {inc.severity.value}")
        if repair_roads:
            data_sources.append(f"Дороги требуют ремонта: {', '.join(r.road_name for r in repair_roads[:2])}")

        return AIInsight(
            summary=summary,
            priority=AIPriority.MEDIUM,
            actions=actions,
            confidence=0.78,
            model_version="rule-engine-v3.2",
            reasoning=reasoning,
            data_sources=data_sources,
        )

    # ── LOW priority ─────────────────────────────────────────────────────
    summary = (
        f"Транспортная обстановка в г. {city.city_name} стабильна. "
        f"Балл пробок: {traffic_score}/10, средняя скорость: {avg_speed} км/ч. "
        "Отклонения в пределах штатного режима."
    )

    actions = [
        "Сохранить текущий режим светофорной координации.",
        "Продолжать мониторинг инцидентов в реальном времени.",
        "Подготовить превентивный план на часы пик.",
    ]
    if repair_roads:
        actions.append(
            f"Рекомендован плановый ремонт: {', '.join(r.road_name for r in repair_roads[:2])}."
        )

    avg_wear = round(sum(r.wear_percent for r in road_conditions) / len(road_conditions)) if road_conditions else 0
    reasoning = [
        f"Балл пробок {traffic_score}/10 в пределах нормы (≤5), серьёзных отклонений не выявлено.",
        f"Средняя скорость {avg_speed} км/ч — нормальный режим движения.",
        f"Инцидентов: {len(incidents)}. Критических дорог: {len([r for r in road_conditions if r.condition == RoadCondition.CRITICAL])}.",
        "Приоритет LOW назначен: обстановка стабильна, отклонения в штатных пределах.",
    ]
    data_sources = [
        f"Балл пробок: {traffic_score}/10",
        f"Средняя скорость: {avg_speed} км/ч",
        f"Активных инцидентов: {len(incidents)}",
        f"Средний износ дорог: {avg_wear}%",
    ]
    if repair_roads:
        data_sources.append(f"Плановый ремонт рекомендован: {', '.join(r.road_name for r in repair_roads[:2])}")

    return AIInsight(
        summary=summary,
        priority=AIPriority.LOW,
        actions=actions,
        confidence=0.85,
        model_version="rule-engine-v3.2",
        reasoning=reasoning,
        data_sources=data_sources,
    )


# ── Main public API ─────────────────────────────────────────────────────────

def build_ai_insight(
    city: CityMeta,
    traffic_score: float,
    incidents: list[Incident],
    road_conditions: list[RoadSegmentCondition],
    avg_speed: int,
    congestion_trend: list[CongestionPoint] | None = None,
) -> AIInsight:
    """Build an AI insight — tries ChatGPT with RAG first, falls back to rules.

    The RAG context document contains ONLY verified data from our pipeline.
    The LLM is instructed to never invent facts beyond this document.
    """

    # 1. Try OpenAI ChatGPT with RAG
    if settings.use_openai:
        try:
            rag_context = build_city_context(
                city=city,
                traffic_score=traffic_score,
                avg_speed=avg_speed,
                incidents=incidents,
                road_conditions=road_conditions,
                congestion_trend=congestion_trend or [],
            )

            result = call_openai_insight(rag_context)

            if result is not None:
                return AIInsight(
                    summary=result["summary"],
                    priority=AIPriority(result["priority"]),
                    actions=result["actions"],
                    confidence=result["confidence"],
                    model_version=f"chatgpt-{settings.openai_model}",
                    reasoning=result.get("reasoning", []),
                    data_sources=result.get("data_sources", []),
                )

            logger.info("OpenAI returned None, falling back to rule engine")
        except Exception as exc:
            logger.warning("OpenAI pipeline error, falling back to rules: %s", exc)

    # 2. Fallback to deterministic rule engine
    return _fallback_rule_insight(
        city=city,
        traffic_score=traffic_score,
        incidents=incidents,
        road_conditions=road_conditions,
        avg_speed=avg_speed,
    )
