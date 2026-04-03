import { motion } from "framer-motion";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Activity } from "lucide-react";
import type { CongestionPoint } from "@/lib/traffic";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-[10px]">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.stroke }} className="font-medium">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

interface LineChartPanelProps {
  data: CongestionPoint[];
}

const LineChartPanel = ({ data }: LineChartPanelProps) => {
  const chartHeight = typeof window !== "undefined" && window.innerWidth < 640 ? 180 : 220;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-xl p-4"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Activity className="w-4 h-4 text-neon-cyan" />
        <h3 className="font-display font-semibold text-sm text-foreground">Динамика пробок</h3>
        <span className="text-[10px] text-muted-foreground sm:ml-auto">Последние 12 часов</span>
      </div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gradTraffic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(172 66% 50%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(172 66% 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 20% 16%)" />
          <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="score" stroke="hsl(172 66% 50%)" fill="url(#gradTraffic)" strokeWidth={2} name="Пробки (балл)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap justify-center gap-2 sm:gap-4">
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-neon-cyan" />
          Индекс загруженности
        </span>
      </div>
    </motion.div>
  );
};

export default LineChartPanel;
