# City Sentinel — NexaCity OS v3.2

## Полное описание проекта

> **City Sentinel** — интеллектуальная платформа мониторинга и управления дорожной инфраструктурой 20 крупнейших городов Казахстана.  
> Система объединяет реальную геометрию дорог, симуляцию трафика, WebSocket-стриминг событий и ИИ-аналитику (RAG + ChatGPT) в единый дашборд реального времени.

---

# Часть 1. Нетехническое описание

## 1.1 Что это такое?

**City Sentinel** — это веб-приложение, которое работает как «нервная система» города: собирает данные о дорожном движении, инцидентах, состоянии покрытия и предоставляет оператору полную картину происходящего в одном интерфейсе.

Представьте диспетчерскую центра управления дорожным движением, где на одном экране вы видите:

- **Пробки** — балл загруженности от 0 (свободно) до 10 (коллапс) с цветовой индикацией на карте.
- **Скорость потока** — средняя скорость движения автомобилей в городе прямо сейчас.
- **Инциденты** — ДТП, дорожные работы, перекрытия, заторы, погодные условия, полицейские операции — всё с привязкой к конкретным улицам и координатами на карте.
- **Состояние дорог** — процент износа каждой магистрали (хорошее / удовлетворительное / требует ремонта / критическое).
- **Тренд за 12 часов** — график, показывающий как менялась загруженность в течение дня.
- **ИИ-рекомендации** — искусственный интеллект анализирует все данные и выдаёт конкретные рекомендации: куда перенаправить потоки, какие светофоры перенастроить, где запланировать ремонт.
- **Живые события** — инциденты появляются и исчезают на карте в реальном времени, с обратным отсчётом до снятия.

## 1.2 Какие города поддерживаются?

Система охватывает **20 крупнейших городов Казахстана** (население от 85 тысяч до 2.1 миллиона):

| Город | Население | Город | Население |
|---|---|---|---|
| Алматы | 2 100 000 | Семей | 340 000 |
| Астана | 1 400 000 | Усть-Каменогорск | 330 000 |
| Шымкент | 1 150 000 | Орал | 310 000 |
| Актобе | 520 000 | Кызылорда | 270 000 |
| Караганда | 500 000 | Костанай | 250 000 |
| Павлодар | 370 000 | Петропавловск | 220 000 |
| Тараз | 360 000 | Туркестан | 210 000 |
| Атырау | 350 000 | Актау | 200 000 |
| Кокшетау | 170 000 | Талдыкорган | 160 000 |
| Экибастуз | 135 000 | Жезказган | 85 000 |

Для каждого города задан индивидуальный профиль: координаты центра, список реальных магистралей (от 4 до 8 дорог), профиль загруженности по часам, коэффициент нагрузки, привязанный к населению.

## 1.3 Для кого предназначена система?

- **Городские администрации и акиматы** — оперативный контроль дорожной обстановки, принятие решений на основе данных, а не интуиции.
- **Диспетчерские центры** — мониторинг инцидентов 24/7, координация экстренных служб, рассылка оповещений населению.
- **Аналитики и урбанисты** — изучение паттернов загруженности, планирование инфраструктуры, обоснование бюджетов на ремонт.
- **Граждане** — информирование о текущих пробках, авариях и перекрытиях.
- **Дорожные службы** — приоритизация ремонтных работ на основе данных об износе.

## 1.4 Что видит пользователь? (Страницы)

### Лендинг (`/`)
Промо-страница в стиле premium SaaS: анимированный заголовок «The city thinks.», карточки метрик (12.4M citizens connected, 99.7% uptime, 340K+ IoT sensors), описание 4 ключевых возможностей (Traffic Intelligence, Environmental Sentinel, Smart Grid, AI Command Center), таймлайн истории проекта (2021–2025), call-to-action «Открыть дашборд».

### Авторизация (`/auth`)
Двухпанельная страница: слева — декоративная панель с градиентами, анимированными орбами и мини-статистикой (20 городов, 24/7 мониторинг, AI аналитика); справа — форма входа/регистрации с переключением режимов, показом/скрытием пароля, заглушками для Google/GitHub OAuth и **кнопкой демо-аккаунта** (один клик — авторизация без регистрации: `demo@citysentinel.kz` / `demo123`).

### Главный дашборд (`/dashboard`)
Основной рабочий экран оператора. Разделён на:
1. **Боковая панель (Sidebar)** — навигация, выпадающий список для выбора одного из 20 городов, секция аккаунта.
2. **Верхняя строка состояния (StatusBar)** — текущий город, статус системы.
3. **4 KPI-карточки (MiniStatCards)** — балл пробок (0–10 с цветовой шкалой), средняя скорость (км/ч), количество активных инцидентов, состояние дорог (%).
4. **Карта Казахстана (KazakhstanCityMaps)** — карта всей страны с GeoJSON-границей и маркерами 20 городов; клик по маркеру переключает дашборд на выбранный город.
5. **Карта трафика (TrafficMapContainer)** — детальная карта выбранного города на тайлах CartoDB Voyager с:
   - Цветными полилиниями дорог (зелёный = свободно, оранжевый = затруднение, красный = пробка).
   - Маркерами инцидентов (кастомные SVG-иконки: ДТП, ремонт, перекрытие, затор, погода, полиция).
   - **Live-маркерами** из WebSocket с бейджем «LIVE» и пульсирующей анимацией для новых событий.
   - Легендой с индикатором WebSocket-подключения.
   - Боковой панелью ИИ-анализа выбранного инцидента (при клике на маркер).
