import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Map as MapIcon,
  ShieldAlert,
  Users,
  Activity,
  Crosshair,
  Loader2,
  AlertCircle,
  TrendingUp,
  Search,
  RefreshCw,
  ExternalLink,
  Clock,
} from "lucide-react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { AppShell } from "../components/AppShell";
import { api, StateData, ThreatFilter, ThreatStateAssessment } from "../lib/api";

// --- Types & Theming ---

type ColorMode = "risk" | "crimeRate";

const RISK_COLORS: Record<string, string> = {
  Critical: "#dc2626",
  High: "#a83b43",
  Elevated: "#f59e0b",
  Guarded: "#7e8795",
  Medium: "#7e8795",
  Low: "#2fbf71",
  Unknown: "#345e8c",
};

const THREAT_FILTERS: Array<{ value: ThreatFilter; label: string }> = [
  { value: "overallThreat", label: "Overall Threat" },
  { value: "cybercrime", label: "Cybercrime" },
  { value: "womenSafety", label: "Women Safety" },
  { value: "financialFraud", label: "Financial Fraud" },
  { value: "organizedCrime", label: "Organized Crime" },
  { value: "propertyCrime", label: "Property Crime" },
  { value: "violentCrime", label: "Violent Crime" },
  { value: "emergingCrimes", label: "Emerging Crimes" },
];

// Reliable public CDN for India TopoJSON
// 2024 Updated India TopoJSON (Includes Ladakh & Accurate NE Borders)
const INDIA_TOPO_JSON =
  "https://raw.githubusercontent.com/udit-001/india-maps-data/main/topojson/india.json";

function getCrimeRateColor(rate: number, maxRate: number): string {
  const intensity = Math.min(Math.max(rate / (maxRate || 1), 0.1), 1);
  return `rgba(52, 94, 140, ${intensity})`;
}

// Helper to match map TopoJSON names with DB names
const normalizeName = (name: string) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/nct of delhi/g, "delhi")
    .replace(/ state/g, "")
    .trim();
};

