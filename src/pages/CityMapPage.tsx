import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GeoJSON as GeoJSONLayer, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPinned, ExternalLink, Activity, AlertTriangle, Gauge } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { cityCenterMap, cityLabelMap, type CityId } from "@/lib/traffic";
import kazakhstanBorder from "@/data/kazakhstan-border";

const KAZAKHSTAN_CENTER: [number, number] = [48.5, 67.5];
const KAZAKHSTAN_ZOOM = 5;

const allCities: CityId[] = [
  "almaty", "astana", "shymkent", "aktobe", "karaganda",
  "pavlodar", "atyrau", "kostanay", "taraz", "oral",
  "semey", "ust_kamenogorsk", "petropavl", "kokshetau", "taldykorgan",
  "turkistan", "kyzylorda", "mangystau", "zhezkazgan", "ekibastuz",
];

const cityStats: Record<string, { population: string; area: string; status: string }> = {
  almaty: { population: "2.1M", area: "682 км²", status: "Высокая нагрузка" },
  astana: { population: "1.4M", area: "810 км²", status: "Умеренная нагрузка" },
  shymkent: { population: "1.1M", area: "1 170 км²", status: "Средняя нагрузка" },
  aktobe: { population: "500K", area: "300 км²", status: "Низкая нагрузка" },
  karaganda: { population: "510K", area: "550 км²", status: "Средняя нагрузка" },
  pavlodar: { population: "370K", area: "400 км²", status: "Низкая нагрузка" },
  atyrau: { population: "290K", area: "250 км²", status: "Средняя нагрузка" },
  kostanay: { population: "240K", area: "240 км²", status: "Низкая нагрузка" },
  taraz: { population: "360K", area: "380 км²", status: "Средняя нагрузка" },
  oral: { population: "310K", area: "290 км²", status: "Низкая нагрузка" },
  semey: { population: "340K", area: "320 км²", status: "Низкая нагрузка" },
  ust_kamenogorsk: { population: "350K", area: "350 км²", status: "Средняя нагрузка" },
  petropavl: { population: "220K", area: "230 км²", status: "Низкая нагрузка" },
  kokshetau: { population: "180K", area: "190 км²", status: "Низкая нагрузка" },
  taldykorgan: { population: "160K", area: "170 км²", status: "Низкая нагрузка" },
  turkistan: { population: "200K", area: "210 км²", status: "Низкая нагрузка" },
  kyzylorda: { population: "270K", area: "260 км²", status: "Низкая нагрузка" },
  mangystau: { population: "250K", area: "280 км²", status: "Средняя нагрузка" },
  zhezkazgan: { population: "90K", area: "120 км²", status: "Низкая нагрузка" },
  ekibastuz: { population: "130K", area: "150 км²", status: "Низкая нагрузка" },
};

