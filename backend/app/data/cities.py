"""Static reference data for all supported cities."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class CityMeta:
    city_id: str
    city_name: str
    lat: float
    lng: float
    population: int
    # Major roads for simulation — used to generate road-segment incidents
    major_roads: list[str] = field(default_factory=list)


CITIES: dict[str, CityMeta] = {
    "almaty": CityMeta(
        city_id="almaty",
        city_name="Алматы",
        lat=43.222, lng=76.851,
        population=2_100_000,
        major_roads=[
            "проспект Аль-Фараби",
            "проспект Абая",
            "улица Сатпаева",
            "проспект Райымбека",
            "улица Тимирязева",
            "улица Жарокова",
            "ВОАД",
            "проспект Достык",
        ],
    ),
    "astana": CityMeta(
        city_id="astana",
        city_name="Астана",
        lat=51.169, lng=71.449,
        population=1_400_000,
        major_roads=[
            "проспект Мәңгілік Ел",
            "проспект Республики",
            "проспект Кабанбай батыра",
            "улица Сыганак",
            "улица Кенесары",
            "проспект Туран",
            "улица Сарайшық",
        ],
    ),
    "shymkent": CityMeta(
        city_id="shymkent",
        city_name="Шымкент",
        lat=42.341, lng=69.590,
        population=1_150_000,
        major_roads=[
            "проспект Тауке-хана",
            "проспект Республики",
            "улица Байтурсынова",
            "улица Толе-би",
            "улица Мадели-кожа",
            "улица Казыбек-би",
        ],
    ),
    "aktobe": CityMeta(
        city_id="aktobe", city_name="Актобе",
        lat=50.279, lng=57.207, population=520_000,
        major_roads=["проспект Абая", "проспект Санкибай батыра", "улица Некрасова", "улица Братьев Жубановых"],
    ),
    "karaganda": CityMeta(
        city_id="karaganda", city_name="Караганда",
        lat=49.804, lng=73.108, population=500_000,
        major_roads=["проспект Бухар-Жырау", "проспект Нуркена Абдирова", "улица Ерубаева", "Экибастузская улица"],
    ),
    "pavlodar": CityMeta(
        city_id="pavlodar", city_name="Павлодар",
        lat=52.288, lng=76.969, population=370_000,
        major_roads=["улица 1 Мая", "проспект Назарбаева", "улица Кутузова", "улица Толстого"],
    ),
    "atyrau": CityMeta(
        city_id="atyrau", city_name="Атырау",
        lat=47.106, lng=51.920, population=350_000,
        major_roads=["проспект Сатпаева", "проспект Азаттық", "улица Абая", "улица Валиханова"],
    ),
    "kostanay": CityMeta(
        city_id="kostanay", city_name="Костанай",
        lat=53.214, lng=63.632, population=250_000,
        major_roads=["проспект Аль-Фараби", "улица Байтурсынова", "улица Гоголя", "улица Тарана"],
    ),
    "taraz": CityMeta(
        city_id="taraz", city_name="Тараз",
        lat=42.901, lng=71.378, population=360_000,
        major_roads=["проспект Абая", "улица Толе-би", "улица Сулейменова", "улица Байзак батыра"],
    ),
    "oral": CityMeta(
        city_id="oral", city_name="Орал",
        lat=51.233, lng=51.366, population=310_000,
        major_roads=["проспект Назарбаева", "проспект Достык", "улица Жангир-хана", "улица Курмангазы"],
    ),
    "semey": CityMeta(
        city_id="semey", city_name="Семей",
        lat=50.411, lng=80.228, population=340_000,
        major_roads=["проспект Шакарима", "улица Абая", "улица Найманбаева", "улица Кабанбай батыра"],
    ),
    "ust_kamenogorsk": CityMeta(
        city_id="ust_kamenogorsk", city_name="Усть-Каменогорск",
        lat=49.948, lng=82.628, population=330_000,
        major_roads=["проспект Независимости", "проспект Назарбаева", "улица Бурова", "проспект Абая"],
    ),
    "petropavl": CityMeta(
        city_id="petropavl", city_name="Петропавловск",
        lat=54.865, lng=69.135, population=220_000,
        major_roads=["улица Конституции", "улица Интернациональная", "улица Жамбыла", "улица Сутюшева"],
    ),
    "kokshetau": CityMeta(
        city_id="kokshetau", city_name="Кокшетау",
        lat=53.284, lng=69.395, population=170_000,
        major_roads=["улица Абая", "улица Ауэзова", "улица Горького", "улица Уалиханова"],
    ),
    "taldykorgan": CityMeta(
        city_id="taldykorgan", city_name="Талдыкорган",
        lat=45.017, lng=78.373, population=160_000,
        major_roads=["проспект Назарбаева", "улица Жансугурова", "улица Тауелсиздик", "улица Шевченко"],
    ),
    "turkistan": CityMeta(
        city_id="turkistan", city_name="Туркестан",
        lat=43.297, lng=68.254, population=210_000,
        major_roads=["проспект Тауке-хана", "улица Есим-хана", "улица Жибек-жолы", "улица Байтурсынова"],
    ),
    "kyzylorda": CityMeta(
        city_id="kyzylorda", city_name="Кызылорда",
        lat=44.842, lng=65.502, population=270_000,
        major_roads=["проспект Абая", "улица Желтоксан", "улица Коркыт-ата", "улица Ватутина"],
    ),
    "mangystau": CityMeta(
        city_id="mangystau", city_name="Актау",
        lat=43.651, lng=51.158, population=200_000,
        major_roads=["проспект Абая", "проспект Бейбарыса", "улица Мангистауская", "улица Оразбайулы"],
    ),
    "zhezkazgan": CityMeta(
        city_id="zhezkazgan", city_name="Жезказган",
        lat=47.783, lng=67.713, population=85_000,
        major_roads=["проспект Мира", "проспект Металлургов", "улица Абая", "улица Алаш"],
    ),
    "ekibastuz": CityMeta(
        city_id="ekibastuz", city_name="Экибастуз",
        lat=51.729, lng=75.322, population=135_000,
        major_roads=["улица Ауэзова", "улица Энергетиков", "проспект Назарбаева", "улица Машхур-Жусупа"],
    ),
}


# Base congestion profiles (12h trends) — amplitude scales with city size
CONGESTION_PROFILES: dict[str, list[dict[str, object]]] = {
    "almaty": [
        {"hour": "07:00", "score": 6.1}, {"hour": "08:00", "score": 7.2}, {"hour": "09:00", "score": 8.1},
        {"hour": "10:00", "score": 8.4}, {"hour": "11:00", "score": 8.6}, {"hour": "12:00", "score": 8.8},
        {"hour": "13:00", "score": 8.7}, {"hour": "14:00", "score": 8.9}, {"hour": "15:00", "score": 9.0},
        {"hour": "16:00", "score": 9.1}, {"hour": "17:00", "score": 8.9}, {"hour": "18:00", "score": 8.7},
    ],
    "astana": [
        {"hour": "07:00", "score": 4.9}, {"hour": "08:00", "score": 5.8}, {"hour": "09:00", "score": 6.4},
        {"hour": "10:00", "score": 6.8}, {"hour": "11:00", "score": 7.1}, {"hour": "12:00", "score": 7.2},
        {"hour": "13:00", "score": 7.0}, {"hour": "14:00", "score": 7.3}, {"hour": "15:00", "score": 7.6},
        {"hour": "16:00", "score": 7.8}, {"hour": "17:00", "score": 7.5}, {"hour": "18:00", "score": 7.2},
    ],
    "shymkent": [
        {"hour": "07:00", "score": 3.8}, {"hour": "08:00", "score": 4.2}, {"hour": "09:00", "score": 4.9},
        {"hour": "10:00", "score": 5.3}, {"hour": "11:00", "score": 5.8}, {"hour": "12:00", "score": 6.0},
        {"hour": "13:00", "score": 6.1}, {"hour": "14:00", "score": 6.4}, {"hour": "15:00", "score": 6.6},
        {"hour": "16:00", "score": 6.7}, {"hour": "17:00", "score": 6.5}, {"hour": "18:00", "score": 6.2},
    ],
    "aktobe": [
        {"hour": "07:00", "score": 2.8}, {"hour": "08:00", "score": 3.5}, {"hour": "09:00", "score": 4.2},
        {"hour": "10:00", "score": 4.8}, {"hour": "11:00", "score": 5.1}, {"hour": "12:00", "score": 5.3},
        {"hour": "13:00", "score": 5.2}, {"hour": "14:00", "score": 5.0}, {"hour": "15:00", "score": 4.9},
        {"hour": "16:00", "score": 4.7}, {"hour": "17:00", "score": 4.5}, {"hour": "18:00", "score": 4.1},
    ],
    "karaganda": [
        {"hour": "07:00", "score": 3.0}, {"hour": "08:00", "score": 3.8}, {"hour": "09:00", "score": 4.5},
        {"hour": "10:00", "score": 5.0}, {"hour": "11:00", "score": 5.4}, {"hour": "12:00", "score": 5.6},
        {"hour": "13:00", "score": 5.5}, {"hour": "14:00", "score": 5.3}, {"hour": "15:00", "score": 5.2},
        {"hour": "16:00", "score": 5.0}, {"hour": "17:00", "score": 4.8}, {"hour": "18:00", "score": 4.3},
    ],
    "pavlodar": [
        {"hour": "07:00", "score": 3.2}, {"hour": "08:00", "score": 4.1}, {"hour": "09:00", "score": 5.0},
        {"hour": "10:00", "score": 5.6}, {"hour": "11:00", "score": 6.0}, {"hour": "12:00", "score": 6.2},
        {"hour": "13:00", "score": 6.1}, {"hour": "14:00", "score": 5.9}, {"hour": "15:00", "score": 5.8},
        {"hour": "16:00", "score": 5.6}, {"hour": "17:00", "score": 5.4}, {"hour": "18:00", "score": 4.8},
    ],
    "atyrau": [
        {"hour": "07:00", "score": 3.5}, {"hour": "08:00", "score": 4.3}, {"hour": "09:00", "score": 5.0},
        {"hour": "10:00", "score": 5.4}, {"hour": "11:00", "score": 5.7}, {"hour": "12:00", "score": 5.8},
        {"hour": "13:00", "score": 5.6}, {"hour": "14:00", "score": 5.5}, {"hour": "15:00", "score": 5.3},
        {"hour": "16:00", "score": 5.2}, {"hour": "17:00", "score": 5.0}, {"hour": "18:00", "score": 4.6},
    ],
    "kostanay": [
        {"hour": "07:00", "score": 2.5}, {"hour": "08:00", "score": 3.2}, {"hour": "09:00", "score": 3.8},
        {"hour": "10:00", "score": 4.1}, {"hour": "11:00", "score": 4.3}, {"hour": "12:00", "score": 4.5},
        {"hour": "13:00", "score": 4.4}, {"hour": "14:00", "score": 4.2}, {"hour": "15:00", "score": 4.1},
        {"hour": "16:00", "score": 4.0}, {"hour": "17:00", "score": 3.8}, {"hour": "18:00", "score": 3.4},
    ],
    "taraz": [
        {"hour": "07:00", "score": 2.9}, {"hour": "08:00", "score": 3.6}, {"hour": "09:00", "score": 4.3},
        {"hour": "10:00", "score": 4.8}, {"hour": "11:00", "score": 5.1}, {"hour": "12:00", "score": 5.3},
        {"hour": "13:00", "score": 5.2}, {"hour": "14:00", "score": 5.0}, {"hour": "15:00", "score": 4.9},
        {"hour": "16:00", "score": 4.8}, {"hour": "17:00", "score": 4.6}, {"hour": "18:00", "score": 4.2},
    ],
    "oral": [
        {"hour": "07:00", "score": 2.4}, {"hour": "08:00", "score": 3.1}, {"hour": "09:00", "score": 3.7},
        {"hour": "10:00", "score": 4.0}, {"hour": "11:00", "score": 4.3}, {"hour": "12:00", "score": 4.5},
        {"hour": "13:00", "score": 4.4}, {"hour": "14:00", "score": 4.3}, {"hour": "15:00", "score": 4.2},
        {"hour": "16:00", "score": 4.1}, {"hour": "17:00", "score": 3.9}, {"hour": "18:00", "score": 3.5},
    ],
    "semey": [
        {"hour": "07:00", "score": 2.7}, {"hour": "08:00", "score": 3.4}, {"hour": "09:00", "score": 4.1},
        {"hour": "10:00", "score": 4.5}, {"hour": "11:00", "score": 4.8}, {"hour": "12:00", "score": 5.0},
        {"hour": "13:00", "score": 4.9}, {"hour": "14:00", "score": 4.7}, {"hour": "15:00", "score": 4.6},
        {"hour": "16:00", "score": 4.5}, {"hour": "17:00", "score": 4.3}, {"hour": "18:00", "score": 3.9},
    ],
    "ust_kamenogorsk": [
        {"hour": "07:00", "score": 3.3}, {"hour": "08:00", "score": 4.2}, {"hour": "09:00", "score": 5.0},
        {"hour": "10:00", "score": 5.5}, {"hour": "11:00", "score": 5.8}, {"hour": "12:00", "score": 6.0},
        {"hour": "13:00", "score": 5.9}, {"hour": "14:00", "score": 5.7}, {"hour": "15:00", "score": 5.5},
        {"hour": "16:00", "score": 5.3}, {"hour": "17:00", "score": 5.1}, {"hour": "18:00", "score": 4.7},
    ],
    "petropavl": [
        {"hour": "07:00", "score": 2.0}, {"hour": "08:00", "score": 2.8}, {"hour": "09:00", "score": 3.4},
        {"hour": "10:00", "score": 3.7}, {"hour": "11:00", "score": 3.9}, {"hour": "12:00", "score": 4.1},
        {"hour": "13:00", "score": 4.0}, {"hour": "14:00", "score": 3.8}, {"hour": "15:00", "score": 3.7},
        {"hour": "16:00", "score": 3.6}, {"hour": "17:00", "score": 3.4}, {"hour": "18:00", "score": 3.0},
    ],
    "kokshetau": [
        {"hour": "07:00", "score": 1.8}, {"hour": "08:00", "score": 2.5}, {"hour": "09:00", "score": 3.1},
        {"hour": "10:00", "score": 3.4}, {"hour": "11:00", "score": 3.6}, {"hour": "12:00", "score": 3.8},
        {"hour": "13:00", "score": 3.7}, {"hour": "14:00", "score": 3.5}, {"hour": "15:00", "score": 3.4},
        {"hour": "16:00", "score": 3.3}, {"hour": "17:00", "score": 3.1}, {"hour": "18:00", "score": 2.7},
    ],
    "taldykorgan": [
        {"hour": "07:00", "score": 1.6}, {"hour": "08:00", "score": 2.2}, {"hour": "09:00", "score": 2.8},
        {"hour": "10:00", "score": 3.1}, {"hour": "11:00", "score": 3.3}, {"hour": "12:00", "score": 3.5},
        {"hour": "13:00", "score": 3.4}, {"hour": "14:00", "score": 3.2}, {"hour": "15:00", "score": 3.1},
        {"hour": "16:00", "score": 3.0}, {"hour": "17:00", "score": 2.8}, {"hour": "18:00", "score": 2.4},
    ],
    "turkistan": [
        {"hour": "07:00", "score": 2.2}, {"hour": "08:00", "score": 2.9}, {"hour": "09:00", "score": 3.5},
        {"hour": "10:00", "score": 3.9}, {"hour": "11:00", "score": 4.2}, {"hour": "12:00", "score": 4.4},
        {"hour": "13:00", "score": 4.3}, {"hour": "14:00", "score": 4.1}, {"hour": "15:00", "score": 4.0},
        {"hour": "16:00", "score": 3.9}, {"hour": "17:00", "score": 3.7}, {"hour": "18:00", "score": 3.3},
    ],
    "kyzylorda": [
        {"hour": "07:00", "score": 2.0}, {"hour": "08:00", "score": 2.7}, {"hour": "09:00", "score": 3.3},
        {"hour": "10:00", "score": 3.7}, {"hour": "11:00", "score": 4.0}, {"hour": "12:00", "score": 4.2},
        {"hour": "13:00", "score": 4.1}, {"hour": "14:00", "score": 3.9}, {"hour": "15:00", "score": 3.8},
        {"hour": "16:00", "score": 3.7}, {"hour": "17:00", "score": 3.5}, {"hour": "18:00", "score": 3.1},
    ],
    "mangystau": [
        {"hour": "07:00", "score": 2.3}, {"hour": "08:00", "score": 3.1}, {"hour": "09:00", "score": 3.8},
        {"hour": "10:00", "score": 4.2}, {"hour": "11:00", "score": 4.5}, {"hour": "12:00", "score": 4.7},
        {"hour": "13:00", "score": 4.6}, {"hour": "14:00", "score": 4.5}, {"hour": "15:00", "score": 4.4},
        {"hour": "16:00", "score": 4.3}, {"hour": "17:00", "score": 4.1}, {"hour": "18:00", "score": 3.7},
    ],
    "zhezkazgan": [
        {"hour": "07:00", "score": 1.2}, {"hour": "08:00", "score": 1.8}, {"hour": "09:00", "score": 2.3},
        {"hour": "10:00", "score": 2.6}, {"hour": "11:00", "score": 2.8}, {"hour": "12:00", "score": 3.0},
        {"hour": "13:00", "score": 2.9}, {"hour": "14:00", "score": 2.8}, {"hour": "15:00", "score": 2.7},
        {"hour": "16:00", "score": 2.6}, {"hour": "17:00", "score": 2.4}, {"hour": "18:00", "score": 2.0},
    ],
    "ekibastuz": [
        {"hour": "07:00", "score": 1.0}, {"hour": "08:00", "score": 1.5}, {"hour": "09:00", "score": 2.0},
        {"hour": "10:00", "score": 2.3}, {"hour": "11:00", "score": 2.5}, {"hour": "12:00", "score": 2.7},
        {"hour": "13:00", "score": 2.6}, {"hour": "14:00", "score": 2.5}, {"hour": "15:00", "score": 2.4},
        {"hour": "16:00", "score": 2.3}, {"hour": "17:00", "score": 2.1}, {"hour": "18:00", "score": 1.7},
    ],
}
