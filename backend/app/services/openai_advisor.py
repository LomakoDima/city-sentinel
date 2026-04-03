"""OpenAI ChatGPT integration with RAG for traffic advisory.

This module calls the OpenAI Chat Completions API with structured
city data injected as RAG context. The LLM is strictly instructed
to base every claim on the provided data document and output
valid JSON matching our AIInsight schema.

Anti-hallucination measures:
1. System prompt forbids inventing facts not present in the context.
2. All data is serialised from the verified pipeline (simulation or real API).
3. Response format is enforced via JSON mode + Pydantic validation.
4. Temperature is set low (0.3) to reduce creative drift.
5. Confidence is capped — the model must self-assess from data.
6. If parsing fails, we fall back to the deterministic rule engine.
"""

from __future__ import annotations

import json
import logging
from typing import Optional

from openai import OpenAI, APIError, APITimeoutError, RateLimitError

from app.config import settings

logger = logging.getLogger(__name__)

# ── Lazy singleton client ───────────────────────────────────────────────────

_client: Optional[OpenAI] = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=settings.openai_api_key,
            timeout=settings.openai_timeout,
        )
    return _client


# ── System prompts ──────────────────────────────────────────────────────────

SYSTEM_PROMPT_INSIGHT = """\
Ты — ИИ-аналитик системы мониторинга дорожной инфраструктуры «City Sentinel».
Твоя задача — проанализировать предоставленный ОТЧЁТ О ТРАНСПОРТНОЙ ОБСТАНОВКЕ и сформировать управленческое заключение.

СТРОГИЕ ПРАВИЛА:
1. Используй ТОЛЬКО факты из предоставленного отчёта. НЕ выдумывай данные, названия улиц, цифры или события, которых нет в отчёте.
2. Все упоминаемые улицы, показатели и инциденты ДОЛЖНЫ присутствовать в отчёте.
3. Если данных недостаточно для вывода — прямо скажи об этом, а не додумывай.
4. Отвечай на русском языке.
5. Будь конкретен: указывай названия улиц, числовые показатели, типы инцидентов из отчёта.
6. Твой анализ должен быть ОБЪЯСНИМЫМ — покажи пошагово, как ты пришёл к выводам.

Ты должен ответить СТРОГО в формате JSON (без markdown-обёрток) со следующей структурой:
{
  "summary": "<Краткое описание текущей ситуации, 2-4 предложения. Укажи город, балл пробок, скорость, ключевые проблемы>",
  "priority": "<high | medium | low>",
  "actions": ["<Конкретное действие 1>", "<Конкретное действие 2>", "<Конкретное действие 3>"],
  "confidence": <число от 0.0 до 1.0 — насколько ты уверен в своём анализе на основе полноты данных>,
  "reasoning": [
    "<Шаг 1: Какой ключевой показатель ты оценил и что он значит>",
    "<Шаг 2: Какие инциденты/проблемы ты обнаружил и их влияние>",
    "<Шаг 3: Как ты определил приоритет на основе данных>",
    "<Шаг 4: Почему именно эти действия рекомендованы>"
  ],
  "data_sources": [
    "<Конкретный факт из отчёта, например: 'Балл пробок: 7.2/10'>",
    "<Ещё факт: 'ДТП на проспект Абая, серьёзность: high'>",
    "<Ещё факт: 'Средний износ дорог: 35%'>"
  ]
}

Правила определения priority:
- "high": балл пробок > 8, ИЛИ есть ДТП с серьёзностью high, ИЛИ есть критические дороги
- "medium": балл пробок > 5, ИЛИ ≥ 2 инцидентов, ИЛИ есть ДТП
- "low": стабильная обстановка, балл пробок ≤ 5, мало или нет инцидентов

Правила для actions:
- От 3 до 5 конкретных действий
- Каждое действие должно ссылаться на реальные данные из отчёта (названия улиц, показатели)
- Действия должны быть практичными: перенаправление потоков, изменение светофоров, вызов служб, планирование ремонта
- Если есть свободные магистрали — предлагай их как альтернативные маршруты

Правила для reasoning:
- 3-5 шагов логической цепочки
- Каждый шаг ссылается на КОНКРЕТНЫЕ данные из отчёта
- Покажи связь: данные → вывод → решение

Правила для data_sources:
- Перечисли ВСЕ ключевые факты из отчёта, которые повлияли на твой анализ
- Каждый факт должен быть дословной цитатой или точной парафразой из отчёта
- Минимум 3, максимум 8 источников
"""