function createCityIcon(isSelected: boolean) {
  const size = isSelected ? 16 : 10;
  const bg = isSelected ? "#06b6d4" : "#14b8a6";
  const shadow = isSelected
    ? "0 0 0 6px rgba(6,182,212,0.35), 0 0 14px rgba(6,182,212,0.3)"
    : "0 0 0 4px rgba(20,184,166,0.2)";
  return L.divIcon({
    className: "city-pin",
    html: `<div style="width:${size}px;height:${size}px;background:${bg};border:2px solid #fff;border-radius:9999px;box-shadow:${shadow};transition:all .2s;cursor:pointer;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FlyToCity({ cityId }: { cityId: CityId | null }) {
  const map = useMap();
  if (cityId) {
    const c = cityCenterMap[cityId];
    map.flyTo([c.lat, c.lng], 10, { animate: true, duration: 1.2 });
  }
  return null;
}

const CityMapPage = () => {
  const [selectedCity, setSelectedCity] = useState<CityId>("almaty");
  const [hoveredCity, setHoveredCity] = useState<CityId | null>(null);
  const [flyTarget, setFlyTarget] = useState<CityId | null>(null);
  const navigate = useNavigate();

  const handleCityClick = (cityId: CityId) => {
    setSelectedCity(cityId);
    setFlyTarget(cityId);
  };

  const openDashboard = (cityId: CityId) => {
    setSelectedCity(cityId);
    navigate("/dashboard");
  };

  const stats = cityStats[selectedCity] ?? { population: "—", area: "—", status: "—" };
  const statusColor =
    stats.status === "Высокая нагрузка" ? "text-red-500 bg-red-50" :
    stats.status === "Средняя нагрузка" ? "text-amber-600 bg-amber-50" :
    "text-emerald-600 bg-emerald-50";

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background lg:h-screen lg:flex-row lg:overflow-hidden">
      <Sidebar selectedCity={selectedCity} onCityChange={setSelectedCity} />

      <main className="flex-1 flex flex-col gap-4 p-3 sm:p-4 lg:overflow-y-auto lg:p-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10">
            <MapPinned className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">Карта городов Казахстана</h1>
            <p className="text-xs text-muted-foreground">{allCities.length} городов · интерактивная карта</p>
          </div>
        </motion.div>

        {/* Map + Info split */}
        <div className="flex-1 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-xl overflow-hidden min-h-[400px] relative"
          >
            <MapContainer
              center={KAZAKHSTAN_CENTER}
              zoom={KAZAKHSTAN_ZOOM}
              className="h-full w-full min-h-[400px] lg:min-h-[600px]"
              scrollWheelZoom={true}
              minZoom={4}
              maxZoom={14}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <GeoJSONLayer
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data={kazakhstanBorder as any}
                style={{
                  color: "#06b6d4",
                  weight: 2,
                  opacity: 0.6,
                  fillColor: "#06b6d4",
                  fillOpacity: 0.05,
                  dashArray: "6 4",
                }}
              />
              {flyTarget && <FlyToCity cityId={flyTarget} />}
              {allCities.map((cityId) => {
                const center = cityCenterMap[cityId];
                const isSelected = selectedCity === cityId;
                return (
                  <Marker
                    key={cityId}
                    position={[center.lat, center.lng]}
                    icon={createCityIcon(isSelected)}
                    eventHandlers={{
                      click: () => handleCityClick(cityId),
                      mouseover: () => setHoveredCity(cityId),
                      mouseout: () => setHoveredCity(null),
                    }}
                  >
                    <Popup>
                      <div className="min-w-[160px] text-xs">
                        <p className="font-bold text-sm">{cityLabelMap[cityId]}</p>
                        <p className="text-muted-foreground mt-1">
                          {center.lat.toFixed(3)}°, {center.lng.toFixed(3)}°
                        </p>
                        <p className="mt-1">Население: {cityStats[cityId]?.population ?? "—"}</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </motion.div>

          {/* City info panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-4"
          >
            {/* Selected city card */}
            <div className="glass rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Выбранный город</p>
                  <h2 className="font-display text-xl font-bold text-foreground">{cityLabelMap[selectedCity]}</h2>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusColor}`}>
                  {stats.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-lg bg-secondary/40 p-3">
                  <p className="text-[10px] text-muted-foreground">Население</p>
                  <p className="font-display text-sm font-bold text-foreground">{stats.population}</p>
                </div>
                <div className="rounded-lg bg-secondary/40 p-3">
                  <p className="text-[10px] text-muted-foreground">Площадь</p>
                  <p className="font-display text-sm font-bold text-foreground">{stats.area}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="flex flex-col items-center gap-1 rounded-lg border border-border/50 p-2">
                  <Activity className="w-3.5 h-3.5 text-neon-cyan" />
                  <p className="text-[9px] text-muted-foreground">Трафик</p>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-lg border border-border/50 p-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <p className="text-[9px] text-muted-foreground">Инциденты</p>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-lg border border-border/50 p-2">
                  <Gauge className="w-3.5 h-3.5 text-neon-green" />
                  <p className="text-[9px] text-muted-foreground">Скорость</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openDashboard(selectedCity)}
                className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
              >
                Открыть дашборд <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* City list */}
            <div className="glass rounded-xl p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-3">
                Все города ({allCities.length})
              </p>
              <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1">
                {allCities.map((cityId) => {
                  const isActive = selectedCity === cityId;
                  const isHovered = hoveredCity === cityId;
                  return (
                    <button
                      key={cityId}
                      type="button"
                      onClick={() => handleCityClick(cityId)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : isHovered
                          ? "bg-secondary/60 text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        isActive ? "bg-primary" : "bg-border"
                      }`} />
                      {cityLabelMap[cityId]}
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        {cityStats[cityId]?.population ?? "—"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CityMapPage;
