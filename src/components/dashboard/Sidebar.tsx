import { motion } from "framer-motion";
import { Car, Wind, Zap, LayoutDashboard, Map, Bell, Settings, ChevronRight } from "lucide-react";
import KPICard from "./KPICard";
import AIInsightsPanel from "./AIInsightsPanel";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Map, label: "City Map", active: false },
  { icon: Bell, label: "Alerts", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const Sidebar = () => {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-[340px] h-screen glass-strong flex flex-col border-r border-border/30 overflow-y-auto"
    >
      {/* Logo */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sm text-foreground tracking-tight">NexaCity</h1>
            <p className="text-[10px] text-muted-foreground">Smart City OS v3.2</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 mb-4">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
              item.active
                ? "bg-neon-cyan/10 text-neon-cyan"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
            {item.active && <ChevronRight className="w-3 h-3 ml-auto" />}
          </button>
        ))}
      </nav>

      {/* KPI Cards */}
      <div className="px-3 space-y-3 mb-4">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1">Key Metrics</p>
        <KPICard
          title="Traffic Flow"
          value="87.3K"
          change="+12.5% from yesterday"
          changeType="positive"
          icon={Car}
          color="cyan"
          progress={73}
        />
        <KPICard
          title="Air Quality Index"
          value="142 AQI"
          change="-8.2% declining"
          changeType="negative"
          icon={Wind}
          color="green"
          progress={58}
        />
        <KPICard
          title="Energy Usage"
          value="2.4 GW"
          change="+3.1% optimized"
          changeType="positive"
          icon={Zap}
          color="purple"
          progress={82}
        />
      </div>

      {/* AI Insights */}
      <div className="px-3 pb-4 mt-auto">
        <AIInsightsPanel />
      </div>
    </motion.aside>
  );
};

export default Sidebar;