SYSTEM_PROMPT_INCIDENT = """\
Ты — ИИ-аналитик системы «City Sentinel». Тебе дано описание одного дорожного инцидента.

СТРОГИЕ ПРАВИЛА:
1. Используй ТОЛЬКО факты из предоставленного описания инцидента.
2. НЕ выдумывай улицы, данные или обстоятельства, которых нет в описании.
3. Отвечай на русском языке.
4. Рекомендация должна быть одним конкретным предложением (1-2 фразы).
5. Ссылайся на реальные названия улиц из описания.

Ответь СТРОГО в формате JSON (без markdown-обёрток):
{
  "recommendation": "<Одна конкретная рекомендация по данному инциденту>"
}
"""


# ── Public API ──────────────────────────────────────────────────────────────

def call_openai_insight(rag_context: str) -> Optional[dict]:
    """Call OpenAI to generate an AIInsight from RAG context.

    Returns parsed dict with keys: summary, priority, actions, confidence.
    Returns None on any error (caller should fall back to rule engine).
    """
    if not settings.use_openai:
        return None

    try:
        client = _get_client()
        response = client.chat.completions.create(
            model=settings.openai_model,
            temperature=0.3,
            max_tokens=1200,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT_INSIGHT},
                {"role": "user", "content": f"Вот отчёт для анализа:\n\n{rag_context}"},
            ],
        )

        raw = response.choices[0].message.content
        if not raw:
            logger.warning("OpenAI returned empty content")
            return None

        data = json.loads(raw)

        # Validate required fields
        if not all(k in data for k in ("summary", "priority", "actions", "confidence")):
            logger.warning("OpenAI response missing required fields: %s", list(data.keys()))
            return None

        # Default explainability fields if LLM omitted them
        if "reasoning" not in data or not isinstance(data["reasoning"], list):
            data["reasoning"] = []
        if "data_sources" not in data or not isinstance(data["data_sources"], list):
            data["data_sources"] = []

        # Validate priority enum
        if data["priority"] not in ("high", "medium", "low"):
            logger.warning("OpenAI returned invalid priority: %s", data["priority"])
            return None

        # Validate actions is a list of strings
        if not isinstance(data["actions"], list) or not all(isinstance(a, str) for a in data["actions"]):
            logger.warning("OpenAI returned invalid actions format")
            return None

        # Clamp confidence
        try:
            conf = float(data["confidence"])
            data["confidence"] = max(0.0, min(1.0, conf))
        except (ValueError, TypeError):
            data["confidence"] = 0.75

        logger.info(
            "OpenAI insight generated: priority=%s, actions=%d, confidence=%.2f",
            data["priority"], len(data["actions"]), data["confidence"],
        )
        return data

    except (APIError, APITimeoutError, RateLimitError) as exc:
        logger.warning("OpenAI API error: %s", exc)
        return None
    except json.JSONDecodeError as exc:
        logger.warning("OpenAI returned invalid JSON: %s", exc)
        return None
    except Exception as exc:
        logger.error("Unexpected OpenAI error: %s", exc, exc_info=True)
        return None


def call_openai_incident_recommendation(rag_context: str) -> Optional[str]:
    """Call OpenAI to generate a single incident recommendation.

    Returns the recommendation string or None on error.
    """
    if not settings.use_openai:
        return None

    try:
        client = _get_client()
        response = client.chat.completions.create(
            model=settings.openai_model,
            temperature=0.3,
            max_tokens=200,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT_INCIDENT},
                {"role": "user", "content": rag_context},
            ],
        )

        raw = response.choices[0].message.content
        if not raw:
            return None

        data = json.loads(raw)
        rec = data.get("recommendation", "")
        if isinstance(rec, str) and len(rec) > 5:
            return rec

        return None

    except (APIError, APITimeoutError, RateLimitError) as exc:
        logger.warning("OpenAI incident rec error: %s", exc)
        return None
    except json.JSONDecodeError:
        return None
    except Exception as exc:
        logger.error("Unexpected OpenAI incident error: %s", exc, exc_info=True)
        return None
