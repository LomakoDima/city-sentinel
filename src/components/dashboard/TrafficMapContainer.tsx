import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { MapPin, Layers, Clock, Timer, Radio, Wifi, WifiOff } from "lucide-react";
import {
  fetchMapData,
  type CityId,
  type MapIncident,
  type CongestionLevel,
} from "@/lib/traffic";
import { useRealtimeEvents, type LiveEvent } from "@/hooks/useRealtimeEvents";
import IncidentAnalysisPanel from "./IncidentAnalysisPanel";

// ── Congestion colours (2GIS palette) ───────────────────────────────────────

const CONGESTION_COLORS: Record<CongestionLevel, string> = {
  free: "#55AA00",
  slow: "#FF8000",
  heavy: "#FF0000",
};

const CONGESTION_LABELS: Record<CongestionLevel, string> = {
  free: "Свободно",
  slow: "Затруднение",
  heavy: "Пробка",
};

// ── Custom marker factory (2GIS-style) ──────────────────────────────────────

type IncidentClass = "accident" | "repair" | "closure" | "congestion" | "weather" | "police";

function incidentTypeToClass(type: string): IncidentClass {
  switch (type) {
    case "ДТП": return "accident";
    case "ремонт": return "repair";
    case "перекрытие": return "closure";
    case "затор": return "congestion";
    case "погода": return "weather";
    case "полиция": return "police";
    default: return "accident";
  }
}

// Inline SVG icons (lucide-style) for use inside Leaflet divIcon HTML
const SVG_ICONS: Record<IncidentClass, string> = {
  accident: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`,
  repair: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 15V6.5a3.5 3.5 0 0 1 7 0V15"/><path d="M4 15v-5a6 6 0 0 1 6-6h0"/><path d="M14 4a2 2 0 0 1 0 4"/></svg>`,
  closure: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 2 20 20"/><path d="M5 5a1 1 0 0 0-.5.8C4.3 8.4 4 11.4 4 12c0 7 8 10 8 10s2.7-1 4.8-3.4"/><path d="M9.8 4.4A2 2 0 0 1 11 4h1a2 2 0 0 1 2 2v1c0 .6.2 1 .5 1.4C16.8 11.2 20 14 20 18"/></svg>`,
  congestion: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  weather: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`,
  police: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>`,
};