6. **График тренда (LineChartPanel)** — AreaChart загруженности за 12 часов (07:00–18:00).
7. **ИИ-панель (AIInsightsPanel)** — рекомендации от ChatGPT (или rule-engine): резюме, приоритет, список действий, уверенность модели, пошаговая логика, источники данных.
8. **7 аналитических графиков (DashboardCharts)** — скорость/объём, круговая диаграмма инцидентов, радарная карта, радиальная шкала, недельная загрузка, пробки vs скорость, экология.

### Карта городов (`/dashboard/map`)
Полноэкранная интерактивная карта всего Казахстана с:
- GeoJSON-границей страны (пунктирная линия).
- Маркерами всех 20 городов (кастомные div-иконки с подсветкой выбранного).
- Popup при клике (название, координаты, население).
- FlyTo-анимацией при выборе города.
- Боковой инфо-панелью: население, площадь, статус нагрузки, кнопка «Открыть дашборд».
- Прокручиваемый список всех 20 городов.

### Настройки (`/dashboard/settings`)
Профиль пользователя, уведомления, тема оформления, язык, интервал обновления, безопасность.

## 1.5 Как работают «живые события»?

Система поддерживает постоянное WebSocket-соединение с бэкендом. Вот что происходит:

1. При подключении клиент получает **снапшот** — список всех текущих активных событий.
2. Каждые 3 секунды бэкенд отправляет **обновление**: какие события появились и какие истекли.
3. Новые события появляются на карте с анимацией и бейджем «LIVE» (5 секунд).
4. События высокой серьёзности (high/critical) показывают пульсирующее кольцо.
5. У каждого события есть обратный отсчёт (remaining_seconds) — когда он дойдёт до нуля, событие исчезнет с карты.
6. Если соединение оборвётся — автоматическое переподключение через 3 секунды.

## 1.6 Как работает ИИ-советник?

Когда пользователь открывает дашборд города, система:

1. Собирает все данные: балл пробок, скорость, список инцидентов с привязкой к улицам, состояние каждой дороги, тренд загруженности.
2. Формирует **структурированный отчёт** на русском языке (~2000 символов) — это RAG-документ.
3. Отправляет отчёт в **ChatGPT (GPT-4o-mini)** с жёстким промптом: «анализируй ТОЛЬКО то, что в отчёте, ничего не выдумывай».
4. ChatGPT возвращает JSON: резюме ситуации, приоритет (HIGH/MEDIUM/LOW), 3–5 конкретных действий, уверенность (0.0–1.0), пошаговую логику принятия решения и список фактов-источников.
5. Если ChatGPT недоступен (нет ключа, таймаут, ошибка) — система **автоматически** переключается на встроенный rule-based engine, который генерирует аналогичные рекомендации по правилам.

Пользователь всегда видит, какая модель сгенерировала рекомендацию: `chatgpt-gpt-4o-mini` или `rule-engine-v3.2`.

---

# Часть 2. Техническое описание

## 2.1 Высокоуровневая архитектура

```
┌─────────────────────────────────────────────────────────────────┐
│  Клиент (Browser)                                               │
│  React 18 SPA · Vite · TypeScript                                │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────────┐ │
│  │ Landing  │  │   Auth   │  │  Dashboard  │  │ CityMapPage  │ │
│  └──────────┘  └──────────┘  └──────┬──────┘  └──────────────┘ │
│                                      │                           │
│            ┌─────────────────────────┼───────────────┐           │
│            │ React Query (polling)   │ WebSocket      │           │
│            │ GET /api/traffic/{id}   │ ws://…/events  │           │
│            │ GET /api/map-data/{id}  │                │           │
└────────────┼─────────────────────────┼───────────────┼───────────┘
             │ HTTP (REST)             │ WS             │
┌────────────┼─────────────────────────┼───────────────┼───────────┐
│  Бэкенд (Python)                                                 │
│  FastAPI · Uvicorn · ASGI                                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Routers                                                     │ │
│  │  traffic.py ──→ services/traffic.py ──→ TrafficResponse     │ │
│  │  websocket.py ──→ services/realtime_events.py (EventStore)  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Services                                                    │ │
│  │  simulation.py     ── Генерация реалистичных данных          │ │
│  │  ai_advisor.py     ── Оркестратор: ChatGPT → fallback rules │ │
│  │  openai_advisor.py ── OpenAI Chat Completions API           │ │
│  │  rag_context.py    ── RAG Context Builder                   │ │
│  │  map_data.py       ── Полилинии + обогащённые инциденты     │ │
│  │  osrm_router.py    ── OSRM + кэш геометрии дорог           │ │
│  │  realtime_events.py── EventStore (spawn/expire/TTL)         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────┐  ┌──────────────────────┐                 │
│  │ data/cities.py    │  │ _geometry_cache/*.json│                 │
│  │ 20 CityMeta       │  │ OSRM polylines       │                 │
│  │ CONGESTION_PROFILES│  │ 20 городов × N дорог │                 │
│  └───────────────────┘  └──────────────────────┘                 │
│                                                                  │
│            │ HTTPS                                                │
│            ▼                                                     │
│  ┌───────────────────┐  ┌───────────────────┐                    │
│  │ OSRM Demo Server  │  │ OpenAI API        │                    │
│  │ (road geometry)   │  │ (ChatGPT RAG)     │                    │
│  └───────────────────┘  └───────────────────┘                    │
└──────────────────────────────────────────────────────────────────┘
```

