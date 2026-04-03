import { motion } from "framer-motion";
import { Brain, AlertTriangle, Lightbulb, TrendingUp, Zap } from "lucide-react";

const insights = [
  { icon: AlertTriangle, text: "Traffic congestion detected on Sector 7-B. Rerouting suggested via Highway 9.", type: "alert" as const },
  { icon: TrendingUp, text: "Energy consumption reduced 12% this week through AI load balancing.", type: "success" as const },
  { icon: Lightbulb, text: "Air quality index dropping in Zone 4. Recommend activating filtration grid.", type: "warning" as const },
  { icon: Zap, text: "Solar grid output exceeding forecasts by 8%. Storing surplus in battery banks.", type: "success" as const },
];

const typeStyles = {
  alert: "border-neon-red/30 bg-neon-red/5",
  success: "border-neon-green/30 bg-neon-green/5",
  warning: "border-neon-orange/30 bg-neon-orange/5",
};

const iconStyles = {
  alert: "text-neon-red",
  success: "text-neon-green",
  warning: "text-neon-orange",
};

const AIInsightsPanel = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="neon-border-purple glass rounded-xl p-4 relative overflow-hidden"
    >
      {/* Glow effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-purple/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-neon-cyan/5 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-neon-purple/15">
            <Brain className="w-4 h-4 text-neon-purple" />
          </div>
          <h3 className="font-display font-semibold text-sm text-foreground">AI Insights</h3>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple animate-pulse-glow">
            LIVE
          </span>
        </div>

        <div className="space-y-2.5">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${typeStyles[insight.type]}`}
            >
              <insight.icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${iconStyles[insight.type]}`} />
              <p className="text-[11px] leading-relaxed text-foreground/80">{insight.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AIInsightsPanel;
