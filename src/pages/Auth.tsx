import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Sun,
  TreePine,
  Waves,
  ArrowLeft,
} from "lucide-react";

type AuthMode = "login" | "register";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth delay
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    navigate("/dashboard");
  };

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setShowPassword(false);
  };

  const fillDemo = () => {
    setMode("login");
    setEmail("demo@citysentinel.kz");
    setPassword("demo123");
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      {/* ─── Left decorative panel ─── */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center overflow-hidden">
        {/* Multi-layer gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-cyan-400 to-emerald-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-amber-400/30 via-transparent to-transparent" />

        {/* Animated orbs */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-amber-400/20 blur-[100px]"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "10%", left: "10%" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-emerald-400/25 blur-[80px]"
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: "5%", right: "5%" }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full bg-sky-300/30 blur-[70px]"
          animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "40%", right: "20%" }}
        />

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />

        {/* Content */}
        <div className="relative z-10 max-w-md px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Nature icons */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm">
                <Sun className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm">
                <Waves className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm">
                <TreePine className="w-5 h-5" />
              </div>
            </div>

            <h1 className="font-display text-4xl font-bold leading-tight mb-4">
              City Sentinel
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-8">
              Умная система мониторинга городской инфраструктуры Казахстана. Отслеживайте трафик, инциденты и состояние дорог в реальном времени.
            </p>

            {/* Stats mini-cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "20", label: "Городов" },
                { value: "24/7", label: "Мониторинг" },
                { value: "AI", label: "Аналитика" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 p-3 text-center"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-xl font-bold font-display">{stat.value}</p>
                  <p className="text-[11px] text-white/70 mt-0.5">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Right auth form panel ─── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background relative">
        {/* Subtle gradient blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-sky-400/8 to-transparent rounded-full blur-[60px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-emerald-400/8 to-transparent rounded-full blur-[60px]" />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-gradient-to-r from-amber-400/6 to-transparent rounded-full blur-[50px]" />

        {/* Back to landing */}
        <motion.button
          type="button"
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
          whileHover={{ x: -3 }}
        >
          <ArrowLeft className="w-4 h-4" />
          На главную
        </motion.button>

        {/* Mobile-only branding */}
        <div className="lg:hidden mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg gradient-sun-sky">
              <Sun className="w-4.5 h-4.5 text-white" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">City Sentinel</h2>
          </div>
          <p className="text-sm text-muted-foreground">Мониторинг городов Казахстана</p>
        </div>

        <div className="w-full max-w-[400px] relative z-10">
          {/* Header */}
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-8"
          >
            <h2 className="font-display text-2xl font-bold text-foreground">
              {mode === "login" ? "Вход в систему" : "Создать аккаунт"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              {mode === "login"
                ? "Введите данные для доступа к дашборду"
                : "Заполните данные для регистрации"}
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <label className="block text-xs font-medium text-foreground mb-1.5">Имя</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ваше имя"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full h-11 pl-10 pr-11 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/30" />
                  <span className="text-xs text-muted-foreground">Запомнить меня</span>
                </label>
                <button type="button" className="text-xs text-primary hover:text-primary/80 font-medium transition">
                  Забыли пароль?
                </button>
              </div>
            )}

            {/* Submit button with gradient */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="relative w-full h-11 rounded-xl font-medium text-sm text-white overflow-hidden transition disabled:opacity-70 disabled:cursor-not-allowed group"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 transition-opacity group-hover:opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-sky-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <>
                    {mode === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    {mode === "login" ? "Войти" : "Зарегистрироваться"}
                  </>
                )}
              </span>
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground">или</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social login placeholder */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              type="button"
              className="flex items-center justify-center gap-2 h-10 rounded-xl border border-border bg-card text-sm text-foreground hover:bg-secondary/50 transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </motion.button>
            <motion.button
              type="button"
              className="flex items-center justify-center gap-2 h-10 rounded-xl border border-border bg-card text-sm text-foreground hover:bg-secondary/50 transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </motion.button>
          </div>

          {/* Demo account */}
          <motion.button
            type="button"
            onClick={fillDemo}
            className="mt-4 w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed border-amber-400/50 bg-amber-50/50 text-sm font-medium text-amber-700 hover:bg-amber-100/60 hover:border-amber-400 transition"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Sun className="w-4 h-4" />
            Демо-аккаунт
          </motion.button>

          {/* Switch mode */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="font-semibold text-primary hover:text-primary/80 transition"
            >
              {mode === "login" ? "Зарегистрироваться" : "Войти"}
            </button>
          </p>
        </div>

        {/* Bottom nature palette preview */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {[
            "bg-amber-400", "bg-amber-500", "bg-orange-500",
            "bg-sky-400", "bg-cyan-500", "bg-blue-600",
            "bg-emerald-500", "bg-green-600", "bg-teal-600",
          ].map((c, i) => (
            <motion.div
              key={c}
              className={`w-2.5 h-2.5 rounded-full ${c}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.05 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Auth;
