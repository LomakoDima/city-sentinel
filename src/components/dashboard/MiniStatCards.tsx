import { motion } from "framer-motion";
import { Gauge, TriangleAlert, Route, Wrench } from "lucide-react";
import type { TrafficResponse } from "@/lib/traffic";

interface MiniStatCardsProps {
  data: TrafficResponse;
}

const MiniStatCards = ({ data }: MiniStatCardsProps) => {
  const stats = [
    { icon: Gauge, label: "Пробки", value: `${data.traffic_score.toFixed(1)} / 10`, color: "text-neon-red", bg: "bg-neon-red/10" },
    { icon: TriangleAlert, label: "Инциденты", value: `${data.incidents.length}`, color: "text-neon-orange", bg: "bg-neon-orange/10" },
    { icon: Route, label: "Средняя скорость", value: `${data.avg_speed_kmh} км/ч`, color: "text-neon-cyan", bg: "bg-neon-cyan/10" },
    { icon: Wrench, label: "Износ дорог", value: `${100 - data.road_condition_percent}%`, color: "text-neon-purple", bg: "bg-neon-purple/10" },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.05 }}
          className="glass flex items-center gap-3 rounded-xl p-3"
        >
          <div className={`p-2 rounded-lg ${stat.bg}`}>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            <p className="text-sm font-display font-bold text-foreground">{stat.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MiniStatCards;