Проект состоит из двух полностью независимых частей:
- **Frontend** — React SPA, собирается Vite, деплоится на Vercel.
- **Backend** — Python FastAPI, запускается Uvicorn, отдаёт REST + WebSocket.

Связь: фронтенд обращается к бэкенду через `VITE_API_BASE_URL` (по умолчанию `http://127.0.0.1:8080`).

---

## 2.2 Frontend

### Стек технологий

| Технология | Версия | Назначение |
|---|---|---|
| **React** | 18.3 | UI-фреймворк (functional components, hooks) |
| **TypeScript** | 5.8 | Статическая типизация |
| **Vite** | 5.4 + SWC plugin | Сборка, HMR, tree-shaking |
| **TailwindCSS** | 3.4 | Утилитарная CSS-система |
| **shadcn/ui** (Radix UI) | — | 25+ UI-примитивов (Select, Tooltip, Toast, Dialog, Tabs, Accordion, Switch, Progress, ScrollArea и др.) |
| **Recharts** | 2.15 | 7 типов графиков (BarChart, PieChart, RadarChart, AreaChart, LineChart, RadialBarChart, ComposedChart) |
| **Leaflet** | 1.9 + react-leaflet 4.2 | Интерактивные карты (OpenStreetMap tiles, CartoDB Voyager tiles, GeoJSON, Polyline, Marker, Popup) |
| **Framer Motion** | 12.38 | Декларативные анимации (page transitions, micro-interactions, scroll-in-view) |
| **TanStack React Query** | 5.83 | Серверный state: автоматическое кэширование, refetch по интервалу (30 сек трафик, 60 сек карта), дедупликация запросов |
| **React Router DOM** | 6.30 | SPA-маршрутизация (6 роутов) |
| **Lucide React** | 0.462 | Иконки (30+ используемых) |
| **Zod** | 3.25 | Схемы валидации |
| **React Hook Form** | 7.61 | Управляемые формы |
| **date-fns** | 3.6 | Форматирование дат |
| **Sonner** | 1.7 | Toast-уведомления |
| **Vitest** | 3.2 + Testing Library | Юнит-тесты |
| **Playwright** | 1.57 | E2E-тесты |

### Файловая структура фронтенда

```
src/
├── main.tsx                    # Точка входа, рендер App
├── App.tsx                     # QueryClientProvider + BrowserRouter + 6 роутов
├── App.css                     # Глобальные стили, CSS-анимации маркеров
├── index.css                   # TailwindCSS base/components/utilities
├── vite-env.d.ts               # Типы Vite env
│
├── pages/
│   ├── Landing.tsx             # Промо-лендинг (Framer Motion секции)
│   ├── Auth.tsx                # Логин/Регистрация (animated form)
│   ├── Index.tsx               # Главный дашборд (оркестрирует все компоненты)
│   ├── CityMapPage.tsx         # Полноэкранная карта Казахстана
│   ├── SettingsPage.tsx        # Настройки пользователя
│   └── NotFound.tsx            # 404
│
├── components/
│   ├── NavLink.tsx             # Навигационная ссылка
│   ├── ui/                     # 25+ shadcn/ui компонентов (автогенерация)
│   └── dashboard/
│       ├── Sidebar.tsx         # Боковая панель (навигация + Select города + аккаунт)
│       ├── StatusBar.tsx       # Верхняя строка (город, время, системный статус)
│       ├── MiniStatCards.tsx   # 4 KPI: пробки, скорость, инциденты, дороги
│       ├── KPICard.tsx         # Переиспользуемый компонент одной KPI-карточки
│       ├── KazakhstanCityMaps.tsx  # Карта РК с GeoJSON-границей и 20 маркерами
│       ├── TrafficMapContainer.tsx # Карта трафика города (polylines + markers + WS live events)
│       ├── CityMap.tsx         # Обёртка MapContainer
│       ├── IncidentAnalysisPanel.tsx # Боковая панель AI-анализа инцидента
│       ├── LineChartPanel.tsx  # AreaChart 12ч тренда
│       ├── AIInsightsPanel.tsx # Панель AI-рекомендаций (вкладки: Анализ, Действия, История)
│       └── DashboardCharts.tsx # 7 графиков Recharts
│
├── hooks/
│   ├── useRealtimeEvents.ts   # WebSocket хук (snapshot → updates → reconnect)
│   ├── use-mobile.tsx         # Определение мобильного устройства
│   └── use-toast.ts           # Toast notifications хук
│
├── lib/
│   ├── traffic.ts             # Типы (CityId, TrafficResponse, MapDataResponse),
│   │                          # маппинги (cityLabelMap, cityCenterMap), API (fetchTraffic, fetchMapData)
│   └── utils.ts               # Утилиты (cn для classNames)
│
└── data/
    └── kazakhstan-border.ts   # GeoJSON Feature<Polygon> границы Казахстана
```

### Механизм получения данных

**React Query** управляет всеми запросами к бэкенду:

- `fetchTraffic(cityId)` → `GET /api/traffic/{city_id}` — вызывается каждые **30 секунд** (`refetchInterval: 30000`). Возвращает `TrafficResponse` с полным набором данных: score, speed, incidents, road conditions, trend, AI insight.
- `fetchMapData(cityId)` → `GET /api/map-data/{city_id}` — вызывается каждые **60 секунд** (`refetchInterval: 60000`). Возвращает полилинии с congestion level и обогащённые инциденты с AI-рекомендациями.

**WebSocket** (`useRealtimeEvents` хук):
- Подключается к `ws://{API_BASE}/ws/events/{city_id}`.
- Получает `snapshot` при подключении, затем `update` каждые ~3 сек.
- Ведёт `Set<string>` отслеживания новых event ID для 5-секундной анимации «LIVE».
- При смене города — переподключение. При обрыве — реконнект через 3 сек.

### Карта трафика (TrafficMapContainer) — подробности

Самый сложный компонент системы (`378 строк`):

1. **Тайлы**: CartoDB Voyager (показывает реки, парки, рельеф).
2. **Полилинии**: каждая дорога из OSRM-кэша рисуется `<Polyline>` с цветом по congestion level:
   - `#55AA00` (зелёный) = `free`
   - `#FF8000` (оранжевый) = `slow`
   - `#FF0000` (красный) = `heavy`
3. **Маркеры инцидентов** (из REST API): кастомные `L.divIcon` с inline SVG-иконками (6 типов: авто, ремонт, перекрытие, часы-затор, облако-погода, щит-полиция). High-severity маркеры имеют пульсирующее кольцо (CSS-анимация `incident-pulse-ring`).
4. **Live-маркеры** (из WebSocket): аналогичные иконки, но с бейджем «LIVE» для новых и CSS-классом `live-event-appear`.
5. **Popup**: при клике — детальная информация (тип, время, улица, описание, задержка).
6. **IncidentAnalysisPanel**: при клике на маркер инцидента справа открывается AI-анализ с персональной рекомендацией.
7. **Легенда**: внизу слева — цветовая шкала + индикатор WS-подключения + счётчик live-событий.

---

## 2.3 Backend

### Стек технологий

| Технология | Версия | Назначение |
|---|---|---|
| **FastAPI** | ≥0.110 | REST API + WebSocket фреймворк, автодокументация (Swagger UI) |
| **Uvicorn** | ≥0.27 | ASGI-сервер (HTTP/1.1 + WebSocket) |
| **Pydantic** | ≥2.6 (v2) | Схемы данных, валидация, сериализация JSON |
| **Pydantic Settings** | ≥2.1 | Конфигурация из `.env` файла |
| **OpenAI** | ≥1.30 | Chat Completions API (GPT-4o-mini) |
| **HTTPX** | ≥0.27 | Async HTTP-клиент (OSRM запросы) |
| **Requests** | ≥2.31 | Sync HTTP-клиент (заглушки Yandex/2GIS) |
| **Polyline** | ≥2.0 | Декодирование Google Polyline формата из OSRM |
| **python-dotenv** | ≥1.0 | Загрузка `.env` |

### Файловая структура бэкенда

