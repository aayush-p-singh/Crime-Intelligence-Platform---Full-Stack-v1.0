import * as React from "react";
import { useRef, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import type { ExecutiveBriefing } from "../lib/api";
import { extractKeywords, buildBriefingGraph } from "../lib/executiveBriefingAnalysis";

// Animated number counter
function AnimatedNumber({ value, duration = 600 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!Number.isFinite(value)) return;
    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return <>{display.toLocaleString()}</>;
}

function ViewportBar({ score }: { score: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const barColor = score >= 70 ? "bg-[#7F1D1D]" : score >= 40 ? "bg-[#555555]" : "bg-[#111111]";

  return (
    <div ref={ref} className="mt-2 h-1 overflow-hidden rounded-full bg-[#E8E8E8]">
      <div
        className={`h-full rounded-full transition-[width] duration-500 ease-out ${barColor}`}
        style={{ width: visible ? `${score}%` : "0%" }}
      />
    </div>
  );
}

// Lazy-loaded force graph
const ClientSideForceGraph = React.lazy(() =>
  import("react-force-graph-2d").then((mod) => ({ default: mod.default })),
);

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export function ExecutiveIntelligenceCenter({ briefing }: { briefing: ExecutiveBriefing }) {
  const graphData = useMemo(() => buildBriefingGraph(briefing), [briefing]);
  const keywords = useMemo(() => extractKeywords(briefing.executiveSummary), [briefing]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 pt-2">
      {/* Top Stats Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="premium-card rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#888] mb-1">
            Threat Status
          </p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-white/80 backdrop-blur-md border border-[#E8E8E8] text-[#111]">
            {briefing.riskLevel}
          </span>
        </div>
        <div className="premium-card rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#888] mb-1">
            Confidence
          </p>
          <p className="text-xl font-semibold text-[#111] font-display">{briefing.confidence}</p>
        </div>
        <div className="premium-card rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#888] mb-1">
            Sources Audited
          </p>
          <p className="text-xl font-semibold text-[#111] font-display">
            <AnimatedNumber value={briefing.sources?.length ?? 0} />
          </p>
        </div>
        <div className="premium-card rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#888] mb-1">
            Last Synchronized
          </p>
          <p className="text-xs font-medium text-[#111] pt-1">
            {new Date(briefing.retrievalTimestamp).toLocaleTimeString()}
          </p>
        </div>
      </motion.div>

      {/* Severity Matrix */}
      {briefing.severityMatrix && briefing.severityMatrix.length > 0 && (
        <motion.div variants={fadeUp} className="premium-card rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111] mb-4">
            Severity Breakdown
          </h3>
          <div className="space-y-4">
            {briefing.severityMatrix.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[#666]">{item.category}</span>
                  <span className="text-xs font-mono text-[#111]">{item.score}/100</span>
                </div>
                <ViewportBar score={item.score} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Intelligence Graph: Monochrome network */}
      {graphData.nodes.length > 0 && (
        <motion.div variants={fadeUp} className="premium-card rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111]">
              Entity Relationship Network
            </h3>
            <span className="text-[10px] font-mono text-[#888]">MONOCHROME TOPOLOGY</span>
          </div>
          <div className="h-[280px] rounded-2xl overflow-hidden bg-white/80 backdrop-blur-md border border-[#E8E8E8]">
            <React.Suspense
              fallback={
                <div className="h-full flex items-center justify-center text-xs text-[#888]">
                  Rendering topology...
                </div>
              }
            >
              <ClientSideForceGraph
                graphData={graphData}
                width={600}
                height={280}
                backgroundColor="#FAFAFA"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                nodeColor={(node: any) => {
                  switch (node.group) {
                    case "Threat":
                      return "#7F1D1D";
                    case "Technology":
                      return "#111111";
                    case "Organization":
                      return "#444444";
                    default:
                      return "#777777";
                  }
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                nodeLabel={(node: any) => node.name || node.id || ""}
                linkColor={() => "#E8E8E8"}
                linkWidth={1}
                nodeRelSize={4}
              />
            </React.Suspense>
          </div>
        </motion.div>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <motion.div variants={fadeUp} className="premium-card rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111] mb-3">
            Audited Focus Terms
          </h3>
          <div className="flex flex-wrap gap-2">
            {keywords.slice(0, 16).map((kw) => (
              <span
                key={kw}
                className="px-2.5 py-1 rounded-2xl bg-white/80 backdrop-blur-md border border-[#E8E8E8] text-xs font-medium text-[#111]"
              >
                {kw}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
