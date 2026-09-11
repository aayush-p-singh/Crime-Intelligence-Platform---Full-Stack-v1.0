import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, animate } from "framer-motion";
import {
  ArrowRight,
  Map,
  BarChart2,
  Network,
  MessageSquare,
  LayoutDashboard,
  Activity,
  Globe,
  Database,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { ArchitecturalBackground } from "../components/ArchitecturalBackground";
import { api } from "../lib/api";

// --- Animated Counter ---
function AnimatedCounter({ from, to, duration = 2, suffix = "" }: { from: number; to: number; duration?: number; suffix?: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const count = useMotionValue(from);

  useEffect(() => {
    const controls = animate(count, to, {
      duration,
      ease: "easeOut",
      onUpdate(value) {
        if (nodeRef.current) {
          nodeRef.current.textContent = Math.floor(value).toLocaleString() + suffix;
        }
      },
    });
    return controls.stop;
  }, [count, to, duration, suffix]);

  return <span ref={nodeRef}>{from.toLocaleString()}{suffix}</span>;
}

// --- Premium System Status ---
function SystemStatus({ label, isOnline, delay = 0 }: { label: string; isOnline: boolean; delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="flex items-center gap-3 px-4 py-2.5 bg-white/60 backdrop-blur-md border border-black/[0.04] rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
    >
      <div className="relative flex items-center justify-center w-3 h-3">
        {isOnline && (
          <>
            <motion.span 
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
              className="absolute w-full h-full rounded-full bg-[#138808]" 
            />
            <motion.span 
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2, delay: 1, ease: "easeOut" }}
              className="absolute w-full h-full rounded-full bg-[#138808]" 
            />
          </>
        )}
        <span
          className={`relative z-10 rounded-full h-2 w-2 shadow-[0_0_8px_rgba(19,136,8,0.5)] ${isOnline ? "bg-[#138808]" : "bg-[#7F1D1D]"}`}
        />
      </div>
      <span className="text-[11px] font-bold text-[#333] tracking-wider uppercase font-mono">{label}</span>
    </motion.div>
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
        timeoutId = setTimeout(step, Math.random() * 20 + 15); // slightly faster
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
        <span className="inline-block w-2 md:w-3 h-8 md:h-14 bg-[#FF9933] ml-2 align-middle cursor-blink shadow-[0_0_15px_rgba(255,153,51,0.6)]" />
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: 0.1 * index, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Link
        to={to}
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="intel-card group block p-6 md:p-8 cursor-pointer h-full"
      >
        <div className="card-spotlight" />
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[#0891b2] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-12">
            <div className="p-3 bg-black/[0.03] rounded-xl border border-black/[0.05] group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-black/[0.05] transition-all duration-300 shadow-sm">
              <Icon className="h-6 w-6 text-[#111] group-hover:text-[#0891b2] transition-colors duration-300 group-hover:rotate-[6deg]" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#888] group-hover:text-[#111] transition-colors bg-white/50 px-2 py-1 rounded border border-black/[0.04]">
              {code}
            </span>
          </div>
          
          <div className="mt-auto">
            <h3 className="text-xl font-bold text-[#111] mb-3 group-hover:translate-x-1 transition-transform duration-300">
              {title}
            </h3>
            <p className="text-sm text-[#555] leading-relaxed max-w-[90%]">
              {description}
            </p>
          </div>
          
          <div className="mt-8 flex items-center text-[11px] font-bold tracking-widest uppercase text-[#0891b2] opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0">
            Initialize Module <ArrowRight className="h-3 w-3 ml-2" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// --- Live Metric Box ---
function MetricBox({ title, value, suffix, icon: Icon, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="p-5 bg-white border border-black/[0.06] rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 opacity-5 text-black">
        <Icon className="w-24 h-24" />
      </div>
      <div className="flex items-center gap-2 text-[#666] mb-4 relative z-10">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
      </div>
      <div className="text-3xl font-bold text-[#111] font-mono relative z-10">
        <AnimatedCounter from={0} to={value} duration={2.5} suffix={suffix} />
      </div>
    </motion.div>
  );
}


function HomeComponent() {
  const [headlineDone, setHeadlineDone] = useState(false);
  const { scrollY } = useScroll();
  
  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const bgY = useTransform(scrollY, [0, 1000], [0, 300]);

  // Ping backend to check status
  const { data: pingData } = useQuery({
    queryKey: ["backend-ping"],
    queryFn: async () => {
      try {
        const res = await api.getStates();
        return Array.isArray(res);
      } catch (e) {
        return false;
      }
    },
    refetchInterval: 30000,
  });

  const isOnline = pingData === true;

  const capabilities = [
    {
      title: "Command Center",
      description: "Executive briefing interface with AI threat forecasting and unified metric synthesis.",
      icon: LayoutDashboard,
      to: "/dashboard",
      code: "SYS-01",
    },
    {
      title: "Geospatial Intelligence",
      description: "Interactive territorial threat mapping with real-time risk distribution across jurisdictions.",
      icon: Map,
      to: "/india-map",
      code: "GEO-02",
    },
    {
      title: "Comparative Matrix",
      description: "Cross-jurisdictional correlation engine for multi-vector threat comparison.",
      icon: BarChart2,
      to: "/state-comparison",
      code: "ANL-03",
    },
    {
      title: "Entity Network",
      description: "Knowledge graph visualization of interconnected threat actors and incidents.",
      icon: Network,
      to: "/knowledge-graph",
      code: "NET-04",
    },
    {
      title: "Intelligence Officer",
      description: "Conversational AI assistant powered by Sarvam for rapid data retrieval and analysis.",
      icon: MessageSquare,
      to: "/cio",
      code: "AI-05",
    },
  ];

  return (
    <AppShell title="System Overview" subtitle="CrimeIntel Central Neural Network">
      <div className="relative min-h-screen">
        
        {/* Cinematic Background Layer */}
        <motion.div style={{ y: bgY }} className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <ArchitecturalBackground />
          <div className="absolute inset-0 blueprint-grid-premium opacity-50" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16 pb-32">
          
          {/* Hero Section */}
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="min-h-[60vh] flex flex-col justify-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/[0.04] border border-black/[0.06] text-[10px] font-mono font-bold tracking-[0.2em] text-[#555] uppercase shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-[#138808]" />
                Secure Connection Established
              </span>
            </motion.div>

            <TypewriterHeadline 
              text="Operational clarity before the incident unfolds." 
              onComplete={() => setHeadlineDone(true)} 
            />

            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mt-12">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={headlineDone ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <SystemStatus label="Core Engine" isOnline={isOnline} delay={0.1} />
                <SystemStatus label="Sarvam AI" isOnline={isOnline} delay={0.2} />
                <SystemStatus label="Neural Link" isOnline={isOnline} delay={0.3} />
                <SystemStatus label="Data Sync" isOnline={isOnline} delay={0.4} />
              </motion.div>
            </div>
            
            <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={headlineDone ? { opacity: 1, y: 0 } : {}}
               transition={{ duration: 0.8, delay: 0.4 }}
               className="mt-16 flex gap-4"
            >
               <Link to="/dashboard" className="btn-premium-primary inline-flex items-center group shadow-lg">
                 Initialize Console
                 <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
               </Link>
               <Link to="/india-map" className="btn-premium-glass inline-flex items-center shadow-sm">
                 View Territorial Map
               </Link>
            </motion.div>
          </motion.div>

          {/* Live Intelligence Metrics */}
          <div className="mt-12 mb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricBox title="Records Analysed" value={2458932} icon={Database} delay={0.1} />
              <MetricBox title="Jurisdictions" value={36} icon={Globe} delay={0.2} />
              <MetricBox title="AI Predictions" value={12450} suffix="+" icon={Cpu} delay={0.3} />
              <MetricBox title="Avg Response" value={142} suffix="ms" icon={Activity} delay={0.4} />
            </div>
          </div>

          {/* Capability Grid */}
          <div className="mb-12">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-8"
            >
              <h2 className="text-sm font-mono font-bold tracking-[0.2em] text-[#888] uppercase">
                Active Modules
              </h2>
              <div className="flex-1 h-px bg-black/[0.06]" />
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capabilities.map((cap, i) => (
                <div key={cap.to} className={i === 0 ? "md:col-span-2 lg:col-span-2" : ""}>
                  <ModuleCard {...cap} index={i} />
                </div>
              ))}
            </div>
          </div>

          {/* Operational Readiness Footer */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 p-6 rounded-2xl border border-black/[0.06] bg-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-black/[0.03] flex items-center justify-center border border-black/[0.05]">
                 <ShieldCheck className="w-6 h-6 text-[#138808]" />
               </div>
               <div>
                 <h4 className="text-[14px] font-bold text-[#111]">System Operational Readiness</h4>
                 <p className="text-[12px] font-mono text-[#666] mt-1">ALL PROTOCOLS ACTIVE</p>
               </div>
            </div>
            <div className="w-full md:w-64">
               <div className="flex justify-between text-[10px] font-bold font-mono text-[#888] mb-2">
                 <span>INTEGRITY</span>
                 <span className="text-[#138808]">100%</span>
               </div>
               <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   whileInView={{ width: "100%" }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className="h-full bg-gradient-to-r from-[#138808] to-[#16a34a] rounded-full relative"
                 >
                   <div className="absolute inset-0 bg-white/20 animate-pulse" />
                 </motion.div>
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute("/home")({
  component: HomeComponent,
});
