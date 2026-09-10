import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Map,
  BarChart2,
  Network,
  MessageSquare,
  LayoutDashboard,
  Activity,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { IntelSymbol } from "../components/IntelSymbol";
import { ArchitecturalBackground } from "../components/ArchitecturalBackground";
import { api } from "../lib/api";

// --- Premium System Status ---
function SystemStatus({ label, isOnline }: { label: string; isOnline: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2 glass-panel rounded-xl shadow-sm">
      <span className="relative flex h-2 w-2">
        {isOnline && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#138808] opacity-40" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? "bg-[#138808]" : "bg-[#7F1D1D]"}`}
        />
      </span>
      <span className="text-[12px] font-semibold text-[#111] tracking-tight">{label}</span>
    </div>
  );
}

// --- Cinematic Typewriter ---
function TypewriterHeadline({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let currentLen = 0;

    const step = () => {
      currentLen++;
      setDisplayed(text.slice(0, currentLen));
      if (currentLen < text.length) {
        timeoutId = setTimeout(step, Math.random() * 30 + 20);
      } else {
        timeoutId = setTimeout(() => {
          setIsDone(true);
          onCompleteRef.current?.();
        }, 300);
      }
    };

    timeoutId = setTimeout(step, 150);
    return () => clearTimeout(timeoutId);
  }, [text]);

  return (
    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#111] tracking-tighter max-w-4xl leading-[1.05] mb-8 relative z-10 text-balance">
      {displayed}
      {!isDone && (
        <span className="inline-block w-2 md:w-3 h-8 md:h-14 bg-[#FF9933] ml-2 align-middle cursor-blink shadow-[0_0_12px_rgba(255,153,51,0.5)]" />
      )}
    </h1>
  );
}

// --- Premium Module Card ---
function ModuleCard({ title, description, icon: Icon, to, code, index }: any) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index, ease: "easeOut" }}
    >
      <Link
        to={to}
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="premium-card group block p-6 md:p-8 cursor-pointer h-full border border-black/5"
      >
        <div className="card-spotlight" />

        <div className="flex justify-between items-start mb-12 relative z-10">
          <div className="p-3 bg-black/5 rounded-2xl group-hover:bg-[#111] transition-colors duration-300 shadow-sm">
            <Icon className="h-6 w-6 stroke-[1.5] text-[#111] group-hover:text-white transition-colors duration-300" />
          </div>
          <span className="text-[10px] font-mono font-bold text-[#888] tracking-widest">
            {code}
          </span>
        </div>

        <div className="relative z-10">
          <h3 className="text-xl font-bold text-[#111] tracking-tight mb-2 group-hover:translate-x-1 transition-transform duration-300">
            {title}
          </h3>
          <p className="text-[13px] text-[#666] font-medium leading-relaxed group-hover:text-[#444] transition-colors duration-300">
            {description}
          </p>
        </div>

        {/* Animated border bottom active state */}
        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#FF9933] to-[#138808] w-0 group-hover:w-full transition-all duration-500 ease-out" />
      </Link>
    </motion.div>
  );
}

