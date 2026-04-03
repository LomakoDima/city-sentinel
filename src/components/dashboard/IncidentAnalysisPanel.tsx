import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  AlertTriangle,
  Clock,
  Timer,
  Lightbulb,
  Car,
  HardHat,
  ShieldOff,
  Zap,
  TrendingUp,
} from "lucide-react";
import type { MapIncident } from "@/lib/traffic";

interface IncidentAnalysisPanelProps {
  incident: MapIncident | null;
  cityName: string;
}

const severityConfig = {
  low: { label: "Низкая", color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-200" },
  medium: { label: "Средняя", color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-200" },
  high: { label: "Высокая", color: "text-red-600", bg: "bg-red-50", ring: "ring-red-200" },
};

const typeConfig = {
  "ДТП": { icon: Car, color: "text-red-500", bg: "bg-red-50", label: "ДТП" },
  "ремонт": { icon: HardHat, color: "text-orange-500", bg: "bg-orange-50", label: "Дорожные работы" },
  "перекрытие": { icon: ShieldOff, color: "text-gray-500", bg: "bg-gray-100", label: "Перекрытие" },
};

const IncidentAnalysisPanel = ({ incident, cityName }: IncidentAnalysisPanelProps) => {
  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        {incident ? (
          <motion.div
            key={incident.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-xl p-4 space-y-4 flex-1"
          >
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neon-cyan/10">
                <Brain className="w-4 h-4 text-neon-cyan" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm text-foreground">Анализ инцидента</h3>
                <p className="text-[10px] text-muted-foreground">ИИ Decision Support</p>
              </div>
            </div>

            {/* Incident type + severity */}
            <div className="flex items-center gap-2 flex-wrap">
              {(() => {
                const cfg = typeConfig[incident.type];
                const Icon = cfg.icon;
                return (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </span>
                );
              })()}
              {(() => {
                const sev = severityConfig[incident.severity];
                return (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ${sev.bg} ${sev.color} ${sev.ring}`}>
                    <AlertTriangle className="w-3 h-3" />
                    {sev.label}
                  </span>
                );
              })()}
            </div>

            {/* Location */}
            <div className="rounded-lg bg-secondary/40 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Местоположение</p>
              <p className="font-display text-sm font-bold text-foreground">{incident.road_name}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{cityName}</p>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-secondary/40 p-2.5 text-center">
                <Clock className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">Зафиксирован</p>
                <p className="font-display text-sm font-bold text-foreground">{incident.timestamp}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2.5 text-center">
                <Timer className="w-3.5 h-3.5 text-amber-600 mx-auto mb-1" />
                <p className="text-[10px] text-amber-700">Задержка</p>
                <p className="font-display text-sm font-bold text-amber-700">+{incident.delay_minutes} мин</p>
              </div>
            </div>

            {/* Impact analysis */}
            <div className="rounded-lg border border-border/50 p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-neon-purple" />
                <p className="text-[11px] font-semibold text-foreground">Влияние на трафик</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {incident.description}
              </p>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 text-red-600 font-medium">
                  <Zap className="w-3 h-3" />
                  +{incident.delay_minutes} мин задержки
                </span>
                <span className="text-muted-foreground">
                  Тип: {incident.type}
                </span>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="rounded-lg bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5 border border-neon-cyan/20 p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-neon-cyan" />
                <p className="text-[11px] font-semibold text-foreground">Рекомендация ИИ</p>
              </div>
              <p className="text-[11.5px] text-foreground/80 leading-relaxed">
                {incident.ai_recommendation}
              </p>
            </div>

            {/* Coordinates */}
            <div className="text-[10px] text-muted-foreground flex items-center gap-3">
              <span>{incident.lat.toFixed(4)}°, {incident.lng.toFixed(4)}°</span>
              <span>ID: {incident.id}</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass rounded-xl p-6 flex-1 flex flex-col items-center justify-center text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/60 flex items-center justify-center mb-3">
              <Brain className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <h4 className="font-display text-sm font-semibold text-foreground mb-1">
              ИИ-анализ инцидентов
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[240px]">
              Нажмите на маркер инцидента на карте, чтобы получить детальный анализ
              и рекомендации системы ИИ.
            </p>
            <div className="mt-4 flex items-center gap-3 text-[10px] text-muted-foreground/70">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> ДТП
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400" /> Ремонт
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-400" /> Перекрытие
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IncidentAnalysisPanel;
