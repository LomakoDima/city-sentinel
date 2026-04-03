import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar, Legend,
  AreaChart, Area, LineChart, Line,
} from "recharts";
import {
  BarChart3, PieChartIcon, Gauge, TrendingUp, Zap,
  Thermometer, Car, Wind,
} from "lucide-react";
import type { TrafficResponse } from "@/lib/traffic";

interface DashboardChartsProps {
  data: TrafficResponse;
}

const COLORS = [
  "hsl(172, 66%, 50%)",  // cyan
  "hsl(258, 90%, 66%)",  // purple
  "hsl(24, 100%, 62%)",  // orange
  "hsl(348, 83%, 60%)",  // red
  "hsl(142, 71%, 45%)",  // green
  "hsl(199, 89%, 48%)",  // blue
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-[10px] shadow-lg border border-border/30">
      <p className="text-muted-foreground mb-1 font-medium">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color || entry.stroke }} className="font-semibold">
          {entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}
        </p>
      ))}
    </div>
  );
};

function generateSpeedByHour(congestion: TrafficResponse["congestion_trend_12h"]) {
  return congestion.map((p) => ({
    hour: p.hour,
    score: p.score,
    speed: Math.max(5, Math.round(60 - p.score * 5 + (Math.random() * 4 - 2))),
    volume: Math.round(800 + p.score * 120 + (Math.random() * 100 - 50)),
  }));
}

function generateIncidentTypes(incidents: TrafficResponse["incidents"]) {
  const counts: Record<string, number> = { "ДТП": 0, "ремонт": 0, "перекрытие": 0 };
  incidents.forEach((inc) => { counts[inc.type] = (counts[inc.type] || 0) + 1; });
  if (incidents.length === 0) {
    return [
      { name: "ДТП", value: 0, fill: COLORS[3] },
      { name: "Ремонт", value: 0, fill: COLORS[2] },
      { name: "Перекрытие", value: 0, fill: COLORS[1] },
    ];
  }
  return [
    { name: "ДТП", value: counts["ДТП"], fill: COLORS[3] },
    { name: "Ремонт", value: counts["ремонт"], fill: COLORS[2] },
    { name: "Перекрытие", value: counts["перекрытие"], fill: COLORS[1] },
  ];
}

function generateRadarData(data: TrafficResponse) {
  return [
    { metric: "Трафик", value: data.traffic_score * 10, max: 100 },
    { metric: "Скорость", value: Math.min(data.avg_speed_kmh * 1.5, 100), max: 100 },
    { metric: "Дороги", value: data.road_condition_percent, max: 100 },
    { metric: "Инциденты", value: Math.min(data.incidents.length * 20, 100), max: 100 },
    { metric: "Безопасность", value: Math.max(100 - data.incidents.length * 15 - (10 - data.traffic_score) * 2, 20), max: 100 },
    { metric: "Экология", value: Math.max(100 - data.traffic_score * 8, 15), max: 100 },
  ];
}

function generateWeeklyData() {
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  return days.map((day) => ({
    day,
    morning: +(Math.random() * 4 + 3).toFixed(1),
    evening: +(Math.random() * 5 + 4).toFixed(1),
    night: +(Math.random() * 2 + 0.5).toFixed(1),
  }));
}

function generateRadialData(data: TrafficResponse) {
  return [
    {
      name: "Загруженность",
      value: data.traffic_score * 10,
      fill: "hsl(348, 83%, 60%)",
    },
    {
      name: "Состояние дорог",
      value: data.road_condition_percent,
      fill: "hsl(142, 71%, 45%)",
    },
    {
      name: "Безопасность",
      value: Math.max(100 - data.incidents.length * 20, 20),
      fill: "hsl(199, 89%, 48%)",
    },
  ];
}

