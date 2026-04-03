"""One-time script to warm up OSRM geometry cache for all cities."""
import httpx
import time

CITIES = [
    "almaty", "astana", "shymkent", "aktobe", "karaganda",
    "pavlodar", "atyrau", "kostanay", "taraz", "oral",
    "semey", "ust_kamenogorsk", "petropavl", "kokshetau",
    "taldykorgan", "turkistan", "kyzylorda", "mangystau",
    "zhezkazgan", "ekibastuz",
]

BASE = "http://127.0.0.1:8001"

for i, city in enumerate(CITIES, 1):
    print(f"[{i}/{len(CITIES)}] Warming {city}...", end=" ", flush=True)
    try:
        r = httpx.get(f"{BASE}/api/map-data/{city}", timeout=120)
        n = len(r.json().get("polylines", []))
        print(f"OK — {n} roads")
    except Exception as e:
        print(f"FAIL — {e}")
    time.sleep(0.2)

print("\nDone! All caches warmed.")