```
backend/
├── main.py                      # FastAPI app factory, CORS middleware, роутеры, /health
├── requirements.txt             # 9 зависимостей с version ranges
├── .env                         # Переменные окружения
├── warmup_cache.py              # Скрипт прогрева OSRM-кэша для всех 20 городов
│
└── app/
    ├── __init__.py
    ├── config.py                # Pydantic Settings: 11 параметров из .env
    │                            #   + computed properties: cors_origin_list, use_real_traffic_api, use_openai
    │
    ├── models/
    │   └── schemas.py           # 13 Pydantic-моделей:
    │                            #   Enums: IncidentType(3), IncidentSeverity(3), RoadCondition(4), AIPriority(3)
    │                            #   Models: CityCenter, Incident, RoadSegmentCondition, CongestionPoint,
    │                            #           AIInsight (с reasoning + data_sources для XAI),
    │                            #           TrafficResponse, CityListItem, LatLng,
    │                            #           TrafficPolyline, MapIncident, MapDataResponse, HealthResponse
    │
    ├── data/
    │   ├── cities.py            # CityMeta dataclass + CITIES dict (20 городов):
    │   │                        #   city_id, city_name, lat, lng, population, major_roads[]
    │   │                        #   + CONGESTION_PROFILES — 12-часовые профили загрузки для каждого города
    │   ├── road_geometry.py     # RoadWaypoints / RoadSegment dataclasses
    │   │                        #   + get_road_waypoints(city_id) → вейпоинты для OSRM
    │   └── _geometry_cache/     # Предзаполненный кэш: {city_id}_roads.json
    │                            #   Структура: {road_name: [[lat, lng], ...]}
    │
    ├── routers/
    │   ├── traffic.py           # 3 REST эндпоинта:
    │   │                        #   GET /api/traffic/{city_id} → TrafficResponse
    │   │                        #   GET /api/map-data/{city_id} → MapDataResponse
    │   │                        #   GET /api/cities → list[CityListItem]
    │   └── websocket.py         # 2 WS эндпоинта:
    │                            #   WS /ws/events/{city_id} → стрим одного города
    │                            #   WS /ws/events → стрим всех городов
    │
    └── services/
        ├── traffic.py           # Оркестратор TrafficResponse:
        │                        #   1. traffic_score (Yandex API → fallback simulation)
        │                        #   2. avg_speed (derived)
        │                        #   3. incidents (simulation)
        │                        #   4. road_conditions (simulation)
        │                        #   5. congestion_trend (simulation)
        │                        #   6. ai_insight (ChatGPT RAG → fallback rules)
        │
        ├── simulation.py        # Движок симуляции (212 строк):
        │                        #   _seeded_rng() — детерминированный RNG (SHA-256, 5-мин bucket)
        │                        #   _current_hour_factor() — rush-hour Gaussian curve
        │                        #   _population_factor() — 0.3–1.0 по населению
        │                        #   simulate_traffic_score() → float 0–10
        │                        #   simulate_avg_speed() → int км/ч (60 - score*5.2)
        │                        #   simulate_incidents() → list[Incident] (0–5 шт., 3 типа, 3 severity)
        │                        #   simulate_road_conditions() → (percent, list[RoadSegmentCondition])
        │                        #   simulate_congestion_trend() → list[CongestionPoint] (12 часов)
        │
        ├── ai_advisor.py        # ИИ-оркестратор (270 строк):
        │                        #   build_ai_insight() — публичный API
        │                        #   Пытается ChatGPT с RAG → при ошибке → rule-based engine
        │                        #   Правила: HIGH (score>8 | ДТП+high), MEDIUM (score>5 | ≥2 инц.), LOW
        │                        #   Каждый уровень генерирует: summary, actions[], reasoning[], data_sources[]
        │
        ├── openai_advisor.py    # OpenAI клиент (232 строки):
        │                        #   Lazy singleton OpenAI client
        │                        #   SYSTEM_PROMPT_INSIGHT (~100 строк) — жёсткие правила для LLM
        │                        #   SYSTEM_PROMPT_INCIDENT — промпт для рекомендации по инциденту
        │                        #   call_openai_insight(rag_context) → dict | None
        │                        #   call_openai_incident_recommendation(rag_context) → str | None
        │                        #   Валидация: JSON parse → required fields → priority enum → actions type → clamp confidence
        │
        ├── rag_context.py       # RAG Context Builder (172 строки):
        │                        #   build_city_context() — полный отчёт города (~2000 символов):
        │                        #     Заголовок, ключевые показатели, дорожная сеть,
        │                        #     активные инциденты, состояние покрытия, тренд, свободные магистрали
        │                        #   build_incident_context() — фокусный контекст одного инцидента
        │
        ├── map_data.py          # Сборка MapDataResponse (174 строки):
        │                        #   _assign_congestion() — присвоение free/slow/heavy по traffic_score
        │                        #   _enrich_incidents() — добавление timestamp, delay, AI recommendation
        │                        #   get_map_data(city_id) — публичный API
        │                        #   Fallback-шаблоны рекомендаций (если OpenAI недоступен):
        │                        #     3 шаблона для ДТП, 3 для ремонта, 3 для перекрытия
        │
        ├── osrm_router.py       # OSRM-интеграция (150 строк):
        │                        #   resolve_city_roads(city_id) → list[RoadSegment]
        │                        #   1. Проверяет JSON-кэш в _geometry_cache/
        │                        #   2. Если нет — отправляет waypoints в OSRM /route/v1/driving
        │                        #   3. Декодирует Google Polyline → [[lat, lng], ...]
        │                        #   4. Сохраняет кэш на диск
        │                        #   Rate-limit: 1 req/sec к OSRM demo серверу
        │
        └── realtime_events.py   # Движок live-событий (357 строк):
                                 #   EventType(6): ДТП, ремонт, перекрытие, затор, погода, полиция
                                 #   EventSeverity(4): low, medium, high, critical
                                 #   EVENT_DESCRIPTIONS: 7 шаблонов ДТП, 5 ремонт, 5 перекрытие,
                                 #                       5 затор, 5 погода, 4 полиция — итого 31 шаблон
                                 #   EVENT_TTL_RANGES: от 3 мин (затор) до 4 часов (ремонт)
                                 #   EVENT_TYPE_WEIGHTS: затор 35%, ДТП 25%, погода 12%, ...
                                 #   SEVERITY_WEIGHTS: low 40%, medium 30%, high 20%, critical 10%
                                 #
                                 #   LiveEvent dataclass: id, city_id, type, severity, lat, lng,
                                 #     road_name, description, created_at, expires_at, delay_minutes
                                 #
                                 #   RealtimeEventStore (singleton):
                                 #     tick() — expire old, maybe spawn new (hour-based probability)
                                 #     get_city_events(city_id) → list[dict]
                                 #     get_all_events() → dict[str, list[dict]]
                                 #     Координаты из OSRM-кэша (реальные точки на дорогах)
                                 #     Max events per city: pop_factor * 12
```

### REST API — подробная спецификация

#### `GET /api/traffic/{city_id}` → `TrafficResponse`

Полный набор данных о трафике города. Включает:

