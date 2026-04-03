import { useEffect, useRef, useState } from "react";

const metrics = [
  { value: "12.4M", label: "Citizens Connected", unit: "" },
  { value: "99.7", label: "System Uptime", unit: "%" },
  { value: "340K", label: "IoT Sensors Online", unit: "+" },
  { value: "2.4", label: "Gigawatts Managed", unit: "GW" },
];

const features = [
  {
    id: "01",
    title: "Real-Time Traffic Intelligence",
    description: "Adaptive signal networks process 87K+ vehicle data points per second, reducing urban congestion by up to 34% through predictive rerouting algorithms.",
    tag: "Traffic",
    color: "#3d9da8",
  },
  {
    id: "02",
    title: "Environmental Sentinel Array",
    description: "Distributed atmospheric sensors monitor air quality, noise pollution, and microclimate shifts across 24 city districts, triggering automated responses.",
    tag: "Environment",
    color: "#3a8c5a",
  },
  {
    id: "03",
    title: "Smart Grid Orchestration",
    description: "AI-driven energy load balancing across the municipal power grid, with predictive demand forecasting reducing waste by 18% monthly.",
    tag: "Energy",
    color: "#4a7da8",
  },
  {
    id: "04",
    title: "Unified AI Command Center",
    description: "GPT-class inference engine correlates cross-domain anomalies, surfaces critical insights, and drafts actionable city management recommendations.",
    tag: "AI Core",
    color: "#3d9da8",
  },
];

const timeline = [
  { year: "2021", event: "Initial IoT mesh deployment across District Alpha" },
  { year: "2022", event: "AI inference engine integrated; 140K sensors active" },
  { year: "2023", event: "Citywide rollout across all 24 districts completed" },
  { year: "2024", event: "Real-time ML anomaly detection hits sub-200ms latency" },
  { year: "2025", event: "NexaCity OS v3.2 — fully unified urban intelligence" },
];

