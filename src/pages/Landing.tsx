import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Brain, Menu, Shield, X, Zap } from "lucide-react";

const metrics = [
  { value: "12.4M", label: "Citizens Connected" },
  { value: "99.7%", label: "System Uptime" },
  { value: "340K+", label: "IoT Sensors Online" },
  { value: "2.4 GW", label: "Grid Capacity Managed" },
];

const features = [
  {
    id: "01",
    title: "Real-Time Traffic Intelligence",
    description:
      "Adaptive signal networks process citywide flow in milliseconds and keep routes stable during peak load.",
    tag: "Traffic",
    icon: Activity,
  },
  {
    id: "02",
    title: "Environmental Sentinel Array",
    description:
      "Distributed sensors monitor air quality, noise, and microclimate trends across all districts.",
    tag: "Environment",
    icon: Shield,
  },
  {
    id: "03",
    title: "Smart Grid Orchestration",
    description:
      "AI-guided balancing coordinates demand and supply to cut waste while preserving resilience.",
    tag: "Energy",
    icon: Zap,
  },
  {
    id: "04",
    title: "Unified AI Command Center",
    description:
      "Cross-domain correlation surfaces anomalies early and recommends actions before incidents escalate.",
    tag: "AI Core",
    icon: Brain,
  },
];

const timeline = [
  { year: "2021", event: "Initial IoT mesh deployment across District Alpha" },
  { year: "2022", event: "AI inference engine integrated; 140K sensors active" },
  { year: "2023", event: "Citywide rollout across all 24 districts completed" },
  { year: "2024", event: "Real-time ML anomaly detection reached sub-200ms latency" },
  { year: "2025", event: "NexaCity OS v3.2 launched as a unified city intelligence layer" },
];

const sectionMotion = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
  viewport: { once: true, amount: 0.2 },
};

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsla(188,50%,40%,0.12),transparent_55%)]" />

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">⬡</span>
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold">NexaCity</p>
              <p className="text-[10px] text-muted-foreground">OS v3.2</p>
            </div>
          </a>

          <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Capabilities</a>
            <a href="#metrics" className="transition-colors hover:text-foreground">Metrics</a>
            <a href="#timeline" className="transition-colors hover:text-foreground">Story</a>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/auth"
              className="hidden rounded-lg border border-primary/30 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 md:inline-flex"
            >
              Войти
            </a>
            <button
              type="button"
              className="inline-flex rounded-lg border border-border p-2 md:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
        {mobileMenuOpen && (
          <div className="border-t border-border bg-background px-4 py-4 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-muted-foreground">
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Capabilities</a>
              <a href="#metrics" onClick={() => setMobileMenuOpen(false)}>Metrics</a>
              <a href="#timeline" onClick={() => setMobileMenuOpen(false)}>Story</a>
              <a href="/auth" className="pt-1 font-medium text-primary">Войти</a>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-12 sm:px-6 md:pb-20 md:pt-16 lg:grid-cols-2 lg:items-center lg:px-8">
          <motion.div {...sectionMotion} className="space-y-6">
            <span className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              System Online · District Alpha · Live
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              The city <span className="text-primary">thinks.</span>
            </h1>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              NexaCity OS monitors, interprets, and adapts to every pulse of urban infrastructure in real time.
              A clear control layer for traffic, environment, energy, and operational signals.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Открыть дашборд <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground"
              >
                Explore Capabilities
              </a>
            </div>
          </motion.div>

          <motion.div {...sectionMotion} className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { value: "142 AQI", label: "Air Quality" },
              { value: "87.3K/h", label: "Traffic Flow" },
              { value: "2.4 GW", label: "Grid Load" },
            ].map((card) => (
              <div key={card.label} className="glass rounded-xl p-4">
                <p className="font-display text-lg font-semibold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        <section id="metrics" className="bg-foreground py-10 sm:py-14">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
            {metrics.map((metric, index) => (
              <motion.div key={metric.label} {...sectionMotion} transition={{ duration: 0.4, delay: index * 0.06 }}>
                <p className="font-display text-2xl font-bold text-background sm:text-3xl">{metric.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-background/60">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <motion.div {...sectionMotion} className="mb-10 text-center md:mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Capabilities</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Intelligence at every layer</h2>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature, index) => (
              <motion.article
                key={feature.id}
                {...sectionMotion}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="glass rounded-2xl p-5 sm:p-6"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="font-display text-xs font-semibold text-primary">{feature.id}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{feature.tag}</p>
                  </div>
                  <span className="rounded-lg bg-primary/10 p-2 text-primary">
                    <feature.icon className="h-4 w-4" />
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-14 sm:px-6 md:grid-cols-2 md:items-center md:pb-20 lg:px-8">
          <motion.div {...sectionMotion} className="glass-strong rounded-2xl p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Core Narrative</p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Not a dashboard. <br />A nervous system.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              City Sentinel does not just display metrics. It correlates signals across mobility, atmosphere,
              energy, and population density to surface action before disruption appears.
            </p>
            <a
              href="/auth"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Открыть систему <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
          <motion.div {...sectionMotion} className="glass rounded-2xl p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Domains</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {["Traffic", "Air", "Energy", "People"].map((domain) => (
                <div key={domain} className="rounded-xl border border-border bg-background px-4 py-3 text-center font-medium">
                  {domain}
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section id="timeline" className="mx-auto max-w-4xl px-4 pb-14 sm:px-6 md:pb-20">
          <motion.div {...sectionMotion} className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">History</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">How we got here</h2>
          </motion.div>
          <div className="space-y-3">
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                {...sectionMotion}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="glass rounded-xl p-4 sm:flex sm:items-start sm:gap-4"
              >
                <p className="font-display text-lg font-semibold text-primary sm:min-w-20">{item.year}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground sm:mt-0">{item.event}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="border-y border-border/70 bg-card/70 py-14 text-center sm:py-20">
          <motion.div {...sectionMotion} className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Your city. Fully visible.</h2>
            <a
              href="/auth"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Запустить City Sentinel <ArrowRight className="h-4 w-4" />
            </a>
            <p className="mt-4 text-xs text-muted-foreground">No setup required · Live data · Free access</p>
          </motion.div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p className="font-display text-foreground">NexaCity OS v3.2</p>
        <div className="flex flex-wrap gap-4">
          <a href="/auth" className="hover:text-foreground">Войти</a>
          <a href="#features" className="hover:text-foreground">Capabilities</a>
          <a href="#metrics" className="hover:text-foreground">Metrics</a>
        </div>
        <p>© 2026 City Sentinel</p>
      </footer>
    </div>
  );
}
