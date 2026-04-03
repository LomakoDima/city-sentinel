import { motion } from "framer-motion";
import { Layers, MapPin } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import type { TrafficResponse } from "@/lib/traffic";

const incidentIcon = L.divIcon({
  className: "incident-pin",
  html: '<div style="width:12px;height:12px;background:#ef4444;border:2px solid #ffffff;border-radius:9999px;box-shadow:0 0 0 6px rgba(239,68,68,0.25);"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface CityMapProps {
  data: TrafficResponse;
}

function FlyToCity({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], 12, {
      animate: true,
      duration: 1.1,
    });
  }, [lat, lng, map]);

  return null;
}

const CityMap = ({ data }: CityMapProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="glass neon-border-cyan relative h-full min-h-[260px] overflow-hidden rounded-xl p-4 sm:min-h-[320px]"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/4 w-60 h-60 bg-neon-cyan/5 rounded-full blur-[80px]" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-neon-purple/5 rounded-full blur-[60px]" />

      <div className="relative z-10 mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-neon-cyan" />
          <h3 className="font-display font-semibold text-sm text-foreground">Карта инцидентов · {data.city_name}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground sm:gap-3">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-red/60" /> ДТП / Перекрытия</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-orange/70" /> Ремонт</span>
          <Layers className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>

      <div className="relative z-10 overflow-hidden rounded-lg border border-border/40">
        <MapContainer
          center={[data.center.lat, data.center.lng]}
          zoom={12}
          className="h-[360px] w-full sm:h-[420px]"
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyToCity lat={data.center.lat} lng={data.center.lng} />
          {data.incidents.map((incident) => (
            <Marker key={`${incident.road_name}-${incident.lat}-${incident.lng}`} position={[incident.lat, incident.lng]} icon={incidentIcon}>
              <Popup>
                <div className="text-xs">
                  <p className="font-semibold">{incident.type} · {incident.road_name}</p>
                  <p>{incident.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </motion.div>
  );
};

export default CityMap;
