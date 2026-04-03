import { motion } from "framer-motion";
import { Wifi, Shield, Clock, Users } from "lucide-react";

const StatusBar = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass flex flex-col gap-3 rounded-xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
    >
      <div>
        <h2 className="font-display font-bold text-lg text-foreground">City Dashboard</h2>
        <p className="text-[11px] text-muted-foreground">Real-time monitoring · District Alpha</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end sm:gap-5">
        {[
          { icon: Users, label: "12.4M", sub: "Population" },
          { icon: Shield, label: "99.7%", sub: "Uptime" },
          { icon: Wifi, label: "Active", sub: "IoT Grid" },
        ].map((item) => (
          <div key={item.sub} className="flex items-center gap-2">
            <item.icon className="w-3.5 h-3.5 text-neon-cyan" />
            <div>
              <p className="text-xs font-semibold text-foreground">{item.label}</p>
              <p className="text-[9px] text-muted-foreground">{item.sub}</p>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default StatusBar;