function isHighRisk(riskLevel?: string): boolean {
  return riskLevel === "Critical" || riskLevel === "High";
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2 || values.every((value) => value === 0))
    return <span className="text-xs text-[#888]">Unavailable</span>;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const points = values
    .map(
      (value, index) =>
        `${(index / (values.length - 1)) * 100},${28 - ((value - min) / range) * 24}`,
    )
    .join(" ");
  return (
    <svg viewBox="0 0 100 32" className="h-8 w-24" role="img" aria-label="Historical crime trend">
      <polyline
        points={points}
        fill="none"
        stroke="#8daed1"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

// --- Reusable Components ---

function MetricRow({
  icon: Icon,
  label,
  value,
  colorClass = "text-[#111]",
}: {
  icon: any;
  label: string;
  value: string | number;
  colorClass?: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-black/[0.02] rounded-lg border border-black/[0.04]">
      <div className="flex items-center space-x-3">
        <Icon className="h-4 w-4 text-[#666]" />
        <span className="text-sm font-medium text-[#444]">{label}</span>
      </div>
      <span className={`text-sm font-bold ${colorClass}`}>{value}</span>
    </div>
  );
}

// --- Main Route Component ---

function IndiaMapComponent() {
  const [colorMode, setColorMode] = useState<ColorMode>("risk");
  const [threatFilter, setThreatFilter] = useState<ThreatFilter>("overallThreat");
  const [search, setSearch] = useState("");
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);
  const [selectedStateName, setSelectedStateName] = useState<string | null>(null);

  const {
    data: mapData,
    isLoading: isMapLoading,
    error: mapError,
  } = useQuery({
    queryKey: ["map-data"],
    queryFn: api.getMapData,
  });

  const {
    data: threatData,
    isLoading: isThreatLoading,
    refetch: refetchThreats,
  } = useQuery({
    queryKey: ["threat-intelligence"],
    queryFn: api.getThreatIntelligence,
    staleTime: 5 * 60 * 1000,
  });

  const { data: selectedStateDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["state-details", selectedStateName],
    queryFn: () => api.getStateDetails(selectedStateName!),
    enabled: !!selectedStateName,
  });

  const { data: selectedThreat, isLoading: isThreatDetailsLoading } = useQuery({
    queryKey: ["state-threat-intelligence", selectedStateName],
    queryFn: () => api.getStateThreatIntelligence(selectedStateName!),
    enabled: !!selectedStateName,
  });

  const maxCrimeRate = mapData ? Math.max(...mapData.map((d) => d.crimeRate || 0)) : 1000;

  const normalizedSearch = search.trim().toLowerCase();
  const findThreat = (stateName: string) =>
    threatData?.find((item) => normalizeName(item.name) === normalizeName(stateName));
  const isSearchMatch = (stateName: string) =>
    !normalizedSearch || stateName.toLowerCase().includes(normalizedSearch);

  // FIXED: Strict matching logic that ignores empty strings
  const findMatchingState = (geoName: string) => {
    if (!mapData || !geoName) return null;

    const normGeo = normalizeName(geoName);
    if (!normGeo) return null;

    return (
      mapData.find((d) => {
        const normDb = normalizeName(d.name);
        if (!normDb) return false;

        // Require exact match or a substantial substring match (stops empty string bugs)
        return (
          normDb === normGeo ||
          (normGeo.length > 3 && (normDb.includes(normGeo) || normGeo.includes(normDb)))
        );
      }) || null
    );
  };

  const getStateColor = (state: StateData | null) => {
    if (!state) return "#1e293b";
    if (colorMode === "risk") {
      const threat = findThreat(state.name);
      return RISK_COLORS[threat?.riskLevel || state.risk || "Unknown"] || RISK_COLORS["Unknown"];
    } else {
      return getCrimeRateColor(state.crimeRate, maxCrimeRate);
    }
  };

  const getThreatOpacity = (state: StateData | null) => {
    const threat = state ? findThreat(state.name) : undefined;
    if (!threat || !isSearchMatch(state?.name || "")) return 0.25;
    return colorMode === "risk"
      ? 1
      : Math.max(0.35, (threat.categoryScores[threatFilter] || 0) / 100);
  };

  return (
    <AppShell title="Geospatial Map" subtitle="Interactive risk and crime distribution analysis.">
      <div className="min-w-0 p-4 md:p-8 space-y-4 md:space-y-6 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col">
        {/* Controls Header */}
        <div className="flex flex-wrap items-center justify-between bg-white/80 backdrop-blur-sm border border-black/[0.06] rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-2">
            <MapIcon className="h-5 w-5 text-[#0891b2]" />
            <div>
              <h2 className="text-lg font-semibold text-[#111]">National Threat Intelligence Map</h2>
              <p className="text-xs text-[#888]">
                NCRB history, prediction, retrieval, and AI reasoning
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <label className="flex min-w-0 items-center gap-2 rounded-lg border border-black/[0.06] bg-black/20 px-3 py-2">
              <Search className="h-4 w-4 text-[#888]" />
              <input
                aria-label="Search Indian state"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search state"
                className="w-24 bg-transparent text-xs text-[#111] outline-none placeholder:text-[#888] md:w-28"
              />
            </label>
            <select
              value={threatFilter}
              onChange={(event) => setThreatFilter(event.target.value as ThreatFilter)}
              className="rounded-lg border border-black/[0.06] bg-slate-950 px-3 py-2 text-xs text-[#444] outline-none"
            >
              {THREAT_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => void refetchThreats()}
              title="Refresh threat intelligence"
              aria-label="Refresh threat intelligence"
              className="rounded-lg border border-black/[0.06] p-2 text-[#666] transition-all hover:-translate-y-0.5 hover:bg-black/5 hover:text-[#111] active:translate-y-0"
            >
              <RefreshCw className={`h-4 w-4 ${isThreatLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="flex items-center bg-black/20 rounded-lg p-1 border border-black/[0.04]">
            <button
              onClick={() => setColorMode("risk")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${colorMode === "risk" ? "bg-blue-600 text-[#111] shadow" : "text-[#666] hover:text-[#111] hover:bg-black/5"}`}
            >
              Risk Level
            </button>
            <button
              onClick={() => setColorMode("crimeRate")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${colorMode === "crimeRate" ? "bg-purple-600 text-[#111] shadow" : "text-[#666] hover:text-[#111] hover:bg-black/5"}`}
            >
              Crime Rate
            </button>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {/* MAP AREA */}
          <div className="lg:col-span-2 relative bg-white/80 backdrop-blur-sm border border-black/[0.06] rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
            {isMapLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                <p className="text-[#444]">Loading Geospatial Data...</p>
              </div>
            )}

            {mapError && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur text-red-600">
                <AlertCircle className="h-10 w-10 mb-4" />
                <p>Failed to load map data.</p>
              </div>
            )}

            <div className="w-full h-full relative p-4 group">
              {/* True Geographic Map Visualization */}
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 1000,
                  center: [80, 22], // Center coordinates for India
                }}
                className="w-full h-full outline-none"
              >
                <Geographies geography={INDIA_TOPO_JSON}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      // Extract name safely from nested TopoJSON structure
                      const geoName =
                        geo.properties?.st_nm ||
                        geo.properties?.NAME_1 ||
                        geo.properties?.name ||
                        geo.id ||
                        "";
                      const matchedState = findMatchingState(geoName);
                      const isSelected =
                        selectedStateName && matchedState?.name === selectedStateName;
                      const matchedThreat = matchedState
                        ? findThreat(matchedState.name)
                        : undefined;

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={getStateColor(matchedState)}
                          fillOpacity={getThreatOpacity(matchedState)}
                          className={
                            matchedThreat
                              ? `map-heat-region${isHighRisk(matchedThreat.riskLevel) ? " map-risk-pulse" : ""}`
                              : undefined
                          }
                          stroke={isSelected ? "#ffffff" : "#334155"}
                          strokeWidth={isSelected ? 1.5 : 0.5}
                          onClick={() => matchedState && setSelectedStateName(matchedState.name)}
                          onMouseEnter={() => matchedState && setHoveredState(matchedState)}
                          onMouseLeave={() => setHoveredState(null)}
                          style={{
                            default: { outline: "none", transition: "all 0.3s" },
                            hover: {
                              fill: matchedState ? "#60a5fa" : "#1e293b",
                              outline: "none",
                              cursor: matchedState ? "pointer" : "default",
                              transition: "all 0.2s",
                            },
                            pressed: { outline: "none" },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>

              {/* Hover Tooltip */}
              {hoveredState && (
                <div className="absolute bottom-6 left-6 bg-[#f5f5f5]/90 backdrop-blur-xl border border-black/[0.08] p-4 rounded-xl shadow-2xl z-20 pointer-events-none transform transition-all duration-200">
                  <h4 className="text-[#111] font-bold text-lg mb-2">{hoveredState.name}</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-[#444] flex justify-between gap-4">
                      <span>Risk Level:</span>
                      <span
                        className="font-bold"
                        style={{
                          color:
                            RISK_COLORS[
                              findThreat(hoveredState.name)?.riskLevel ||
                                hoveredState.risk ||
                                "Unknown"
                            ],
                        }}
                      >
                        {findThreat(hoveredState.name)?.riskLevel || hoveredState.risk || "Unknown"}
                      </span>
                    </p>
                    <p className="text-sm text-[#444] flex justify-between gap-4">
                      <span>Threat Score:</span>
                      <span className="font-bold text-[#111]">
                        {findThreat(hoveredState.name)?.threatScore ?? "—"}
                      </span>
                    </p>
                    <p className="text-sm text-[#444] flex justify-between gap-4">
                      <span>Confidence:</span>
                      <span className="font-bold text-[#111]">
                        {findThreat(hoveredState.name)?.confidence ?? "—"}
                      </span>
                    </p>
                    <p className="text-sm text-[#444] flex justify-between gap-4">
                      <span>Updated:</span>
                      <span className="font-bold text-[#111]">
                        {findThreat(hoveredState.name)?.lastUpdated
                          ? new Date(
                              findThreat(hoveredState.name)!.lastUpdated,
                            ).toLocaleDateString()
                          : "—"}
                      </span>
                    </p>
                    <p className="text-sm text-[#444] flex justify-between gap-4">
                      <span>Crime Rate:</span>
                      <span className="font-bold text-[#111]">{hoveredState.crimeRate}</span>
                    </p>
                    <p className="mt-2 max-w-xs text-xs leading-relaxed text-[#666]">
                      {findThreat(hoveredState.name)?.recentIntelligence ||
                        "Latest intelligence summary unavailable."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur border border-black/[0.06] p-3 rounded-lg flex flex-col gap-2 z-10 pointer-events-none">
              <span className="text-xs text-[#666] font-semibold uppercase tracking-wider mb-1">
                {colorMode === "risk" ? "Risk Legend" : "Intensity Legend"}
              </span>
              {colorMode === "risk" ? (
                Object.entries(RISK_COLORS).map(
                  ([label, color]) =>
                    label !== "Unknown" && (
                      <div key={label} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-xs text-[#444]">{label}</span>
                      </div>
                    ),
                )
              ) : (
                <div className="w-32 h-3 bg-gradient-to-r from-[rgba(139,92,246,0.1)] to-[rgba(139,92,246,1)] rounded-full"></div>
              )}
              <span className="mt-1 border-t border-black/[0.06] pt-2 text-[10px] text-[#888]">
                Filter: {THREAT_FILTERS.find((filter) => filter.value === threatFilter)?.label}
              </span>
            </div>
          </div>

          {/* SIDEBAR AREA */}
          <div className="bg-white/80 backdrop-blur-sm border border-black/[0.06] rounded-xl p-6 shadow-lg flex flex-col overflow-y-auto custom-scrollbar">
            {!selectedStateName ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <Crosshair className="h-16 w-16 text-[#666] mb-4" />
                <h3 className="text-xl font-bold text-[#111] mb-2">Target Required</h3>
                <p className="text-sm text-[#666] max-w-[200px]">
                  Select a state on the geographic map to view detailed intelligence and
                  predictions.
                </p>
              </div>
            ) : isDetailsLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                <p className="text-[#444]">Decrypting state records...</p>
              </div>
            ) : selectedStateDetails ? (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                {isThreatDetailsLoading ? (
                  <div className="rounded-lg border border-black/[0.06] p-3 text-xs text-[#666]">
                    Compiling live threat assessment...
                  </div>
                ) : (
                  selectedThreat && (
                    <div className="space-y-4 rounded-xl border border-cyan-200 bg-cyan-950/10 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0891b2]">
                            National Intelligence Layer
                          </span>
                          <h3 className="mt-1 text-lg font-bold text-[#111]">
                            {selectedThreat.riskLevel} Posture
                          </h3>
                        </div>
                        <span
                          className="rounded-full border px-2 py-1 text-xs font-bold"
                          style={{
                            color: RISK_COLORS[selectedThreat.riskLevel],
                            borderColor: RISK_COLORS[selectedThreat.riskLevel],
                          }}
                        >
                          Score {selectedThreat.threatScore}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#444]">
                        {selectedThreat.executiveSummary}
                      </p>
                      <div className="rounded-lg border border-black/[0.06] bg-[#f8f8f8] p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                            Crime Trend
                          </h4>
                          <span className="text-xs font-semibold text-[#0891b2]">
                            {String(selectedThreat.prediction.trend || "Unavailable")}
                          </span>
                        </div>
                        <Sparkline
                          values={[
                            selectedThreat.historicalStatistics.crime2020 || 0,
                            selectedThreat.historicalStatistics.crime2021 || 0,
                            selectedThreat.historicalStatistics.crime2022 || 0,
                          ]}
                        />
                      </div>
                      <p className="text-xs leading-relaxed text-[#666]">
                        {selectedThreat.threatAssessment}
                      </p>
                      <MetricRow
                        icon={ShieldAlert}
                        label="Confidence"
                        value={selectedThreat.confidence}
                        colorClass="text-[#0891b2]"
                      />
                      <MetricRow
                        icon={Clock}
                        label="Last updated"
                        value={new Date(selectedThreat.lastUpdated).toLocaleString()}
                      />
                      <MetricRow
                        icon={TrendingUp}
                        label="Predicted trend"
                        value={String(selectedThreat.prediction.trend || "Unavailable")}
                        colorClass="text-orange-300"
                      />
                      <div>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#888]">
                          Live Intelligence
                        </h4>
                        <p className="text-xs leading-relaxed text-[#666]">
                          {selectedThreat.recentIntelligence}
                        </p>
                      </div>
                      <div>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#888]">
                          Latest Briefing Summary
                        </h4>
                        <p className="text-xs leading-relaxed text-[#666]">
                          {selectedThreat.recentIntelligence || selectedThreat.executiveSummary}
                        </p>
                      </div>
                      <div>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#888]">
                          Cyber Threat Status
                        </h4>
                        <p className="text-xs leading-relaxed text-[#666]">
                          {selectedThreat.cyberActivity}
                        </p>
                      </div>
                      <div>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#888]">
                          Financial Fraud Status
                        </h4>
                        <p className="text-xs leading-relaxed text-[#666]">
                          {selectedThreat.financialFraudActivity}
                        </p>
                      </div>
                      <div>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#888]">
                          Emerging Crime Categories
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedThreat.emergingThreats.map((item) => (
                            <span
                              key={item}
                              className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-[11px] text-orange-200"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#888]">
                          Police Recommendations
                        </h4>
                        <ul className="list-disc space-y-1 pl-4 text-xs text-[#666]">
                          {selectedThreat.policeRecommendations.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#888]">
                          Citizen Recommendations
                        </h4>
                        <ul className="list-disc space-y-1 pl-4 text-xs text-[#666]">
                          {selectedThreat.citizenRecommendations.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#888]">
                          Recent Headlines
                        </h4>
                        {selectedThreat.recentHeadlines.length ? (
                          selectedThreat.recentHeadlines.map((headline) => (
                            <a
                              key={headline.url}
                              href={headline.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-start gap-2 py-1 text-xs text-[#444] hover:text-[#111]"
                            >
                              <ExternalLink className="mt-0.5 h-3 w-3 flex-shrink-0" />
                              {headline.title}
                            </a>
                          ))
                        ) : (
                          <p className="text-xs text-[#888]">No current headlines verified.</p>
                        )}
                      </div>
                      <div>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#888]">
                          Supporting Sources
                        </h4>
                        {selectedThreat.supportingSources.length ? (
                          selectedThreat.supportingSources.map((source) => (
                            <a
                              key={`${source.url}-${source.title}`}
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-start gap-2 py-1 text-xs text-[#444] hover:text-[#111]"
                            >
                              <ExternalLink className="mt-0.5 h-3 w-3 flex-shrink-0" />
                              <span>
                                {source.title}
                                <span className="ml-2 text-[#888]">
                                  {source.publicationDate
                                    ? new Date(source.publicationDate).toLocaleDateString()
                                    : "Date unavailable"}
                                </span>
                              </span>
                            </a>
                          ))
                        ) : (
                          <p className="text-xs text-[#888]">No supporting sources verified.</p>
                        )}
                      </div>
                      <p className="flex items-center gap-2 text-[11px] text-[#888]">
                        <Clock className="h-3 w-3" /> Retrieval timestamp:{" "}
                        {new Date(selectedThreat.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                  )
                )}

                {/* Header */}
                <div className="border-b border-black/[0.06] pb-4">
                  <div className="inline-block px-3 py-1 bg-[#0891b2]/10 text-[#0891b2] border border-blue-500/20 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
                    State Profile
                  </div>
                  <h2 className="text-2xl font-bold text-[#111] mb-1">
                    {selectedStateDetails.name}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-[#666]">Current AI Threat Assessment:</span>
                    <span
                      className="text-sm font-bold px-2 py-0.5 rounded border"
                      style={{
                        color: RISK_COLORS[selectedStateDetails.risk || "Unknown"],
                        borderColor: RISK_COLORS[selectedStateDetails.risk || "Unknown"],
                        backgroundColor: `${RISK_COLORS[selectedStateDetails.risk || "Unknown"]}20`,
                      }}
                    >
                      {selectedStateDetails.risk || "Pending"}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-[#666] uppercase tracking-wider mb-2">
                    Core Metrics
                  </h3>
                  <MetricRow
                    icon={TrendingUp}
                    label="Crime Rate (per lakh)"
                    value={selectedStateDetails.crimeRate}
                  />
                  <MetricRow
                    icon={Users}
                    label="Crimes Against Women"
                    value={selectedStateDetails.womenCrime}
                  />
                  <MetricRow
                    icon={Activity}
                    label="Chargesheet Rate"
                    value={`${selectedStateDetails.chargesheetRate}%`}
                    colorClass="text-[#0891b2]"
                  />
                  <MetricRow
                    icon={ShieldAlert}
                    label="Total Incidents"
                    value={selectedStateDetails.totalCrime.toLocaleString()}
                  />
                </div>

                <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ShieldAlert className="h-4 w-4 text-[#0891b2]" />
                    <h4 className="text-sm font-bold text-[#0891b2]">Tactical Directive</h4>
                  </div>
                  <p className="text-xs text-[#444] leading-relaxed">
                    Intelligence suggests focusing resources on regions with compounding{" "}
                    <span className="text-[#111] font-medium">Crime Rate</span> and declining{" "}
                    <span className="text-[#111] font-medium">Chargesheet Rates</span>. Monitor{" "}
                    {selectedStateDetails.name} closely for anomalies.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-red-600">
                <AlertCircle className="h-6 w-6 mr-2" /> Failed to load state data.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute("/india-map")({
  component: IndiaMapComponent,
});