export default function Landing() {
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((p) => (p + 1) % features.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-root">
      {/* NAV */}
      <nav className="land-nav">
        <div className="land-nav-logo">
          <span className="land-logo-mark">⬡</span>
          <span>NexaCity</span>
          <span className="land-logo-tag">OS v3.2</span>
        </div>
        <div className="land-nav-links">
          <a href="#features">Capabilities</a>
          <a href="#metrics">Metrics</a>
          <a href="#timeline">Story</a>
        </div>
        <a href="/dashboard" className="land-cta-sm">Open Dashboard →</a>
      </nav>

      {/* HERO */}
      <section className="land-hero" ref={heroRef}>
        <div
          className="land-hero-grid"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }}
        />
        <div className="land-orb land-orb-1" style={{ transform: `translateY(${scrollY * 0.15}px)` }} />
        <div className="land-orb land-orb-2" style={{ transform: `translateY(${scrollY * 0.08}px)` }} />

        <div className="land-hero-content">
          <div className="land-pill">
            <span className="land-pill-dot" />
            System Online · District Alpha · Live
          </div>

          <h1 className="land-hero-h1">
            The city<br />
            <em>thinks.</em>
          </h1>

          <p className="land-hero-sub">
            NexaCity OS monitors, interprets, and adapts to every pulse of your urban infrastructure — in real time, at scale, with AI at its core.
          </p>

          <div className="land-hero-actions">
            <a href="/dashboard" className="land-btn-primary">
              Enter Dashboard
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <button className="land-btn-ghost">Watch Overview</button>
          </div>
        </div>

        {/* Floating status cards */}
        <div className="land-hero-cards">
          <div className="land-float-card" style={{ animationDelay: "0s" }}>
            <div className="land-float-card-dot green" />
            <div>
              <div className="land-float-card-val">142 AQI</div>
              <div className="land-float-card-lbl">Air Quality</div>
            </div>
          </div>
          <div className="land-float-card" style={{ animationDelay: "1.2s" }}>
            <div className="land-float-card-dot cyan" />
            <div>
              <div className="land-float-card-val">87.3K/h</div>
              <div className="land-float-card-lbl">Traffic Flow</div>
            </div>
          </div>
          <div className="land-float-card" style={{ animationDelay: "2.4s" }}>
            <div className="land-float-card-dot blue" />
            <div>
              <div className="land-float-card-val">2.4 GW</div>
              <div className="land-float-card-lbl">Grid Load</div>
            </div>
          </div>
        </div>

        <div className="land-scroll-hint">
          <span>Scroll</span>
          <div className="land-scroll-line" />
        </div>
      </section>

      {/* METRICS BAND */}
      <section className="land-metrics" id="metrics">
        <div className="land-metrics-inner">
          {metrics.map((m) => (
            <div key={m.label} className="land-metric-item">
              <div className="land-metric-val">
                {m.value}<span className="land-metric-unit">{m.unit}</span>
              </div>
              <div className="land-metric-lbl">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="land-features" id="features">
        <div className="land-section-header">
          <span className="land-section-tag">CAPABILITIES</span>
          <h2 className="land-section-h2">Intelligence<br />at every layer</h2>
        </div>

        <div className="land-features-grid">
          {features.map((f, i) => (
            <div
              key={f.id}
              className={`land-feature-card ${activeFeature === i ? "active" : ""}`}
              onMouseEnter={() => setActiveFeature(i)}
              style={{ "--accent": f.color } as React.CSSProperties}
            >
              <div className="land-feat-num">{f.id}</div>
              <div className="land-feat-tag">{f.tag}</div>
              <h3 className="land-feat-title">{f.title}</h3>
              <p className="land-feat-desc">{f.description}</p>
              <div className="land-feat-line" />
            </div>
          ))}
        </div>
      </section>

      {/* DIAGONAL CALLOUT */}
      <section className="land-callout">
        <div className="land-callout-bg" />
        <div className="land-callout-inner">
          <h2 className="land-callout-h2">
            Not a dashboard.<br />
            <span>A nervous system.</span>
          </h2>
          <p className="land-callout-p">
            City Sentinel doesn't just display data — it correlates signals across traffic, atmosphere, energy, and population density to surface insights before problems emerge.
          </p>
          <a href="/dashboard" className="land-btn-primary light">Open Live View →</a>
        </div>
        <div className="land-callout-diagram">
          <div className="land-diagram-ring r1" />
          <div className="land-diagram-ring r2" />
          <div className="land-diagram-ring r3" />
          <div className="land-diagram-core">
            <span>AI</span>
          </div>
          {["Traffic", "Air", "Energy", "People"].map((lbl, i) => (
            <div
              key={lbl}
              className="land-diagram-node"
              style={{ "--angle": `${i * 90}deg` } as React.CSSProperties}
            >
              {lbl}
            </div>
          ))}
        </div>
      </section>

      {/* TIMELINE */}
      <section className="land-timeline" id="timeline">
        <div className="land-section-header">
          <span className="land-section-tag">HISTORY</span>
          <h2 className="land-section-h2">How we got here</h2>
        </div>

        <div className="land-timeline-track">
          <div className="land-timeline-line" />
          {timeline.map((t, i) => (
            <div key={t.year} className={`land-tl-item ${i % 2 === 0 ? "left" : "right"}`}>
              <div className="land-tl-year">{t.year}</div>
              <div className="land-tl-dot" />
              <div className="land-tl-text">{t.event}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="land-footer-cta">
        <h2 className="land-fcta-h2">Your city.<br />Fully visible.</h2>
        <a href="/dashboard" className="land-btn-primary xl">Launch City Sentinel</a>
        <p className="land-fcta-sub">No setup required · Live data · Free access</p>
      </section>

      {/* FOOTER */}
      <footer className="land-footer">
        <div className="land-footer-brand">
          <span className="land-logo-mark">⬡</span> NexaCity OS v3.2
        </div>
        <div className="land-footer-links">
          <a href="/dashboard">Dashboard</a>
          <a href="#features">Capabilities</a>
          <a href="#metrics">Metrics</a>
        </div>
        <div className="land-footer-copy">© 2025 City Sentinel · Smart City OS</div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        .landing-root {
          --c-bg: hsl(160, 18%, 95%);
          --c-fg: hsl(190, 30%, 14%);
          --c-muted: hsl(180, 10%, 48%);
          --c-cyan: hsl(188, 50%, 40%);
          --c-green: hsl(152, 40%, 40%);
          --c-blue: hsl(205, 45%, 48%);
          --c-border: hsl(165, 14%, 84%);
          --c-glass: hsla(160, 16%, 97%, 0.72);
          --c-surface: hsl(160, 14%, 94%);
          --font-display: 'Syne', sans-serif;
          --font-body: 'DM Sans', sans-serif;
          background: var(--c-bg);
          color: var(--c-fg);
          font-family: var(--font-body);
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* NAV */
        .land-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 48px;
          background: var(--c-glass);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid var(--c-border);
        }
        .land-nav-logo {
          display: flex; align-items: center; gap: 8px;
          font-family: var(--font-display); font-weight: 700; font-size: 15px;
          color: var(--c-fg);
        }
        .land-logo-mark { color: var(--c-cyan); font-size: 18px; }
        .land-logo-tag {
          font-size: 10px; font-weight: 400; color: var(--c-muted);
          background: var(--c-surface); padding: 2px 6px; border-radius: 4px;
          border: 1px solid var(--c-border);
        }
        .land-nav-links { display: flex; gap: 32px; }
        .land-nav-links a {
          font-size: 13px; color: var(--c-muted); text-decoration: none;
          transition: color 0.2s;
        }
        .land-nav-links a:hover { color: var(--c-fg); }
        .land-cta-sm {
          font-family: var(--font-display); font-size: 13px; font-weight: 600;
          color: var(--c-cyan); text-decoration: none;
          border: 1px solid hsla(188, 50%, 40%, 0.3);
          padding: 7px 16px; border-radius: 8px;
          transition: all 0.2s; background: hsla(188, 50%, 40%, 0.06);
        }
        .land-cta-sm:hover { background: hsla(188, 50%, 40%, 0.12); }

        /* HERO */
        .land-hero {
          min-height: 100vh;
          display: flex; align-items: center;
          position: relative; overflow: hidden;
          padding: 120px 48px 80px;
        }
        .land-hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(hsla(188,50%,40%,0.06) 1px, transparent 1px),
            linear-gradient(90deg, hsla(188,50%,40%,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%);
        }
        .land-orb {
          position: absolute; border-radius: 50%;
          filter: blur(80px); pointer-events: none;
        }
        .land-orb-1 {
          width: 520px; height: 520px;
          background: radial-gradient(circle, hsla(188,55%,42%,0.18) 0%, transparent 70%);
          top: -80px; right: 80px;
        }
        .land-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, hsla(152,45%,42%,0.14) 0%, transparent 70%);
          bottom: 40px; left: -60px;
        }
        .land-hero-content {
          position: relative; z-index: 2;
          max-width: 620px;
        }
        .land-pill {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; color: var(--c-cyan); font-weight: 500; letter-spacing: 0.04em;
          border: 1px solid hsla(188,50%,40%,0.25);
          background: hsla(188,50%,40%,0.07);
          padding: 5px 12px; border-radius: 999px;
          margin-bottom: 32px;
        }
        .land-pill-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--c-cyan);
          box-shadow: 0 0 8px var(--c-cyan);
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

        .land-hero-h1 {
          font-family: var(--font-display);
          font-size: clamp(64px, 9vw, 110px);
          font-weight: 800;
          line-height: 0.92;
          letter-spacing: -0.03em;
          color: var(--c-fg);
          margin: 0 0 28px;
        }
        .land-hero-h1 em {
          font-style: italic; font-weight: 700;
          color: var(--c-cyan);
        }
        .land-hero-sub {
          font-size: 16px; line-height: 1.65;
          color: var(--c-muted); max-width: 440px;
          margin: 0 0 40px; font-weight: 300;
        }
        .land-hero-actions { display: flex; gap: 16px; align-items: center; }
        .land-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: var(--font-display); font-weight: 600; font-size: 14px;
          color: white; background: var(--c-cyan);
          padding: 13px 24px; border-radius: 10px;
          text-decoration: none; border: none; cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 4px 20px hsla(188,50%,40%,0.35);
        }
        .land-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px hsla(188,50%,40%,0.45);
        }
        .land-btn-primary.light { background: white; color: var(--c-fg); }
        .land-btn-primary.xl { font-size: 17px; padding: 17px 36px; }
        .land-btn-ghost {
          font-family: var(--font-display); font-size: 14px; font-weight: 600;
          color: var(--c-muted); background: none; border: none; cursor: pointer;
          transition: color 0.2s;
        }
        .land-btn-ghost:hover { color: var(--c-fg); }

        /* floating cards */
        .land-hero-cards {
          position: absolute; right: 80px; top: 50%;
          transform: translateY(-50%);
          display: flex; flex-direction: column; gap: 16px;
          z-index: 2;
        }
        .land-float-card {
          display: flex; align-items: center; gap: 12px;
          background: var(--c-glass); backdrop-filter: blur(20px);
          border: 1px solid var(--c-border);
          border-radius: 12px; padding: 14px 18px;
          box-shadow: 0 4px 24px hsla(190,30%,14%,0.06);
          animation: floatCard 4s ease-in-out infinite;
        }
        @keyframes floatCard {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .land-float-card-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
        }
        .land-float-card-dot.cyan { background: var(--c-cyan); box-shadow: 0 0 8px var(--c-cyan); }
        .land-float-card-dot.green { background: var(--c-green); box-shadow: 0 0 8px var(--c-green); }
        .land-float-card-dot.blue { background: var(--c-blue); box-shadow: 0 0 8px var(--c-blue); }
        .land-float-card-val { font-family: var(--font-display); font-size: 16px; font-weight: 700; line-height: 1.1; }
        .land-float-card-lbl { font-size: 10px; color: var(--c-muted); margin-top: 2px; }

        .land-scroll-hint {
          position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--c-muted); z-index: 2;
        }
        .land-scroll-line {
          width: 1px; height: 40px;
          background: linear-gradient(to bottom, var(--c-muted), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }

        /* METRICS */
        .land-metrics {
          background: var(--c-fg);
          padding: 64px 48px;
        }
        .land-metrics-inner {
          display: grid; grid-template-columns: repeat(4, 1fr);
          max-width: 1100px; margin: 0 auto;
          gap: 0;
        }
        .land-metric-item {
          padding: 0 40px;
          border-right: 1px solid hsla(160,14%,94%,0.1);
          text-align: center;
        }
        .land-metric-item:last-child { border-right: none; }
        .land-metric-val {
          font-family: var(--font-display);
          font-size: 52px; font-weight: 800;
          color: white; line-height: 1;
          letter-spacing: -0.02em;
        }
        .land-metric-unit {
          font-size: 24px; font-weight: 600; color: var(--c-cyan);
        }
        .land-metric-lbl {
          font-size: 12px; color: hsla(160,14%,94%,0.5);
          margin-top: 8px; letter-spacing: 0.04em; text-transform: uppercase;
        }

        /* SECTION HEADERS */
        .land-section-header { text-align: center; margin-bottom: 72px; }
        .land-section-tag {
          font-size: 10px; font-weight: 600; letter-spacing: 0.14em;
          color: var(--c-cyan); text-transform: uppercase;
          border: 1px solid hsla(188,50%,40%,0.2);
          padding: 4px 10px; border-radius: 4px;
          background: hsla(188,50%,40%,0.06);
        }
        .land-section-h2 {
          font-family: var(--font-display);
          font-size: clamp(36px, 5vw, 58px);
          font-weight: 800; line-height: 1.05;
          letter-spacing: -0.02em;
          color: var(--c-fg); margin-top: 16px;
        }

        /* FEATURES */
        .land-features {
          padding: 120px 48px;
          max-width: 1200px; margin: 0 auto;
        }
        .land-features-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;
        }
        .land-feature-card {
          background: var(--c-glass); backdrop-filter: blur(20px);
          border: 1px solid var(--c-border);
          border-radius: 16px; padding: 36px;
          position: relative; overflow: hidden;
          transition: all 0.35s ease;
          cursor: default;
        }
        .land-feature-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: var(--accent, var(--c-cyan));
          opacity: 0; transition: opacity 0.35s;
        }
        .land-feature-card.active, .land-feature-card:hover {
          border-color: var(--accent, var(--c-cyan));
          box-shadow: 0 8px 40px hsla(188,50%,40%,0.1);
          transform: translateY(-2px);
        }
        .land-feature-card.active::before, .land-feature-card:hover::before { opacity: 1; }
        .land-feat-num {
          font-family: var(--font-display); font-size: 11px; font-weight: 700;
          color: hsla(190,30%,14%,0.18); margin-bottom: 12px; letter-spacing: 0.06em;
        }
        .land-feat-tag {
          display: inline-block; font-size: 10px; font-weight: 600;
          color: var(--accent, var(--c-cyan)); letter-spacing: 0.08em; text-transform: uppercase;
          border: 1px solid color-mix(in srgb, var(--accent, var(--c-cyan)) 30%, transparent);
          background: color-mix(in srgb, var(--accent, var(--c-cyan)) 8%, transparent);
          padding: 3px 8px; border-radius: 4px; margin-bottom: 16px;
        }
        .land-feat-title {
          font-family: var(--font-display); font-size: 20px; font-weight: 700;
          line-height: 1.2; margin: 0 0 14px; color: var(--c-fg);
        }
        .land-feat-desc {
          font-size: 14px; line-height: 1.7; color: var(--c-muted);
          font-weight: 300; margin: 0;
        }
        .land-feat-line {
          position: absolute; bottom: 0; left: 0;
          height: 1px;
          background: linear-gradient(to right, var(--accent, var(--c-cyan)), transparent);
          width: 0%; transition: width 0.5s ease;
          opacity: 0.4;
        }
        .land-feature-card.active .land-feat-line,
        .land-feature-card:hover .land-feat-line { width: 60%; }

        /* CALLOUT */
        .land-callout {
          margin: 0 48px 80px;
          border-radius: 24px;
          background: var(--c-fg);
          overflow: hidden; position: relative;
          min-height: 420px;
          display: flex; align-items: center;
        }
        .land-callout-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 80% at 30% 50%, hsla(188,55%,42%,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 80% 30%, hsla(152,45%,42%,0.10) 0%, transparent 70%);
        }
        .land-callout-inner {
          position: relative; z-index: 2;
          padding: 64px 80px; max-width: 540px;
        }
        .land-callout-h2 {
          font-family: var(--font-display);
          font-size: clamp(34px, 4vw, 52px); font-weight: 800;
          line-height: 1.05; color: white; margin: 0 0 20px;
          letter-spacing: -0.025em;
        }
        .land-callout-h2 span { color: var(--c-cyan); }
        .land-callout-p {
          font-size: 15px; line-height: 1.7; color: hsla(160,14%,94%,0.6);
          font-weight: 300; margin: 0 0 36px;
        }

        /* diagram */
        .land-callout-diagram {
          position: absolute; right: 80px; top: 50%; transform: translateY(-50%);
          width: 280px; height: 280px;
        }
        .land-diagram-ring {
          position: absolute; border-radius: 50%;
          border: 1px solid hsla(188,50%,40%,0.2);
          top: 50%; left: 50%; transform: translate(-50%, -50%);
        }
        .r1 { width: 80px; height: 80px; animation: spin 20s linear infinite; }
        .r2 { width: 160px; height: 160px; animation: spin 30s linear infinite reverse; border-style: dashed; }
        .r3 { width: 240px; height: 240px; animation: spin 40s linear infinite; }
        @keyframes spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
        .land-diagram-core {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 56px; height: 56px; border-radius: 50%;
          background: var(--c-cyan);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 13px; font-weight: 700;
          color: white;
          box-shadow: 0 0 30px hsla(188,50%,40%,0.5);
        }
        .land-diagram-node {
          position: absolute; top: 50%; left: 50%;
          transform:
            translate(-50%, -50%)
            rotate(var(--angle))
            translateX(108px)
            rotate(calc(-1 * var(--angle)));
          font-size: 10px; font-weight: 600; color: hsla(160,14%,94%,0.7);
          letter-spacing: 0.06em; text-transform: uppercase;
          white-space: nowrap;
        }

        /* TIMELINE */
        .land-timeline {
          padding: 120px 48px;
          max-width: 900px; margin: 0 auto;
        }
        .land-timeline-track {
          position: relative; padding: 40px 0;
        }
        .land-timeline-line {
          position: absolute; left: 50%; top: 0; bottom: 0; width: 1px;
          background: linear-gradient(to bottom, transparent, var(--c-cyan), transparent);
          transform: translateX(-50%);
        }
        .land-tl-item {
          display: grid; grid-template-columns: 1fr 40px 1fr;
          align-items: center; gap: 0; margin-bottom: 48px;
        }
        .land-tl-item.left .land-tl-year { text-align: right; order: 1; }
        .land-tl-item.left .land-tl-dot { order: 2; }
        .land-tl-item.left .land-tl-text { order: 3; padding-left: 32px; }
        .land-tl-item.right .land-tl-year { order: 3; text-align: left; padding-left: 32px; }
        .land-tl-item.right .land-tl-dot { order: 2; }
        .land-tl-item.right .land-tl-text { order: 1; text-align: right; padding-right: 32px; }
        .land-tl-year {
          font-family: var(--font-display); font-size: 22px; font-weight: 800;
          color: var(--c-cyan); letter-spacing: -0.02em;
          padding-right: 32px;
        }
        .land-tl-dot {
          width: 12px; height: 12px; border-radius: 50%;
          background: var(--c-cyan); border: 3px solid var(--c-bg);
          box-shadow: 0 0 12px var(--c-cyan);
          justify-self: center;
        }
        .land-tl-text {
          font-size: 14px; line-height: 1.6; color: var(--c-muted); font-weight: 300;
        }

        /* FOOTER CTA */
        .land-footer-cta {
          text-align: center;
          padding: 100px 48px;
          background: linear-gradient(to bottom, var(--c-bg), var(--c-surface));
        }
        .land-fcta-h2 {
          font-family: var(--font-display);
          font-size: clamp(48px, 7vw, 88px); font-weight: 800;
          letter-spacing: -0.03em; line-height: 0.95;
          color: var(--c-fg); margin: 0 0 44px;
        }
        .land-fcta-sub {
          font-size: 13px; color: var(--c-muted); margin-top: 20px; font-weight: 300;
        }

        /* FOOTER */
        .land-footer {
          border-top: 1px solid var(--c-border);
          padding: 32px 48px;
          display: flex; align-items: center; justify-content: space-between;
          background: var(--c-bg);
        }
        .land-footer-brand {
          display: flex; align-items: center; gap: 8px;
          font-family: var(--font-display); font-size: 14px; font-weight: 700;
          color: var(--c-fg);
        }
        .land-footer-links { display: flex; gap: 28px; }
        .land-footer-links a {
          font-size: 13px; color: var(--c-muted); text-decoration: none;
          transition: color 0.2s;
        }
        .land-footer-links a:hover { color: var(--c-fg); }
        .land-footer-copy { font-size: 12px; color: var(--c-muted); }

        @media (max-width: 900px) {
          .land-nav { padding: 16px 24px; }
          .land-nav-links { display: none; }
          .land-hero { padding: 100px 24px 80px; }
          .land-hero-cards { display: none; }
          .land-metrics-inner { grid-template-columns: repeat(2, 1fr); gap: 32px 0; }
          .land-metric-item { border-right: none; border-bottom: 1px solid hsla(160,14%,94%,0.08); padding: 20px; }
          .land-features { padding: 80px 24px; }
          .land-features-grid { grid-template-columns: 1fr; }
          .land-callout { margin: 0 24px 60px; flex-direction: column; min-height: auto; }
          .land-callout-inner { padding: 48px 32px; }
          .land-callout-diagram { position: relative; right: auto; transform: none; margin: 0 auto 32px; }
          .land-timeline { padding: 80px 24px; }
          .land-footer { flex-direction: column; gap: 20px; text-align: center; padding: 32px 24px; }
        }
      `}</style>
    </div>
  );
}