```json
{
  "city_id": "almaty",
  "city_name": "Алматы",
  "center": {"lat": 43.222, "lng": 76.851},
  "traffic_score": 7.2,         // 0–10, с шагом 0.1
  "avg_speed_kmh": 23,          // км/ч, обратная зависимость от score
  "incidents": [                // 0–5 инцидентов
    {
      "type": "ДТП",            // "ДТП" | "ремонт" | "перекрытие"
      "severity": "high",       // "low" | "medium" | "high"
      "lat": 43.2315, "lng": 76.8623,
      "road_name": "проспект Абая",
      "description": "Столкновение двух автомобилей, занята правая полоса."
    }
  ],
  "road_condition_percent": 72,  // 0–100, общее состояние (100 - avg_wear)
  "road_conditions": [           // по каждой магистрали
    {
      "road_name": "проспект Аль-Фараби",
      "condition": "fair",       // "good" | "fair" | "repair_needed" | "critical"
      "wear_percent": 22         // 0–80
    }
  ],
  "congestion_trend_12h": [      // 12 точек (07:00–18:00)
    {"hour": "07:00", "score": 6.1},
    {"hour": "08:00", "score": 7.2}
  ],
  "ai_insight": {
    "summary": "Критическая загруженность в г. Алматы...",
    "priority": "high",          // "high" | "medium" | "low"
    "actions": ["Перенаправить поток...", "Увеличить цикл зелёного..."],
    "confidence": 0.92,          // 0.0–1.0
    "model_version": "chatgpt-gpt-4o-mini",  // или "rule-engine-v3.2"
    "reasoning": ["Шаг 1: Балл пробок 7.2/10...", "Шаг 2: ..."],
    "data_sources": ["Балл пробок: 7.2/10", "ДТП на проспект Абая..."]
  }
}
```

#### `GET /api/map-data/{city_id}` → `MapDataResponse`

GIS-данные для отрисовки на карте:

```json
{
  "city_id": "almaty",
  "city_name": "Алматы",
  "center": {"lat": 43.222, "lng": 76.851},
  "zoom": 13,                   // 13 для городов >1M, 12 для остальных
  "polylines": [                // реальная геометрия дорог из OSRM
    {
      "road_name": "проспект Аль-Фараби",
      "coords": [[43.222, 76.851], [43.223, 76.852], ...],  // десятки–сотни точек
      "congestion_level": "slow" // "free" | "slow" | "heavy"
    }
  ],
  "incidents": [                // обогащённые инциденты
    {
      "id": "a3f2b1c8",
      "type": "ДТП",
      "severity": "high",
      "lat": 43.2315, "lng": 76.8623,
      "road_name": "проспект Абая",
      "description": "...",
      "timestamp": "14:32",      // время события (HH:MM)
      "delay_minutes": 25,       // задержка в минутах
      "ai_recommendation": "Перенаправить потоки с проспект Абая через ВОАД..."
    }
  ]
}
```

#### `GET /api/cities` → `list[CityListItem]`

```json
[
  {"city_id": "aktau", "city_name": "Актау", "center": {"lat": 43.651, "lng": 51.158}, "population": 200000},
  {"city_id": "aktobe", "city_name": "Актобе", "center": {"lat": 50.279, "lng": 57.207}, "population": 520000}
]
```

#### `GET /health` → `HealthResponse`

```json
{"status": "ok", "version": "1.0.0", "simulation_enabled": true, "cities_available": 20}
```

### WebSocket — подробный протокол

#### `WS /ws/events/{city_id}`

**При подключении (snapshot):**
```json
{
  "type": "snapshot",
  "city_id": "almaty",
  "events": [
    {
      "id": "a3f2b1c8d9",
      "city_id": "almaty",
      "type": "ДТП",
      "severity": "high",
      "lat": 43.2315, "lng": 76.8623,
      "road_name": "проспект Абая",
      "description": "Столкновение двух автомобилей...",
      "timestamp": "14:32",
      "delay_minutes": 25,
      "remaining_seconds": 1340,
      "is_new": false
    }
  ]
}
```

**Периодические обновления (каждые ~3 сек):**
```json
{
  "type": "update",
  "city_id": "almaty",
  "new": [{ /* новое событие */ }],
  "expired": ["a3f2b1c8d9"],  // ID удалённых событий
  "total_active": 5
}
```

#### `WS /ws/events` (все города)

Snapshot: `{"type": "snapshot", "events": {"almaty": [...], "astana": [...]}}`
Update: `{"type": "update", "new_by_city": {"almaty": [...]}, "expired": ["id1", "id2"]}`

---

## 2.4 Движок симуляции — детальное описание

### Принцип детерминированности

Функция `_seeded_rng(city_id, bucket_minutes=5)`:
1. Берёт текущее время в UTC+5 (Казахстан).
2. Округляет до 5-минутного окна (bucket): `12:37` → `12:35`.
3. Формирует строку `"{city_id}:{bucket_iso}"`.
4. Вычисляет SHA-256 хеш, берёт первые 16 hex-символов как seed.
5. Создаёт `random.Random(seed)`.

**Результат**: в пределах одного 5-минутного окна все запросы к одному городу возвращают идентичные данные. Через 5 минут данные автоматически обновляются.

### Формула трафика

```
traffic_score = current_hour_factor() × 10 × population_factor + gaussian_noise(σ=0.5)
```

- `current_hour_factor()`: Гауссовы кривые с пиками в 08:30 и 17:30, минимум 0.05 в 03:00.
- `population_factor(pop)`: `clamp(pop / 2_100_000, 0.3, 1.0)` — Алматы = 1.0, Жезказган ≈ 0.3.
- `avg_speed`: `60 - score × 5.2` (score 0 → 60 км/ч, score 10 → 8 км/ч).

### Генерация инцидентов

