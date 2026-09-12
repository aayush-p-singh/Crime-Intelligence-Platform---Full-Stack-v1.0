import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Map,
  BarChart2,
  Network,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AppShell } from "../components/AppShell";

const capabilities = [
  {
    code: "01",
    title: "COMMAND CENTER",
    description:
      "Monitor the broader national threat picture and surface important intelligence signals.",
    icon: LayoutDashboard,
    to: "/dashboard",
  },
  {
    code: "02",
    title: "GEOSPATIAL INTELLIGENCE",
    description:
      "Explore crime patterns and risk indicators geographically across India.",
    icon: Map,
    to: "/india-map",
  },
  {
    code: "03",
    title: "COMPARATIVE MATRIX",
    description:
      "Compare jurisdictions using key crime and intelligence indicators.",
    icon: BarChart2,
    to: "/state-comparison",
  },
  {
    code: "04",
    title: "ENTITY NETWORK",
    description:
      "Explore relationships between jurisdictions, indicators, and connected intelligence entities.",
    icon: Network,
    to: "/knowledge-graph",
  },
  {
    code: "05",
    title: "INTELLIGENCE OFFICER",
    description:
      "Query the intelligence layer using natural language and receive evidence-backed assessments.",
    icon: MessageSquare,
    to: "/cio",
  },
];

const flowSteps = [
  { label: "DATA", sub: "Structured crime records from multiple jurisdictions" },
  { label: "ANALYSIS", sub: "AI-powered pattern recognition and correlation" },
  { label: "INTELLIGENCE", sub: "Contextual insights and entity relationships" },
  { label: "DECISION", sub: "Actionable assessments for decision-makers" },
];

