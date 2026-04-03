import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { GeoJSON as GeoJSONLayer, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPinned } from "lucide-react";
import { cityCenterMap, cityLabelMap, type CityId } from "@/lib/traffic";
import kazakhstanBorder from "@/data/kazakhstan-border";

interface KazakhstanCityMapsProps {
  selectedCity: CityId;
  onSelectCity: (cityId: CityId) => void;
}

const KAZAKHSTAN_CENTER: [number, number] = [48.5, 67.5];
const KAZAKHSTAN_ZOOM = 5;

const cities: CityId[] = [
  "almaty", "astana", "shymkent", "aktobe", "karaganda",
  "pavlodar", "atyrau", "kostanay", "taraz", "oral",
  "semey", "ust_kamenogorsk", "petropavl", "kokshetau", "taldykorgan",
  "turkistan", "kyzylorda", "mangystau", "zhezkazgan", "ekibastuz",
];

function createCityIcon(isActive: boolean) {
  const size = isActive ? 14 : 10;
  const bg = isActive ? "#06b6d4" : "#14b8a6";
  const shadow = isActive
    ? "0 0 0 6px rgba(6,182,212,0.35), 0 0 12px rgba(6,182,212,0.25)"
    : "0 0 0 4px rgba(20,184,166,0.2)";
  return L.divIcon({
    className: "city-pin",
    html: `<div style="width:${size}px;height:${size}px;background:${bg};border:2px solid #fff;border-radius:9999px;box-shadow:${shadow};transition:all .2s;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapFlyHandler({ selectedCity }: { selectedCity: CityId }) {
  const map = useMap();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const center = cityCenterMap[selectedCity];
    map.flyTo([center.lat, center.lng], 11, { animate: true, duration: 1.2 });
  }, [selectedCity, map]);

  return null;
}

function CityMarkers({ selectedCity, onSelectCity }: KazakhstanCityMapsProps) {
  const map = useMap();

  const handleClick = useCallback(
    (cityId: CityId) => {
      const center = cityCenterMap[cityId];
      onSelectCity(cityId);
      map.flyTo([center.lat, center.lng], 11, { animate: true, duration: 1.2 });
    },
    [onSelectCity, map],
  );

  return (
    <>
      {cities.map((cityId) => {
        const center = cityCenterMap[cityId];
        const isActive = selectedCity === cityId;
        return (
          <Marker
            key={cityId}
            position={[center.lat, center.lng]}
            icon={createCityIcon(isActive)}
            eventHandlers={{ click: () => handleClick(cityId) }}
          >
            <Popup>
              <div className="min-w-[140px] text-xs">
                <p className="font-bold text-sm mb-1">{cityLabelMap[cityId]}</p>
                <p className="text-muted-foreground">
                  {center.lat.toFixed(3)}°, {center.lng.toFixed(3)}°
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

function ResetButton() {
  const map = useMap();
  const reset = useCallback(() => {
    map.flyTo(KAZAKHSTAN_CENTER, KAZAKHSTAN_ZOOM, { animate: true, duration: 1 });
  }, [map]);

  return (
    <button
      type="button"
      onClick={reset}
      className="absolute top-3 right-3 z-[1000] rounded-lg bg-background/80 backdrop-blur border border-border/50 px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:border-neon-cyan/40 transition"
    >
      Вся карта
    </button>
  );
}

const KazakhstanCityMaps = ({ selectedCity, onSelectCity }: KazakhstanCityMapsProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-xl p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <MapPinned className="h-4 w-4 text-neon-cyan" />
        <h3 className="font-display text-sm font-semibold text-foreground">Карта Казахстана</h3>
        <span className="ml-1 rounded bg-neon-cyan/10 px-1.5 py-0.5 text-[10px] font-medium text-neon-cyan">
          {cities.length} городов
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground">
          Выбран: <span className="font-semibold text-foreground">{cityLabelMap[selectedCity]}</span>
        </span>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-border/40">
        <MapContainer
          center={KAZAKHSTAN_CENTER}
          zoom={KAZAKHSTAN_ZOOM}
          className="h-[360px] w-full sm:h-[440px]"
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
              opacity: 0.7,
              fillColor: "#06b6d4",
              fillOpacity: 0.06,
              dashArray: "6 4",
            }}
          />
          <MapFlyHandler selectedCity={selectedCity} />
          <CityMarkers selectedCity={selectedCity} onSelectCity={onSelectCity} />
          <ResetButton />
        </MapContainer>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {cities.map((cityId) => {
          const isActive = selectedCity === cityId;
          return (
            <button
              key={cityId}
              type="button"
              onClick={() => onSelectCity(cityId)}
              className={`rounded-md px-2 py-1 text-[10px] font-medium transition ${
                isActive
                  ? "bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30"
                  : "bg-secondary/40 text-muted-foreground border border-transparent hover:bg-secondary/70 hover:text-foreground"
              }`}
            >
              {cityLabelMap[cityId]}
            </button>
          );
        })}
      </div>
    </motion.section>
  );
};

export default KazakhstanCityMaps;