- Ожидаемое количество: `λ = score × pop_factor × 0.35`, фактическое: `randint(0, max(1, round(λ)))`, max 5.
- Типы: ДТП, ремонт, перекрытие (равновероятно).
- Severity weights: low 50%, medium 35%, high 15%.
- Каждый инцидент привязан к уникальной дороге из `city.major_roads`.
- Координаты: ±0.015° lat, ±0.02° lng от центра (≈2 км).
- 5 шаблонов описания для каждого типа (на русском).

### Состояние дорог

Для каждой дороги:
- `base_wear = randint(5, 35) × pop_factor + gaussian(σ=5)`, clamp 2–80.
- `wear < 15` → good, `< 30` → fair, `< 55` → repair_needed, `≥ 55` → critical.
- `road_condition_percent = 100 - avg_wear` (общее состояние).

### Live-события (RealtimeEventStore)

6 типов с весами: затор 35%, ДТП 25%, погода 12%, ремонт 10%, полиция 10%, перекрытие 8%.

4 уровня серьёзности: low 40%, medium 30%, high 20%, critical 10%.

TTL: от 3 мин (затор) до 4 часов (ремонт).

Частота генерации: `interval = max(5, 30 - activity × 20 × pop_factor)` секунд.

Вероятность создания: `spawn_chance = activity × pop_factor × 0.6`.

Координаты: берутся с реальных точек из OSRM-кэша + jitter ±30м.

31 шаблон описания на русском (7 для ДТП, 5 для ремонта, 5 для перекрытия, 5 для затора, 5 для погоды, 4 для полиции).

---

## 2.5 ИИ-советник с RAG + ChatGPT — детальное описание

### RAG Context Builder (`rag_context.py`)

Функция `build_city_context()` формирует текстовый отчёт из 7 секций:

1. **Заголовок** — город, координаты, население, время.
2. **Ключевые показатели** — балл пробок, скорость, количество инцидентов, статистика дорог (хор./удовл./ремонт/крит.), средний износ.
3. **Дорожная сеть** — перечень всех магистралей города.
4. **Активные инциденты** — каждый с типом, серьёзностью, улицей, координатами, описанием.
5. **Состояние покрытия** — каждый сегмент с названием, состоянием и процентом износа.
6. **Тренд загруженности** — 12 часов с ASCII-гистограммой (█).
7. **Свободные магистрали** — дороги без инцидентов (для рекомендаций объездов).

Функция `build_incident_context()` — фокусный контекст одного инцидента (для per-incident рекомендаций на карте).

### System Prompt (OpenAI)

**Для городского анализа** (~100 строк):
- Роль: ИИ-аналитик системы «City Sentinel».
- 6 строгих правил: только факты из отчёта, без выдумок, на русском, конкретные числа и улицы, объяснимый анализ.
- Формат ответа: JSON с 6 полями (summary, priority, actions, confidence, reasoning, data_sources).
- Правила priority: HIGH (score>8 / ДТП+high / критические дороги), MEDIUM (score>5 / ≥2 инц.), LOW (стабильно).
- Правила actions: 3–5 действий со ссылками на реальные улицы.
- Правила reasoning: 3–5 шагов логической цепочки.
- Правила data_sources: 3–8 конкретных фактов из отчёта.

**Для инцидента** (~15 строк): одна конкретная рекомендация со ссылкой на улицу.

### Anti-hallucination pipeline

1. LLM получает **ТОЛЬКО** данные из нашего пайплайна (ни web search, ни memory, ни retrieval).
2. System prompt **явно запрещает** выдумывать факты.
3. `temperature=0.3` — минимальный креативный дрейф.
4. `response_format={"type": "json_object"}` — принудительный JSON.
5. Валидация: required fields → priority enum check → actions type check → confidence clamp.
6. Pydantic-валидация перед возвратом клиенту.
7. При **любой** ошибке (APIError, timeout, rate limit, JSON parse, missing fields) → автоматический fallback.

### Rule-based fallback engine

3 уровня:
- **HIGH** (score>8 / ДТП+high): «Критическая загруженность», конкретные действия с именами улиц, confidence 0.92.
- **MEDIUM** (score>5 / ≥2 инц.): «Устойчивый рост нагрузки», рекомендации по синхронизации светофоров, confidence 0.78.
- **LOW**: «Обстановка стабильна», превентивные меры, confidence 0.85.

Каждый уровень генерирует полный набор: summary, priority, actions, confidence, model_version=`rule-engine-v3.2`, reasoning, data_sources.

---

## 2.6 Дорожная геометрия (OSRM)

### Как это работает

1. В `road_geometry.py` для каждого из 20 городов определены waypoints основных дорог (4–8 дорог × 2–10 waypoints каждая).
2. `osrm_router.py` отправляет waypoints в **OSRM Demo Server** (`https://router.project-osrm.org/route/v1/driving/{coords}?overview=full&geometries=polyline`).
3. OSRM возвращает маршрут, повторяющий реальную геометрию дороги (повороты, развязки, мосты).
4. Google Polyline декодируется библиотекой `polyline` в массив `[[lat, lng], ...]`.
5. Результат сохраняется в `_geometry_cache/{city_id}_roads.json`.
6. При следующем запросе — читается из кэша (0 мс вместо ~1 сек OSRM).
7. `warmup_cache.py` — скрипт для предзаполнения кэша всех 20 городов.
8. Rate-limit: 1 запрос/сек к demo-серверу OSRM.

---

## 2.7 Конфигурация

### Переменные окружения (`backend/.env`)

