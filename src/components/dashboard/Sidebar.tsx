import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Map, Bell, Settings, ChevronRight, Building2,
  LogOut, User, ChevronDown, Shield, HelpCircle,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CityId } from "@/lib/traffic";

const navItems = [
  { icon: LayoutDashboard, label: "Главный дашборд", path: "/dashboard" },
  { icon: Map, label: "Карта городов", path: "/dashboard/map" },
  { icon: Bell, label: "Оповещения", path: "/dashboard/alerts" },
  { icon: Settings, label: "Настройки", path: "/dashboard/settings" },
];

const cities: Array<{ id: CityId; label: string }> = [
  { id: "almaty", label: "Алматы" },
  { id: "astana", label: "Астана" },
  { id: "shymkent", label: "Шымкент" },
  { id: "aktobe", label: "Актобе" },
  { id: "karaganda", label: "Караганда" },
  { id: "pavlodar", label: "Павлодар" },
  { id: "atyrau", label: "Атырау" },
  { id: "kostanay", label: "Костанай" },
  { id: "taraz", label: "Тараз" },
  { id: "oral", label: "Орал" },
  { id: "semey", label: "Семей" },
  { id: "ust_kamenogorsk", label: "Усть-Каменогорск" },
  { id: "petropavl", label: "Петропавловск" },
  { id: "kokshetau", label: "Кокшетау" },
  { id: "taldykorgan", label: "Талдыкорган" },
  { id: "turkistan", label: "Туркестан" },
  { id: "kyzylorda", label: "Кызылорда" },
  { id: "mangystau", label: "Актау" },
  { id: "zhezkazgan", label: "Жезказган" },
  { id: "ekibastuz", label: "Экибастуз" },
];

interface SidebarProps {
  selectedCity: CityId;
  onCityChange: (cityId: CityId) => void;
}

const accountMenuItems = [
  { icon: User, label: "Профиль" },
  { icon: Shield, label: "Безопасность" },
  { icon: Settings, label: "Настройки аккаунта" },
  { icon: HelpCircle, label: "Помощь" },
];

const Sidebar = ({ selectedCity, onCityChange }: SidebarProps) => {
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate("/auth");
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-strong flex w-full flex-col border-b border-border/30 overflow-y-auto lg:h-screen lg:w-[340px] lg:border-b-0 lg:border-r"
    >
      {/* Logo */}
      <div className="p-4 pb-3 sm:p-5 sm:pb-3">
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

      <div className="px-3 pb-2">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Выбор города</p>
        <Select value={selectedCity} onValueChange={(value) => onCityChange(value as CityId)}>
          <SelectTrigger className="h-9 glass border-border/50 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-neon-cyan" />
              <SelectValue placeholder="Выберите город" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Nav */}
      <nav className="px-3">
        {navItems.map((item) => {
          const isActive =
            item.path === "/dashboard"
              ? location.pathname === "/dashboard"
              : location.pathname.startsWith(item.path);
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                isActive
                  ? "bg-neon-cyan/10 text-neon-cyan"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
              {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Account section */}
      <div className="border-t border-border/40 px-3 py-3">
        <button
          type="button"
          onClick={() => setAccountOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-secondary/50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            D
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">Demo User</p>
            <p className="text-[10px] text-muted-foreground truncate">demo@citysentinel.kz</p>
          </div>
          <motion.div
            animate={{ rotate: accountOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </motion.div>
        </button>

        <AnimatePresence>
          {accountOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-0.5">
                {accountMenuItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                ))}
                <div className="my-1 h-px bg-border/50" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Выйти
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