const DashboardCharts = ({ data }: DashboardChartsProps) => {
  const hourlyData = useMemo(() => generateSpeedByHour(data.congestion_trend_12h), [data]);
  const incidentPie = useMemo(() => generateIncidentTypes(data.incidents), [data]);
  const radarData = useMemo(() => generateRadarData(data), [data]);
  const weeklyData = useMemo(() => generateWeeklyData(), []);
  const radialData = useMemo(() => generateRadialData(data), [data]);

  const hasIncidents = data.incidents.length > 0;
  const chartH = typeof window !== "undefined" && window.innerWidth < 640 ? 180 : 220;

  return (
    <div className="space-y-4">
      {/* Row 1: Speed + Volume bar chart & Incident pie chart */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Speed & Volume by hour */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-xl p-4"
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-neon-blue/10 p-1.5">
              <BarChart3 className="w-4 h-4 text-neon-blue" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground">Скорость и объём трафика</h3>
              <p className="text-[10px] text-muted-foreground">По часам за последние 12ч</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={chartH}>
            <BarChart data={hourlyData} barGap={2}>
              <defs>
                <linearGradient id="gradSpeed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="gradVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(258, 90%, 66%)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(258, 90%, 66%)" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 20%, 16%)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="speed" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="volume" orientation="right" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="speed" dataKey="speed" fill="url(#gradSpeed)" name="Скорость (км/ч)" radius={[3, 3, 0, 0]} barSize={14} />
              <Bar yAxisId="volume" dataKey="volume" fill="url(#gradVolume)" name="Объём (авто/ч)" radius={[3, 3, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-wrap justify-center gap-4">
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-neon-cyan" /> Скорость (км/ч)
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-neon-purple" /> Объём (авто/ч)
            </span>
          </div>
        </motion.div>

        {/* Incident pie */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-4"
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-neon-orange/10 p-1.5">
              <PieChartIcon className="w-4 h-4 text-neon-orange" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground">Инциденты по типу</h3>
              <p className="text-[10px] text-muted-foreground">{hasIncidents ? `${data.incidents.length} активных` : "Нет инцидентов"}</p>
            </div>
          </div>
          {hasIncidents ? (
            <ResponsiveContainer width="100%" height={chartH}>
              <PieChart>
                <Pie
                  data={incidentPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {incidentPie.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center" style={{ height: chartH }}>
              <div className="w-12 h-12 rounded-2xl bg-neon-green/10 flex items-center justify-center mb-3">
                <Car className="w-5 h-5 text-neon-green" />
              </div>
              <p className="text-xs font-medium text-foreground/70">Всё спокойно</p>
              <p className="text-[10px] text-muted-foreground">Инцидентов не зафиксировано</p>
            </div>
          )}
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            {incidentPie.map((item) => (
              <span key={item.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                {item.name} ({item.value})
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 2: Radar + Radial bar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Radar chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass rounded-xl p-4"
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-neon-green/10 p-1.5">
              <Gauge className="w-4 h-4 text-neon-green" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground">Общая оценка города</h3>
              <p className="text-[10px] text-muted-foreground">Комплексный анализ метрик</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={chartH + 20}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="hsl(225, 20%, 16%)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
              <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
              <Radar
                name="Показатель"
                dataKey="value"
                stroke="hsl(172, 66%, 50%)"
                fill="hsl(172, 66%, 50%)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radial bar — city health */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl p-4"
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-neon-red/10 p-1.5">
              <Thermometer className="w-4 h-4 text-neon-red" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground">Здоровье инфраструктуры</h3>
              <p className="text-[10px] text-muted-foreground">Ключевые индикаторы</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={chartH + 20}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="25%"
              outerRadius="90%"
              data={radialData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={6}
                background={{ fill: "hsl(225, 20%, 12%)" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: 10, color: "hsl(215, 20%, 55%)" }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Row 3: Weekly heatmap bar + Speed area overlay */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Weekly congestion by time of day */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="glass rounded-xl p-4"
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-neon-purple/10 p-1.5">
              <TrendingUp className="w-4 h-4 text-neon-purple" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground">Загрузка по дням недели</h3>
              <p className="text-[10px] text-muted-foreground">Утро / Вечер / Ночь</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={chartH}>
            <BarChart data={weeklyData} barGap={1}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 20%, 16%)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} domain={[0, 10]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="morning" name="Утро" fill="hsl(24, 100%, 62%)" radius={[2, 2, 0, 0]} barSize={10} />
              <Bar dataKey="evening" name="Вечер" fill="hsl(258, 90%, 66%)" radius={[2, 2, 0, 0]} barSize={10} />
              <Bar dataKey="night" name="Ночь" fill="hsl(199, 89%, 48%)" radius={[2, 2, 0, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-neon-orange" /> Утро
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-neon-purple" /> Вечер
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-neon-blue" /> Ночь
            </span>
          </div>
        </motion.div>

        {/* Multi-line: congestion + speed overlay */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-xl p-4"
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-neon-cyan/10 p-1.5">
              <Zap className="w-4 h-4 text-neon-cyan" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground">Пробки vs Скорость</h3>
              <p className="text-[10px] text-muted-foreground">Корреляция показателей</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={chartH}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="gradCongArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(348, 83%, 60%)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(348, 83%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradSpeedArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 20%, 16%)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="cong" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} domain={[0, 10]} />
              <YAxis yAxisId="spd" orientation="right" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area yAxisId="cong" type="monotone" dataKey="score" stroke="hsl(348, 83%, 60%)" fill="url(#gradCongArea)" strokeWidth={2} name="Пробки (балл)" dot={false} />
              <Area yAxisId="spd" type="monotone" dataKey="speed" stroke="hsl(172, 66%, 50%)" fill="url(#gradSpeedArea)" strokeWidth={2} name="Скорость (км/ч)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-wrap justify-center gap-4">
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-neon-red" /> Пробки
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-neon-cyan" /> Скорость
            </span>
          </div>
        </motion.div>
      </div>

      {/* Row 4: Full-width — Environment metrics */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="glass rounded-xl p-4"
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-neon-green/10 p-1.5">
            <Wind className="w-4 h-4 text-neon-green" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">Экологические показатели</h3>
            <p className="text-[10px] text-muted-foreground">CO₂, шум, качество воздуха за 12ч</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={chartH}>
          <LineChart data={hourlyData.map((h, i) => ({
            hour: h.hour,
            co2: Math.round(40 + h.score * 8 + Math.sin(i) * 5),
            noise: Math.round(50 + h.score * 4 + Math.cos(i) * 3),
            aqi: Math.round(60 + h.score * 6 - Math.sin(i * 0.5) * 4),
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 20%, 16%)" />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="co2" stroke="hsl(142, 71%, 45%)" strokeWidth={2} name="CO₂ (мг/м³)" dot={false} />
            <Line type="monotone" dataKey="noise" stroke="hsl(258, 90%, 66%)" strokeWidth={2} name="Шум (дБ)" dot={false} />
            <Line type="monotone" dataKey="aqi" stroke="hsl(24, 100%, 62%)" strokeWidth={2} name="AQI" dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-3 flex flex-wrap justify-center gap-4">
          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-neon-green" /> CO₂
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-neon-purple" /> Шум
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-neon-orange" /> AQI
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardCharts;