| Переменная | Тип | Описание | По умолчанию |
|---|---|---|---|
| `APP_HOST` | str | Хост бэкенда | `0.0.0.0` |
| `APP_PORT` | int | Порт бэкенда | `8000` |
| `APP_DEBUG` | bool | Режим отладки (DEBUG логирование) | `false` |
| `CORS_ORIGINS` | str | Разрешённые origins через запятую | `http://localhost:5173,http://127.0.0.1:5173` |
| `YANDEX_TRAFFIC_API_KEY` | str | Ключ Yandex Traffic (пусто = симуляция) | `""` |
| `TWOGIS_API_KEY` | str | Ключ 2GIS (пусто = симуляция) | `""` |
| `OPENAI_API_KEY` | str | Ключ OpenAI для ChatGPT RAG (пусто = rule-engine) | `""` |
| `OPENAI_MODEL` | str | Модель OpenAI | `gpt-4o-mini` |
| `OPENAI_TIMEOUT` | int | Таймаут OpenAI запроса (сек) | `15` |
| `SIMULATION_ENABLED` | bool | Включить симуляцию | `true` |
| `SIMULATION_SEED` | int | Глобальный seed RNG | `42` |

### Переменные окружения (Frontend `.env`)

| Переменная | Описание | По умолчанию |
|---|---|---|
| `VITE_API_BASE_URL` | URL бэкенда | `http://127.0.0.1:8080` |

### Computed properties в `config.py`

- `cors_origin_list` — парсинг CORS_ORIGINS в `list[str]`.
- `use_real_traffic_api` — `True` если задан хотя бы один ключ (Yandex / 2GIS).
- `use_openai` — `True` если задан OPENAI_API_KEY.

---

## 2.8 Pydantic-модели (Data Contracts)

### Перечисления (Enums)

| Enum | Значения | Использование |
|---|---|---|
| `IncidentType` | ДТП, ремонт, перекрытие | REST API инциденты |
| `IncidentSeverity` | low, medium, high | REST API инциденты |
| `RoadCondition` | good, fair, repair_needed, critical | Состояние дорог |
| `AIPriority` | high, medium, low | ИИ-рекомендации |
| `EventType` (realtime) | ДТП, ремонт, перекрытие, затор, погода, полиция | WebSocket события |
| `EventSeverity` (realtime) | low, medium, high, critical | WebSocket события |

### Модель `AIInsight` (Explainable AI)

```python
class AIInsight(BaseModel):
    summary: str                 # Текстовое резюме ситуации
    priority: AIPriority         # HIGH / MEDIUM / LOW
    actions: list[str]           # 3–5 конкретных рекомендаций
    confidence: float            # 0.0–1.0 (Field(ge=0, le=1))
    model_version: str           # "chatgpt-gpt-4o-mini" | "rule-engine-v3.2"
    reasoning: list[str]         # Пошаговая логика (XAI)
    data_sources: list[str]      # Факты-источники (XAI)
```

---

## 2.9 Запуск проекта

### Backend

```bash
cd backend
pip install -r requirements.txt
# Опционально: прогреть кэш OSRM (если _geometry_cache пуст)
python warmup_cache.py
# Запуск
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
npm install      # или: bun install
npm run dev      # Vite dev-server
```

### Тесты

```bash
npm run test          # Vitest (юнит-тесты)
npm run test:watch    # Vitest в watch-режиме
npx playwright test   # Playwright (e2e-тесты)
```

---

## 2.10 Деплой

- **Frontend** → **Vercel**: SPA-режим с `vercel.json` (rewrite `/*` → `index.html`). Сборка: `vite build`.
- **Backend** → любой сервер с **Python 3.10+** и **Uvicorn** (или Docker). CORS настраивается через `CORS_ORIGINS`.

---

## 2.11 Подготовка к реальным API

В `services/traffic.py` заложены stub-функции:
- `_fetch_yandex_traffic(city)` → реальный балл пробок из Yandex Traffic API.
- `_fetch_2gis_roads(city)` → дорожные сегменты из 2GIS API.

Оба возвращают `None` пока ключи не заданы → система использует симуляцию. При наличии ключей система попытается реальные данные, с автоматическим fallback на симуляцию при ошибке.

---

## 2.12 Стек технологий (полная сводка)

```
Frontend:
  React 18.3 · TypeScript 5.8 · Vite 5.4 (SWC) · TailwindCSS 3.4 · shadcn/ui (25+ компонентов)
  Recharts 2.15 · Leaflet 1.9 + react-leaflet 4.2 · Framer Motion 12.38
  TanStack React Query 5.83 · React Router DOM 6.30 · Lucide React 0.462
  Zod 3.25 · React Hook Form 7.61 · Sonner 1.7

Backend:
  Python 3.10+ · FastAPI ≥0.110 · Pydantic v2 ≥2.6 · Uvicorn ≥0.27
  OpenAI ≥1.30 (GPT-4o-mini) · HTTPX ≥0.27 · Polyline ≥2.0
  OSRM (road geometry) · WebSocket (real-time events)

Тесты:
  Vitest 3.2 + Testing Library · Playwright 1.57

Деплой:
  Vercel (фронтенд) · Uvicorn (бэкенд)

Внешние сервисы:
  OSRM Demo Server (road geometry, cached)
  OpenAI API (ChatGPT RAG, optional)
  Yandex Traffic API (stub, optional)
  2GIS API (stub, optional)
```
