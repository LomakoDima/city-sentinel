import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings, User, Bell, Shield, Palette, Globe, Monitor,
  Sun, Moon, Check,
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import type { CityId } from "@/lib/traffic";

interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

const Toggle = ({ enabled, onToggle }: ToggleProps) => (
  <button
    type="button"
    onClick={onToggle}
    className={`relative w-10 h-5.5 rounded-full transition-colors ${
      enabled ? "bg-primary" : "bg-border"
    }`}
  >
    <motion.div
      className="absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm"
      animate={{ left: enabled ? 20 : 2 }}
      transition={{ duration: 0.2 }}
    />
  </button>
);

const sectionMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

const SettingsPage = () => {
  const [selectedCity, setSelectedCity] = useState<CityId>("almaty");
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [language, setLanguage] = useState<"ru" | "kz" | "en">("ru");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [refreshInterval, setRefreshInterval] = useState("30");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background lg:h-screen lg:flex-row lg:overflow-hidden">
      <Sidebar selectedCity={selectedCity} onCityChange={setSelectedCity} />

      <main className="flex-1 p-3 sm:p-4 lg:overflow-y-auto lg:p-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10">
            <Settings className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">Настройки</h1>
            <p className="text-xs text-muted-foreground">Управление аккаунтом и параметрами системы</p>
          </div>
        </motion.div>

        <div className="max-w-3xl space-y-5">
          {/* Profile section */}
          <motion.section {...sectionMotion} className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-primary" />
              <h2 className="font-display text-sm font-semibold text-foreground">Профиль</h2>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-emerald-500 flex items-center justify-center text-white text-lg font-bold shrink-0">
                D
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">Demo User</p>
                <p className="text-xs text-muted-foreground">demo@citysentinel.kz</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Роль: Администратор</p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/50 transition"
              >
                Изменить
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">Имя</label>
                <input
                  type="text"
                  defaultValue="Demo User"
                  className="w-full h-9 px-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">Email</label>
                <input
                  type="email"
                  defaultValue="demo@citysentinel.kz"
                  className="w-full h-9 px-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
            </div>
          </motion.section>

          {/* Notifications */}
          <motion.section {...sectionMotion} transition={{ duration: 0.3, delay: 0.05 }} className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-primary" />
              <h2 className="font-display text-sm font-semibold text-foreground">Уведомления</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">Push-уведомления</p>
                  <p className="text-[10px] text-muted-foreground">Получать уведомления о инцидентах</p>
                </div>
                <Toggle enabled={notifications} onToggle={() => setNotifications(!notifications)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">Email-оповещения</p>
                  <p className="text-[10px] text-muted-foreground">Дублирование на электронную почту</p>
                </div>
                <Toggle enabled={emailAlerts} onToggle={() => setEmailAlerts(!emailAlerts)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">Звуковые сигналы</p>
                  <p className="text-[10px] text-muted-foreground">Звук при критических событиях</p>
                </div>
                <Toggle enabled={soundAlerts} onToggle={() => setSoundAlerts(!soundAlerts)} />
              </div>
            </div>
          </motion.section>

          {/* Appearance */}
          <motion.section {...sectionMotion} transition={{ duration: 0.3, delay: 0.1 }} className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-primary" />
              <h2 className="font-display text-sm font-semibold text-foreground">Внешний вид</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-foreground mb-2">Тема оформления</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: "light", label: "Светлая", icon: Sun },
                    { value: "dark", label: "Тёмная", icon: Moon },
                    { value: "system", label: "Системная", icon: Monitor },
                  ] as const).map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTheme(t.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition ${
                        theme === t.value
                          ? "border-primary bg-primary/5 text-primary font-semibold"
                          : "border-border text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      <t.icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">Язык интерфейса</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: "ru", label: "Русский", flag: "🇷🇺" },
                    { value: "kz", label: "Қазақша", flag: "🇰🇿" },
                    { value: "en", label: "English", flag: "🇬🇧" },
                  ] as const).map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => setLanguage(lang.value)}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs transition ${
                        language === lang.value
                          ? "border-primary bg-primary/5 text-primary font-semibold"
                          : "border-border text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Data & Performance */}
          <motion.section {...sectionMotion} transition={{ duration: 0.3, delay: 0.15 }} className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-primary" />
              <h2 className="font-display text-sm font-semibold text-foreground">Данные и производительность</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">Авто-обновление данных</p>
                  <p className="text-[10px] text-muted-foreground">Автоматическая загрузка свежих данных</p>
                </div>
                <Toggle enabled={autoRefresh} onToggle={() => setAutoRefresh(!autoRefresh)} />
              </div>
              {autoRefresh && (
                <div>
                  <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                    Интервал обновления (секунды)
                  </label>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  >
                    <option value="10">10 сек</option>
                    <option value="30">30 сек</option>
                    <option value="60">1 мин</option>
                    <option value="300">5 мин</option>
                  </select>
                </div>
              )}
            </div>
          </motion.section>

          {/* Security */}
          <motion.section {...sectionMotion} transition={{ duration: 0.3, delay: 0.2 }} className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-primary" />
              <h2 className="font-display text-sm font-semibold text-foreground">Безопасность</h2>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                className="w-full flex items-center justify-between rounded-lg border border-border px-4 py-3 text-xs hover:bg-secondary/40 transition"
              >
                <span className="text-foreground font-medium">Изменить пароль</span>
                <span className="text-muted-foreground">→</span>
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-between rounded-lg border border-border px-4 py-3 text-xs hover:bg-secondary/40 transition"
              >
                <span className="text-foreground font-medium">Двухфакторная аутентификация</span>
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">Выкл</span>
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-between rounded-lg border border-border px-4 py-3 text-xs hover:bg-secondary/40 transition"
              >
                <span className="text-foreground font-medium">Активные сессии</span>
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">1 устройство</span>
              </button>
            </div>
          </motion.section>

          {/* Save button */}
          <motion.div
            {...sectionMotion}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="flex items-center gap-3 pb-6"
          >
            <motion.button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {saved ? <Check className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
              {saved ? "Сохранено!" : "Сохранить настройки"}
            </motion.button>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-emerald-600 font-medium"
              >
                Настройки успешно сохранены
              </motion.span>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
