export type CityId =
  | "almaty" | "astana" | "shymkent"
  | "aktobe" | "karaganda" | "pavlodar"
  | "atyrau" | "kostanay" | "taraz"
  | "oral" | "semey" | "ust_kamenogorsk"
  | "petropavl" | "kokshetau" | "taldykorgan"
  | "turkistan" | "kyzylorda" | "mangystau"
  | "zhezkazgan" | "ekibastuz";

export interface Incident {
  type: "ДТП" | "ремонт" | "перекрытие";
  severity: "low" | "medium" | "high";
  lat: number;
  lng: number;
  road_name: string;
  description: string;
}

export interface RoadSegmentCondition {
  road_name: string;
  condition: "good" | "fair" | "repair_needed" | "critical";
  wear_percent: number;
}

export interface AIInsight {
  summary: string;
  priority: "high" | "medium" | "low";
  actions: string[];
  confidence: number;
  model_version: string;
  reasoning: string[];
  data_sources: string[];
}

export interface CongestionPoint {
  hour: string;
  score: number;
}

export interface TrafficResponse {
  city_id: CityId;
  city_name: string;
  center: {
    lat: number;
    lng: number;
  };
  traffic_score: number;
  incidents: Incident[];
  road_condition_percent: number;
  road_conditions: RoadSegmentCondition[];
  avg_speed_kmh: number;
  congestion_trend_12h: CongestionPoint[];
  ai_insight: AIInsight;
}

export const cityLabelMap: Record<CityId, string> = {
  almaty: "Алматы",
  astana: "Астана",
  shymkent: "Шымкент",
  aktobe: "Актобе",
  karaganda: "Караганда",
  pavlodar: "Павлодар",
  atyrau: "Атырау",
  kostanay: "Костанай",
  taraz: "Тараз",
  oral: "Орал",
  semey: "Семей",
  ust_kamenogorsk: "Усть-Каменогорск",
  petropavl: "Петропавловск",
  kokshetau: "Кокшетау",
  taldykorgan: "Талдыкорган",
  turkistan: "Туркестан",
  kyzylorda: "Кызылорда",
  mangystau: "Актау",
  zhezkazgan: "Жезказган",
  ekibastuz: "Экибастуз",
};

export const cityCenterMap: Record<CityId, { lat: number; lng: number }> = {
  almaty: { lat: 43.222, lng: 76.851 },
  astana: { lat: 51.169, lng: 71.449 },
  shymkent: { lat: 42.341, lng: 69.59 },
  aktobe: { lat: 50.279, lng: 57.207 },
  karaganda: { lat: 49.804, lng: 73.108 },
  pavlodar: { lat: 52.288, lng: 76.969 },
  atyrau: { lat: 47.106, lng: 51.920 },
  kostanay: { lat: 53.214, lng: 63.632 },
  taraz: { lat: 42.901, lng: 71.378 },
  oral: { lat: 51.233, lng: 51.366 },
  semey: { lat: 50.411, lng: 80.228 },
  ust_kamenogorsk: { lat: 49.948, lng: 82.628 },
  petropavl: { lat: 54.865, lng: 69.135 },
  kokshetau: { lat: 53.284, lng: 69.395 },
  taldykorgan: { lat: 45.017, lng: 78.373 },
  turkistan: { lat: 43.297, lng: 68.254 },
  kyzylorda: { lat: 44.842, lng: 65.502 },
  mangystau: { lat: 43.651, lng: 51.158 },
  zhezkazgan: { lat: 47.783, lng: 67.713 },
  ekibastuz: { lat: 51.729, lng: 75.322 },
};

// ── Map data types ──────────────────────────────────────────────────────────

export type CongestionLevel = "free" | "slow" | "heavy";

export interface TrafficPolyline {
  road_name: string;
  coords: [number, number][];       // [lat, lng][]
  congestion_level: CongestionLevel;
}

export interface MapIncident {
  id: string;
  type: "ДТП" | "ремонт" | "перекрытие";
  severity: "low" | "medium" | "high";
  lat: number;
  lng: number;
  road_name: string;
  description: string;
  timestamp: string;
  delay_minutes: number;
  ai_recommendation: string;
}

export interface MapDataResponse {
  city_id: string;
  city_name: string;
  center: { lat: number; lng: number };
  zoom: number;
  polylines: TrafficPolyline[];
  incidents: MapIncident[];
}

// ── API functions ───────────────────────────────────────────────────────────

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";

export async function fetchTraffic(cityId: CityId): Promise<TrafficResponse> {
  const response = await fetch(`${apiBase}/api/traffic/${cityId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch traffic for ${cityId}`);
  }
  return response.json() as Promise<TrafficResponse>;
}

export async function fetchMapData(cityId: CityId): Promise<MapDataResponse> {
  const response = await fetch(`${apiBase}/api/map-data/${cityId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch map data for ${cityId}`);
  }
  return response.json() as Promise<MapDataResponse>;
}

