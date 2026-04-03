import { motion } from "framer-motion";
import { Droplets, Thermometer, Volume2, TrafficCone } from "lucide-react";

const stats = [
  { icon: Thermometer, label: "Temperature", value: "24°C", color: "text-neon-orange", bg: "bg-neon-orange/10" },
  { icon: Droplets, label: "Humidity", value: "62%", color: "text-neon-blue", bg: "bg-neon-blue/10" },
  { icon: Volume2, label: "Noise Level", value: "45 dB", color: "text-neon-green", bg: "bg-neon-green/10" },
  { icon: TrafficCone, label: "Incidents", value: "3", color: "text-neon-red", bg: "bg-neon-red/10" },
];

const MiniStatCards = () => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.05 }}
          className="glass rounded-xl p-3 flex items-center gap-3"
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
