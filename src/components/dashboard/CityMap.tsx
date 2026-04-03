import { motion } from "framer-motion";
import { MapPin, Layers } from "lucide-react";

const buildings = [
  { x: 120, y: 180, w: 30, h: 80, delay: 0 },
  { x: 170, y: 160, w: 25, h: 100, delay: 0.1 },
  { x: 210, y: 170, w: 35, h: 90, delay: 0.05 },
  { x: 270, y: 150, w: 20, h: 110, delay: 0.15 },
  { x: 310, y: 175, w: 28, h: 85, delay: 0.08 },
  { x: 360, y: 165, w: 32, h: 95, delay: 0.12 },
  { x: 420, y: 155, w: 22, h: 105, delay: 0.06 },
  { x: 460, y: 180, w: 26, h: 80, delay: 0.18 },
  { x: 510, y: 170, w: 30, h: 90, delay: 0.1 },
  { x: 560, y: 160, w: 24, h: 100, delay: 0.14 },
  { x: 150, y: 280, w: 28, h: 70, delay: 0.2 },
  { x: 240, y: 290, w: 35, h: 60, delay: 0.22 },
  { x: 340, y: 270, w: 25, h: 80, delay: 0.16 },
  { x: 440, y: 285, w: 30, h: 65, delay: 0.24 },
  { x: 530, y: 275, w: 22, h: 75, delay: 0.19 },
];

const heatZones = [
  { cx: 200, cy: 200, r: 70, color: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.3)" },
  { cx: 450, cy: 180, r: 60, color: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.25)" },
  { cx: 320, cy: 300, r: 55, color: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)" },
  { cx: 550, cy: 280, r: 50, color: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.3)" },
  { cx: 150, cy: 320, r: 45, color: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)" },
];

const roads = [
  "M 80 260 L 620 260",
  "M 300 100 L 300 380",
  "M 80 200 L 620 200",
  "M 80 330 L 620 330",
  "M 180 100 L 180 380",
  "M 480 100 L 480 380",
];

const CityMap = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-xl p-4 neon-border-cyan relative overflow-hidden h-full"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/4 w-60 h-60 bg-neon-cyan/5 rounded-full blur-[80px]" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-neon-purple/5 rounded-full blur-[60px]" />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-neon-cyan" />
          <h3 className="font-display font-semibold text-sm text-foreground">City Overview</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-red/60" /> High Traffic</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-green/60" /> Optimal</span>
          <Layers className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>

      <div className="relative z-10 dot-grid rounded-lg overflow-hidden" style={{ background: "hsl(var(--surface-1))" }}>
        <svg viewBox="0 0 700 400" className="w-full h-auto">
          {/* Grid roads */}
          {roads.map((d, i) => (
            <motion.path
              key={i} d={d} stroke="hsl(var(--border))" strokeWidth="1.5" fill="none" opacity="0.4"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: i * 0.1 }}
            />
          ))}

          {/* Heat zones */}
          {heatZones.map((zone, i) => (
            <motion.circle
              key={i} cx={zone.cx} cy={zone.cy} r={zone.r}
              fill={zone.color} stroke={zone.border} strokeWidth="1"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
              style={{ transformOrigin: `${zone.cx}px ${zone.cy}px` }}
            />
          ))}

          {/* Buildings */}
          {buildings.map((b, i) => (
            <motion.rect
              key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="2"
              fill="hsl(var(--surface-3))" stroke="hsl(var(--neon-cyan) / 0.2)" strokeWidth="0.5"
              initial={{ height: 0, y: b.y + b.h }}
              animate={{ height: b.h, y: b.y }}
              transition={{ duration: 0.6, delay: 0.2 + b.delay }}
            />
          ))}

          {/* Glowing dots (active points) */}
          {[{ x: 200, y: 200 }, { x: 450, y: 180 }, { x: 320, y: 300 }, { x: 550, y: 280 }].map((p, i) => (
            <motion.circle
              key={i} cx={p.x} cy={p.y} r="4"
              fill={i % 2 === 0 ? "hsl(var(--neon-red))" : "hsl(var(--neon-green))"}
              className="animate-pulse-glow"
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          ))}
        </svg>
      </div>
    </motion.div>
  );
};

export default CityMap;