function AboutComponent() {
  return (
    <AppShell title="About" subtitle="Platform Intelligence Brief">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-32 relative z-10">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/[0.04] border border-black/[0.06] text-[10px] font-mono font-bold tracking-[0.2em] text-[#555] uppercase shadow-sm mb-8">
            <ShieldCheck className="w-3.5 h-3.5 text-[#138808]" />
            Platform Brief
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#111] tracking-tighter leading-[1.05] mt-6 mb-4 text-balance">
            About CrimeIntel
          </h1>
          <p className="text-lg md:text-xl text-[#555] font-medium leading-relaxed max-w-2xl">
            Turning crime data into decision-ready intelligence.
          </p>
        </motion.div>

        {/* Divider */}
        <div className="my-16 h-px bg-black/[0.06]" />

        {/* What is CrimeIntel */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[10px] font-mono font-semibold text-[#888] tracking-[0.2em] uppercase mb-6">
            WHAT IS CRIMEINTEL
          </p>
          <div className="space-y-5">
            <p className="text-[15px] text-[#333] leading-relaxed">
              CrimeIntel is a crime intelligence platform built to help law
              enforcement and policymakers understand crime patterns across India
              with greater clarity.
            </p>
            <p className="text-[15px] text-[#333] leading-relaxed">
              The platform brings together crime data from multiple jurisdictions
              and combines AI-powered analysis, interactive geospatial
              intelligence, state-wise comparisons, and connected-entity views to
              turn raw data into actionable insights.
            </p>
            <p className="text-[15px] text-[#333] leading-relaxed">
              Our goal is to make crime data more useful, not simply more
              available.
            </p>
            <p className="text-[15px] text-[#333] leading-relaxed">
              CrimeIntel is designed to help police departments, district
              administrations, state home ministries, and policy teams analyze
              information quickly and make informed decisions.
            </p>
          </div>
        </motion.section>

        {/* Divider */}
        <div className="my-16 h-px bg-black/[0.06]" />

        {/* Intelligence Officer */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[10px] font-mono font-semibold text-[#888] tracking-[0.2em] uppercase mb-2">
            INTELLIGENCE OFFICER
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#111] tracking-tight mb-6">
            Ask the intelligence layer.
          </h2>

          <div className="p-6 md:p-8 rounded-2xl border border-black/[0.06] bg-white shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-black/[0.03] rounded-xl border border-black/[0.05] shrink-0">
                <Sparkles className="h-5 w-5 text-[#7c3aed]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[15px] text-[#333] leading-relaxed">
                  CrimeIntel's Intelligence Officer allows users to ask questions
                  in natural language and receive concise, evidence-backed
                  assessments based on available intelligence.
                </p>
                <p className="text-[15px] text-[#333] leading-relaxed mt-4">
                  Instead of manually searching through fragmented information,
                  analysts can ask questions, retrieve relevant evidence, and
                  receive a structured assessment with supporting sources.
                </p>
              </div>
            </div>

            <Link
              to="/cio"
              className="inline-flex items-center gap-2 text-[12px] font-bold tracking-wider uppercase text-[#7c3aed] hover:text-[#6d28d9] transition-colors group"
            >
              Open Intelligence Officer
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.section>

        {/* Divider */}
        <div className="my-16 h-px bg-black/[0.06]" />

        {/* Core Capabilities */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[10px] font-mono font-semibold text-[#888] tracking-[0.2em] uppercase mb-8">
            CORE CAPABILITIES
          </p>

          <div className="space-y-0">
            {capabilities.map((cap, i) => (
              <Link
                key={cap.code}
                to={cap.to}
                className="group flex items-start gap-5 py-5 border-b border-black/[0.06] first:border-t no-underline transition-colors hover:bg-black/[0.01] -mx-4 px-4 rounded-lg"
              >
                <div className="flex items-center gap-3 shrink-0 pt-0.5">
                  <span className="text-[11px] font-mono font-bold text-[#ccc] tracking-wider w-5">
                    {cap.code}
                  </span>
                  <div className="p-2 bg-black/[0.03] rounded-lg border border-black/[0.05] group-hover:bg-black/[0.05] transition-colors">
                    <cap.icon className="h-4 w-4 text-[#666] group-hover:text-[#111] transition-colors" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[13px] font-bold text-[#111] tracking-wide uppercase mb-1 group-hover:translate-x-0.5 transition-transform">
                    {cap.title}
                  </h3>
                  <p className="text-[13px] text-[#666] leading-relaxed">
                    {cap.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-[#ccc] group-hover:text-[#888] shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Divider */}
        <div className="my-16 h-px bg-black/[0.06]" />

        {/* How CrimeIntel Works */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[10px] font-mono font-semibold text-[#888] tracking-[0.2em] uppercase mb-8">
            HOW CRIMEINTEL WORKS
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {flowSteps.map((step, i) => (
              <div key={step.label} className="relative">
                <div className="p-5 rounded-xl border border-black/[0.06] bg-white shadow-sm h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-mono font-bold text-[#ccc] tracking-wider">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-[13px] font-bold text-[#111] tracking-wider uppercase">
                      {step.label}
                    </h3>
                  </div>
                  <p className="text-[12px] text-[#666] leading-relaxed">
                    {step.sub}
                  </p>
                </div>
                {/* Connector arrow (hidden on last item and on mobile single-col) */}
                {i < flowSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="h-3.5 w-3.5 text-[#ccc]" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-[14px] text-[#555] leading-relaxed mt-8 max-w-3xl">
            CrimeIntel combines structured crime data, analytical models,
            geospatial intelligence, entity relationships, and AI-assisted
            retrieval to transform fragmented information into decision-ready
            intelligence.
          </p>
        </motion.section>

        {/* Divider */}
        <div className="my-16 h-px bg-black/[0.06]" />

        {/* Intelligence with Context */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[10px] font-mono font-semibold text-[#888] tracking-[0.2em] uppercase mb-6">
            INTELLIGENCE WITH CONTEXT
          </p>

          <div className="p-6 md:p-8 rounded-2xl border border-black/[0.06] bg-white shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-black/[0.03] rounded-xl border border-black/[0.05] shrink-0">
                <ShieldCheck className="h-5 w-5 text-[#138808]" strokeWidth={1.5} />
              </div>
              <div className="space-y-4">
                <p className="text-[15px] text-[#333] leading-relaxed">
                  CrimeIntel is designed as a decision-support platform. Its
                  assessments are based on available evidence and should be
                  interpreted alongside human expertise, official records, and
                  operational context.
                </p>
                <p className="text-[15px] text-[#333] leading-relaxed">
                  When available evidence is insufficient, the platform should
                  surface the intelligence gap rather than present unsupported
                  conclusions.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Divider */}
        <div className="my-16 h-px bg-black/[0.06]" />

        {/* Closing Purpose */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="pb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#111] tracking-tighter leading-[1.1] mb-8 text-balance">
            Make crime data more useful.
          </h2>
          <div className="space-y-4 max-w-2xl">
            <p className="text-[16px] text-[#444] leading-relaxed">
              Crime data tells us what happened.
            </p>
            <p className="text-[16px] text-[#444] leading-relaxed">
              CrimeIntel helps decision-makers understand what it means, where
              attention may be needed, and what questions to investigate next.
            </p>
          </div>
        </motion.section>

      </div>
    </AppShell>
  );
}

export const Route = createFileRoute("/about")({
  component: AboutComponent,
});