// --- Main Home View ---
function HomeComponent() {
  const [typingDone, setTypingDone] = useState(false);
  const handleComplete = useCallback(() => setTypingDone(true), []);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const { isSuccess } = useQuery({
    queryKey: ["system-ping"],
    queryFn: api.getDashboardKPIs,
    retry: 1,
    staleTime: 60000,
  });

  return (
    <AppShell title="System Overview" subtitle="National Intelligence Architecture">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        {/* Cinematic Hero Section */}
        <motion.section
          style={{ y }}
          className="relative overflow-hidden rounded-[2rem] p-8 md:p-16 lg:p-24 bg-white/40 border border-white/60 shadow-glass backdrop-blur-3xl"
        >
          <ArchitecturalBackground variant="hero" />

          <div className="relative z-10 flex flex-col items-start max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 glass-panel rounded-full text-[11px] font-medium text-[#111] mb-8 shadow-sm"
            >
              <IntelSymbol size={14} strokeWidth={2} />
              <span className="tracking-[0.2em] uppercase text-[10px] font-bold text-[#111]">
                CrimeIntel Core v2.0
              </span>
            </motion.div>

            <TypewriterHeadline
              text="Operational clarity before the incident unfolds."
              onComplete={handleComplete}
            />

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: typingDone ? 1 : 0, y: typingDone ? 0 : 15 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-lg md:text-xl text-[#555] max-w-2xl leading-relaxed mb-12 font-medium"
            >
              Unified statutory crime intelligence platform synthesizing national records,
              predictive risk vectors, and relational knowledge topologies for operational
              leadership.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: typingDone ? 1 : 0, y: typingDone ? 0 : 15 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link to="/dashboard" className="btn-premium-primary group inline-flex items-center">
                <span>Launch Command Center</span>
                <ArrowRight className="ml-2.5 h-4 w-4 stroke-[2] group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
              <Link
                to="/india-map"
                className="btn-premium-glass inline-flex items-center group shadow-sm"
              >
                <span>Inspect Threat Map</span>
                <Map className="ml-2.5 h-4 w-4 stroke-[1.5] group-hover:scale-110 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Subsystem Verification Strip */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="p-6 md:p-8 rounded-[1.5rem] glass-panel flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-sm"
        >
          {/* subtle scanline */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF9933]/50 to-transparent animate-[scan_3s_ease-in-out_infinite]" />

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#111] mb-1">
              Subsystem Verification
            </h4>
            <p className="text-[11px] font-mono text-[#666]">ALL PROTOCOLS SYNCHRONIZED</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SystemStatus label="Analytical Engine" isOnline={isSuccess} />
            <SystemStatus label="Graph Topology" isOnline={isSuccess} />
            <SystemStatus label="Risk Model" isOnline={isSuccess} />
            <SystemStatus label="Intel Feed" isOnline={true} />
          </div>
        </motion.section>

        {/* Intelligence Capabilities Grid */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="pt-8 pb-12"
        >
          <div className="flex items-end justify-between mb-8 px-2">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#111] tracking-tight">
                Intelligence Capabilities
              </h2>
              <p className="text-[14px] text-[#666] mt-1.5 font-medium">
                Select an operational workstation to initiate analysis
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#FF9933] bg-[#FF9933]/10 px-3 py-1.5 rounded-lg border border-[#FF9933]/20 shadow-sm">
              5 ACTIVE DOMAINS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModuleCard
              index={0}
              to="/dashboard"
              code="SYS-01"
              title="Command Center"
              description="National statutory metrics, executive briefings, predictive risk forecasting, and investigation clearance ratios."
              icon={LayoutDashboard}
            />
            <ModuleCard
              index={1}
              to="/india-map"
              code="SYS-02"
              title="Geospatial Intelligence"
              description="High-resolution regional threat choropleth, category risk filtering, and localized crime profile inspection."
              icon={Map}
            />
            <ModuleCard
              index={2}
              to="/state-comparison"
              code="SYS-03"
              title="Comparative Matrix"
              description="Side-by-side analytical cross-referencing of jurisdiction rates, chargesheet efficiency, and normalized metrics."
              icon={BarChart2}
            />
            <ModuleCard
              index={3}
              to="/knowledge-graph"
              code="SYS-04"
              title="Entity Network"
              description="Interactive topological network revealing relational crime structures, multi-tiered connections, and threat vectors."
              icon={Network}
            />
            <ModuleCard
              index={4}
              to="/cio"
              code="SYS-05"
              title="Intelligence Officer"
              description="Executive briefing assistant delivering grounded answers with verified statutory citations and evidence quality."
              icon={MessageSquare}
            />
          </div>
        </motion.section>
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute("/home")({
  component: HomeComponent,
});
