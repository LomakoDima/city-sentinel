import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  color: "cyan" | "green" | "red" | "orange" | "purple";
  progress: number;
}

const colorMap = {
  cyan: { ring: "stroke-neon-cyan", text: "text-neon-cyan", bg: "bg-neon-cyan/10", shadow: "shadow-sm" },
  green: { ring: "stroke-neon-green", text: "text-neon-green", bg: "bg-neon-green/10", shadow: "shadow-sm" },
  red: { ring: "stroke-neon-red", text: "text-neon-red", bg: "bg-neon-red/10", shadow: "shadow-sm" },
  orange: { ring: "stroke-neon-orange", text: "text-neon-orange", bg: "bg-neon-orange/10", shadow: "shadow-sm" },
  purple: { ring: "stroke-neon-purple", text: "text-neon-purple", bg: "bg-neon-purple/10", shadow: "shadow-sm" },
};

const CircularProgress = ({ progress, color }: { progress: number; color: string }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="transform -rotate-90">
      <circle cx="36" cy="36" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="4" opacity="0.3" />
      <motion.circle
        cx="36" cy="36" r={radius} fill="none"
        className={color}
        strokeWidth="4" strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
    </svg>
  );
};

const KPICard = ({ title, value, change, changeType, icon: Icon, color, progress }: KPICardProps) => {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-xl p-4 ${c.shadow} hover:scale-[1.02] transition-transform duration-300`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${c.bg}`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
        <div className="relative">
          <CircularProgress progress={progress} color={c.ring} />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-foreground">
            {progress}%
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-1">{title}</p>
      <p className="text-xl font-display font-bold text-foreground">{value}</p>
      <p className={`text-xs mt-1 ${changeType === "positive" ? "text-neon-green" : changeType === "negative" ? "text-neon-red" : "text-muted-foreground"}`}>
        {change}
      </p>
    </motion.div>
  );
};

export default KPICard;
