import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Activity } from "lucide-react";

const data = [
  { time: "00:00", traffic: 32, energy: 65, air: 82 },
  { time: "04:00", traffic: 18, energy: 45, air: 88 },
  { time: "08:00", traffic: 78, energy: 82, air: 65 },
  { time: "12:00", traffic: 65, energy: 90, air: 58 },
  { time: "16:00", traffic: 85, energy: 78, air: 52 },
  { time: "20:00", traffic: 55, energy: 70, air: 72 },
  { time: "23:59", traffic: 28, energy: 55, air: 85 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-[10px]">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.stroke }} className="font-medium">
          {entry.name}: {entry.value}%
        </p>
      ))}
    </div>
  );
};

const LineChartPanel = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-xl p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-neon-cyan" />
        <h3 className="font-display font-semibold text-sm text-foreground">System Metrics</h3>
        <span className="ml-auto text-[10px] text-muted-foreground">Last 24h</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gradTraffic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(172 66% 50%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(172 66% 50%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradEnergy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(262 83% 58%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(262 83% 58%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradAir" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 20% 16%)" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="traffic" stroke="hsl(172 66% 50%)" fill="url(#gradTraffic)" strokeWidth={2} name="Traffic" dot={false} />
          <Area type="monotone" dataKey="energy" stroke="hsl(262 83% 58%)" fill="url(#gradEnergy)" strokeWidth={2} name="Energy" dot={false} />
          <Area type="monotone" dataKey="air" stroke="hsl(142 71% 45%)" fill="url(#gradAir)" strokeWidth={2} name="Air Quality" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-3">
        {[
          { label: "Traffic", color: "bg-neon-cyan" },
          { label: "Energy", color: "bg-neon-purple" },
          { label: "Air Quality", color: "bg-neon-green" },
        ].map((item) => (
          <span key={item.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className={`w-2 h-2 rounded-full ${item.color}`} />
            {item.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default LineChartPanel;