function createIncidentMarker(incident: MapIncident): L.DivIcon {
  const cls = incidentTypeToClass(incident.type);
  const hasPulse = incident.severity === "high";
  const svgIcon = SVG_ICONS[cls];

  const html = `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;">
      ${hasPulse ? `<div class="incident-pulse-ring ${cls}"></div>` : ""}
      <div class="incident-marker-2gis ${cls}">${svgIcon}</div>
    </div>
  `;

  return L.divIcon({
    className: "",
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function createLiveEventMarker(event: LiveEvent, isNew: boolean): L.DivIcon {
  const cls = incidentTypeToClass(event.type);
  const hasPulse = event.severity === "high" || event.severity === "critical";
  const svgIcon = SVG_ICONS[cls] || SVG_ICONS.accident;
  const newBadge = isNew ? `<div class="live-event-new-badge">LIVE</div>` : "";

  const html = `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;">
      ${hasPulse ? `<div class="incident-pulse-ring ${cls}"></div>` : ""}
      <div class="incident-marker-2gis ${cls} live-event">${svgIcon}</div>
      ${newBadge}
    </div>
  `;

  return L.divIcon({
    className: isNew ? "live-event-appear" : "",
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

// ── Popup content builders ──────────────────────────────────────────────────

function IncidentPopupContent({ incident }: { incident: MapIncident }) {
  const cls = incidentTypeToClass(incident.type);
  return (
    <div style={{ minWidth: 200, fontFamily: "Inter, sans-serif" }}>
      <div className="gis-popup-header">
        <span className={`gis-popup-badge ${cls}`}>{incident.type}</span>
        <span className="gis-popup-time">
          <Clock style={{ width: 11, height: 11, display: "inline", marginRight: 3, verticalAlign: "-1px" }} />
          {incident.timestamp}
        </span>
      </div>
      <div className="gis-popup-title">{incident.road_name}</div>
      <div className="gis-popup-desc">{incident.description}</div>
      {incident.delay_minutes > 0 && (
        <div className="gis-popup-delay">
          <Timer style={{ width: 12, height: 12 }} />
          +{incident.delay_minutes} мин задержки
        </div>
      )}
    </div>
  );
}

function LiveEventPopupContent({ event }: { event: LiveEvent }) {
  const cls = incidentTypeToClass(event.type);
  const remainMin = Math.ceil(event.remaining_seconds / 60);
  return (
    <div style={{ minWidth: 220, fontFamily: "Inter, sans-serif" }}>
      <div className="gis-popup-header">
        <span className={`gis-popup-badge ${cls}`}>
          <span style={{ marginRight: 4, fontSize: 8 }}>●</span>
          {event.type}
        </span>
        <span className="gis-popup-time">
          <Clock style={{ width: 11, height: 11, display: "inline", marginRight: 3, verticalAlign: "-1px" }} />
          {event.timestamp}
        </span>
      </div>
      <div className="gis-popup-title">{event.road_name}</div>
      <div className="gis-popup-desc">{event.description}</div>
      <div style={{ display: "flex", gap: 10, marginTop: 6, fontSize: 11 }}>
        {event.delay_minutes > 0 && (
          <div className="gis-popup-delay">
            <Timer style={{ width: 12, height: 12 }} />
            +{event.delay_minutes} мин
          </div>
        )}
        <div style={{ color: "#888", fontSize: 10 }}>
          ~{remainMin} мин до снятия
        </div>
      </div>
      <div style={{ marginTop: 4, fontSize: 9, color: "#06b6d4", fontWeight: 600 }}>
        LIVE · {event.severity === "critical" ? "КРИТИЧНО" : event.severity === "high" ? "ВАЖНО" : ""}
      </div>
    </div>
  );
}

// ── FlyTo helper ────────────────────────────────────────────────────────────

function FlyToCity({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { animate: true, duration: 1.1 });
  }, [lat, lng, zoom, map]);
  return null;
}

// ── Legend ───────────────────────────────────────────────────────────────────

function MapLegend({ liveCount, connected }: { liveCount: number; connected: boolean }) {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] glass rounded-lg px-3 py-2 text-[10px] space-y-1.5">
      <p className="font-semibold text-foreground text-[11px] mb-1">Загруженность</p>
      {(["free", "slow", "heavy"] as CongestionLevel[]).map((lvl) => (
        <div key={lvl} className="flex items-center gap-2">
          <span
            className="w-6 h-[3px] rounded-full"
            style={{ background: CONGESTION_COLORS[lvl] }}
          />
          <span className="text-muted-foreground">{CONGESTION_LABELS[lvl]}</span>
        </div>
      ))}
      <div className="border-t border-border/50 pt-1 mt-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#EF4444] border border-white" />
          <span className="text-muted-foreground">ДТП</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#F97316] border border-white" />
          <span className="text-muted-foreground">Ремонт / Затор</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#6B7280] border border-white" />
          <span className="text-muted-foreground">Перекрытие</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#3B82F6] border border-white" />
          <span className="text-muted-foreground">Погода / Полиция</span>
        </div>
      </div>
      <div className="border-t border-border/50 pt-1 mt-1 flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
        <span className="text-muted-foreground">
          {connected ? `Live · ${liveCount} событий` : "Офлайн"}
        </span>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

interface TrafficMapContainerProps {
  cityId: CityId;
  cityName: string;
}

const TrafficMapContainer = ({ cityId, cityName }: TrafficMapContainerProps) => {
  const [selectedIncident, setSelectedIncident] = useState<MapIncident | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["map-data", cityId],
    queryFn: () => fetchMapData(cityId),
    refetchInterval: 60000,
  });

  const { events: liveEvents, connected, newEventIds } = useRealtimeEvents(cityId);

  const handleIncidentClick = useCallback((incident: MapIncident) => {
    setSelectedIncident(incident);
  }, []);

  const center: [number, number] = data
    ? [data.center.lat, data.center.lng]
    : [43.238, 76.945];
  const zoom = data?.zoom ?? 12;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="glass neon-border-cyan relative overflow-hidden rounded-xl"
    >
      {/* Header */}
      <div className="relative z-10 px-4 pt-4 pb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-neon-cyan" />
          <h3 className="font-display font-semibold text-sm text-foreground">
            Дорожная обстановка · {cityName}
          </h3>
          {isLoading && (
            <span className="ml-2 text-[10px] text-muted-foreground animate-pulse">Загрузка...</span>
          )}
          <span className={`ml-2 inline-flex items-center gap-1 text-[10px] ${connected ? "text-green-500" : "text-red-400"}`}>
            {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {connected ? "Live" : "Офлайн"}
            {connected && liveEvents.length > 0 && (
              <span className="bg-red-500 text-white rounded-full px-1.5 py-0 text-[9px] font-bold ml-1">
                {liveEvents.length}
              </span>
            )}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-5 h-[2.5px] rounded-full bg-[#FF0000]" /> Пробка
          </span>
          <span className="flex items-center gap-1">
            <span className="w-5 h-[2.5px] rounded-full bg-[#FF8000]" /> Затруднение
          </span>
          <span className="flex items-center gap-1">
            <span className="w-5 h-[2.5px] rounded-full bg-[#55AA00]" /> Свободно
          </span>
          <Layers className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* Map + Analysis panel grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-0">
        {/* Map */}
        <div className="relative z-10 overflow-hidden rounded-lg border border-border/40 m-4 mt-0">
          <MapContainer
            center={center}
            zoom={zoom}
            className="h-[420px] w-full sm:h-[500px] lg:h-[560px]"
            scrollWheelZoom={true}
            zoomControl={true}
          >
            {/* CartoDB Voyager — shows rivers, parks, terrain */}
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            <FlyToCity lat={center[0]} lng={center[1]} zoom={zoom} />

            {/* Traffic polylines */}
            {data?.polylines.map((polyline, i) => (
              <Polyline
                key={`${polyline.road_name}-${i}`}
                positions={polyline.coords as [number, number][]}
                pathOptions={{
                  color: CONGESTION_COLORS[polyline.congestion_level],
                  weight: 4,
                  opacity: 0.85,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              >
                <Popup>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12 }}>
                    <strong>{polyline.road_name}</strong>
                    <br />
                    <span style={{ color: CONGESTION_COLORS[polyline.congestion_level], fontWeight: 600 }}>
                      {CONGESTION_LABELS[polyline.congestion_level]}
                    </span>
                  </div>
                </Popup>
              </Polyline>
            ))}

            {/* Incident markers (from REST API) */}
            {data?.incidents.map((incident) => (
              <Marker
                key={incident.id}
                position={[incident.lat, incident.lng]}
                icon={createIncidentMarker(incident)}
                eventHandlers={{
                  click: () => handleIncidentClick(incident),
                }}
              >
                <Popup>
                  <IncidentPopupContent incident={incident} />
                </Popup>
              </Marker>
            ))}

            {/* Live event markers (from WebSocket) */}
            {liveEvents.map((event) => (
              <Marker
                key={`live-${event.id}`}
                position={[event.lat, event.lng]}
                icon={createLiveEventMarker(event, newEventIds.has(event.id))}
              >
                <Popup>
                  <LiveEventPopupContent event={event} />
                </Popup>
              </Marker>
            ))}

            <MapLegend liveCount={liveEvents.length} connected={connected} />
          </MapContainer>
        </div>

        {/* AI Analysis panel */}
        <div className="px-4 pb-4 xl:pl-0 xl:pr-4 xl:pt-0">
          <IncidentAnalysisPanel
            incident={selectedIncident}
            cityName={cityName}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TrafficMapContainer;
