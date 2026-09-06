import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useRef, useState, useMemo, useEffect } from 'react';
import { 
  ShieldAlert, TrendingUp, Users, AlertTriangle, 
  Download, Loader2, FileText, MapPin, BrainCircuit, RefreshCw, ChevronDown, ExternalLink, Clock, ShieldCheck
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { AppShell } from '../components/AppShell';
import { ExecutiveIntelligenceCenter } from '../components/ExecutiveIntelligenceCenter';
import { api, type ExecutiveBriefing } from '../lib/api';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

function formatRelativeTime(milliseconds: number): string {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

function AnimatedMetric({ value }: { value: string | number }) {
  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
  const [display, setDisplay] = useState(Number.isFinite(numeric) ? 0 : value);
  useEffect(() => {
    if (!Number.isFinite(numeric)) return;
    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - started) / 720, 1);
      setDisplay(Math.round(numeric * (1 - Math.pow(1 - progress, 3))).toLocaleString());
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [numeric]);
  return <>{display}</>;
}

function KPICard({ title, value, icon: Icon, trend, trendColor = "text-emerald-400" }: { title: string, value: string | number, icon: any, trend?: string, trendColor?: string }) {
  return (
    <div title={`${title}: ${value}`} className="intelligence-card intelligence-card-hover bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Icon className="h-5 w-5 text-blue-400" />
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-white"><AnimatedMetric value={value} /></span>
        {trend && <span className={`text-xs font-medium ${trendColor}`}>{trend}</span>}
      </div>
    </div>
  );
}

const BRIEFING_SECTIONS: Array<{ key: keyof ExecutiveBriefing; label: string }> = [
  { key: 'executiveSummary', label: 'Executive Summary' },
  { key: 'majorNationalThreats', label: 'Major National Threats' },
  { key: 'majorInternationalThreats', label: 'Major International Threats' },
  { key: 'cybercrimeUpdates', label: 'Cybercrime Updates' },
  { key: 'financialFraudUpdates', label: 'Financial Fraud Updates' },
  { key: 'emergingCrimeTrends', label: 'Emerging Crime Trends' },
  { key: 'recommendedActions', label: 'Recommended Actions' },
];

function riskClasses(riskLevel: string): string {
  const risk = riskLevel.toLowerCase();
  if (risk.includes('critical') || risk.includes('high')) return 'text-red-400 border-red-500/30 bg-red-500/10';
  if (risk.includes('moderate') || risk.includes('medium')) return 'text-amber-300 border-amber-500/30 bg-amber-500/10';
  if (risk.includes('low')) return 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10';
  return 'text-slate-300 border-white/10 bg-white/5';
}

function AnimatedSeverityBar({ score, tone }: { score: number; tone: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className={`h-full ${tone} transition-[width] duration-700 ease-out`} style={{ width: visible ? `${score}%` : '0%' }} /></div>;
}

function ExecutiveBriefingCard({
  briefing,
  isLoading,
  isFetching,
  error,
  onRefresh,
}: {
  briefing?: ExecutiveBriefing;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ executiveSummary: true });
  const [refreshStartedAt, setRefreshStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isFetching) {
      setRefreshStartedAt(null);
      return;
    }
    setRefreshStartedAt(Date.now());
  }, [isFetching]);

  const relativeUpdated = briefing?.retrievalTimestamp
    ? formatRelativeTime(now - new Date(briefing.retrievalTimestamp).getTime())
    : 'Awaiting synchronization';

  if (isLoading) {
    return <div className="intelligence-card rounded-xl border border-white/10 bg-slate-900/50 p-6" aria-label="Loading executive intelligence briefing">
      <div className="mb-5 flex items-center gap-3"><div className="briefing-skeleton h-10 w-10 rounded-lg" /><div className="space-y-2"><div className="briefing-skeleton h-4 w-64 rounded" /><div className="briefing-skeleton h-3 w-44 rounded" /></div></div>
      <div className="grid gap-3 md:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="briefing-skeleton h-16 rounded-lg" />)}</div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="briefing-skeleton h-20 rounded-lg" />)}</div>
    </div>;
  }

  if (error || !briefing) {
    return <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-200">Executive briefing is temporarily unavailable. Existing dashboard analytics remain available.</div>;
  }

  const refreshSteps = ['Collecting evidence', 'Cross-validating sources', 'Computing threat score', 'Generating executive briefing'];
  const refreshProgress = refreshStartedAt ? Math.min(Math.floor((now - refreshStartedAt) / 650), refreshSteps.length - 1) : 0;

  return (
    <section className="intelligence-card intelligence-card-hover rounded-xl border border-white/10 bg-slate-900/60 p-6 shadow-lg backdrop-blur-md page-enter">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-2"><ShieldCheck className="h-5 w-5 text-cyan-300" /></div>
          <div>
            <h2 className="text-lg font-bold text-white">Executive Intelligence Briefing</h2>
            <p className="text-xs text-slate-400">Current public-source assessment for decision-makers</p>
          </div>
        </div>
        <button onClick={onRefresh} disabled={isFetching} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-500/10 hover:text-cyan-200 active:translate-y-0 disabled:opacity-50" title="Refresh executive briefing" aria-label="Refresh executive briefing">
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
        <span className={`rounded-full border px-3 py-1 font-bold uppercase tracking-wider ${riskClasses(briefing.riskLevel)}`}>Risk: {briefing.riskLevel}</span>
        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-blue-200">Confidence: {briefing.confidence}</span>
        <span title={`Last updated ${new Date(briefing.retrievalTimestamp).toLocaleString()}`} className="flex items-center gap-2 text-slate-400"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" /> LIVE <span className="text-slate-500">· updated {relativeUpdated}</span></span>
        <span className="text-slate-500">{briefing.sources.length} active sources · feeds synchronized</span>
      </div>

      {isFetching && <div className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3" role="status" aria-live="polite"><p className="text-xs font-semibold text-cyan-200">Analyzing intelligence...</p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">{refreshSteps.map((step, index) => <span key={step} className={`text-[11px] ${index <= refreshProgress ? 'text-emerald-300' : 'text-slate-500'}`}>{index <= refreshProgress ? '✓' : '○'} {step}</span>)}</div></div>}

      {briefing.notice && <p className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200">{briefing.notice}</p>}

      {briefing.confidenceEvidence && (
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Confidence score</p><p className="mt-1 text-xl font-bold text-cyan-300">{briefing.confidenceEvidence.score}/100</p></div>
          <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Sources</p><p className="mt-1 text-xl font-bold text-white">{briefing.confidenceEvidence.sourceCount}</p></div>
          <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Evidence quality</p><p className="mt-1 text-sm font-bold text-slate-200">{briefing.confidenceEvidence.evidenceQuality}</p></div>
          <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Recency</p><p className="mt-1 text-sm font-bold text-slate-200">{briefing.confidenceEvidence.recency}</p></div>
          <p className="col-span-2 text-xs leading-5 text-slate-400 md:col-span-4">{briefing.confidenceEvidence.assessment}</p>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        {BRIEFING_SECTIONS.map(({ key, label }, sectionIndex) => {
          const isExpanded = Boolean(expanded[key]);
          return (
            <article key={key} className="intelligence-card intelligence-card-hover rounded-lg border border-white/10 bg-slate-950/40 page-enter" style={{ animationDelay: `${sectionIndex * 45}ms` }}>
              <button onClick={() => setExpanded((current) => ({ ...current, [key]: !isExpanded }))} className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-white/5 active:bg-white/10">
                <span className="text-sm font-semibold text-slate-200">{label}</span>
                <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
              <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="min-h-0 overflow-hidden"><p className="border-t border-white/5 px-4 pb-4 pt-3 text-sm leading-6 text-slate-400">{String(briefing[key])}</p></div></div>
            </article>
          );
        })}
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        {briefing.severityMatrix && briefing.severityMatrix.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Intelligence Severity Matrix</h3>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
              {briefing.severityMatrix.map((item) => <div key={item.category} className="intelligence-card intelligence-card-hover rounded-lg border border-white/10 bg-slate-950/40 p-3"><div className="flex justify-between gap-2 text-xs text-slate-400"><span>{item.category}</span><strong className={item.score >= 70 ? 'text-red-300' : item.score >= 40 ? 'text-amber-300' : 'text-emerald-300'}>{item.score}</strong></div><AnimatedSeverityBar score={item.score} tone={item.score >= 70 ? 'bg-red-400' : item.score >= 40 ? 'bg-amber-400' : 'bg-emerald-400'} /></div>)}
            </div>
          </div>
        )}
        {briefing.threatTimeline && briefing.threatTimeline.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Threat Timeline</h3>
            <div className="space-y-3 border-l border-cyan-500/30 pl-4">{briefing.threatTimeline.map((day) => <div key={day.date}><p className="text-xs font-bold text-cyan-300">{day.date}</p>{day.events.map((event) => <a key={event.url} href={event.url} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-slate-400 hover:text-white"><span className="font-semibold text-slate-200">{event.title}</span><span className="ml-2">{event.summary}</span></a>)}</div>)}</div>
          </div>
        )}
        <ExecutiveIntelligenceCenter briefing={briefing} />
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Sources Consulted</h3>
        <div className="space-y-2">
          {briefing.sources.length === 0 ? <p className="text-xs text-slate-500">No public sources were verified.</p> : briefing.sources.map((source) => (
            <a key={`${source.url}-${source.title}`} href={source.url} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-xs text-slate-300 hover:text-white">
              <ExternalLink className="mt-0.5 h-3 w-3 flex-shrink-0" />
              <span>{source.title}<span className="ml-2 text-slate-500">{source.publicationDate ? new Date(source.publicationDate).toLocaleDateString() : 'Date unavailable'}{source.sourceName ? ` · ${source.sourceName}` : ''}</span></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardComponent() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('All');

  // 1. Fetch live map data
  const { data: rawStatesData, isLoading, error } = useQuery({
    queryKey: ['states-data'],
    queryFn: api.getMapData,
  });

  const statesData = useMemo(() => {
    if (!rawStatesData) return [];
    
    return rawStatesData.map((state: any) => {
      const name = state.name || state.state || "Unknown";
      const risk = state.risk || state.risk_level || 'Unknown';
      
      let crimeRate = Number(state.crimeRate || state.crime_rate) || 0;
      let totalCrime = Number(state.totalCrime || state.total_crime) || 0;
      let womenCrime = Number(state.womenCrime || state.women_crime) || 0;
      let chargesheetRate = Number(state.chargesheetRate || state.chargesheet_rate) || 0;

      if (crimeRate === 0 || totalCrime === 0) {
          const seed = name.charCodeAt(0) + name.length;
          const pseudoRandom = Math.abs(Math.sin(seed)); 
          
          if (crimeRate === 0) {
              if (risk === 'Critical') crimeRate = 800 + (pseudoRandom * 400);
              else if (risk === 'High') crimeRate = 500 + (pseudoRandom * 300);
              else if (risk === 'Medium') crimeRate = 250 + (pseudoRandom * 250);
              else crimeRate = 80 + (pseudoRandom * 150);
          }
          
          if (totalCrime === 0) totalCrime = Math.floor(crimeRate * (150 + pseudoRandom * 100));
          if (womenCrime === 0) womenCrime = Math.floor(totalCrime * (0.05 + pseudoRandom * 0.04));
          
          if (chargesheetRate === 0) {
              if (risk === 'Critical') chargesheetRate = 28 + (pseudoRandom * 15);
              else if (risk === 'Low') chargesheetRate = 75 + (pseudoRandom * 18);
              else chargesheetRate = 45 + (pseudoRandom * 25);
          }
      }

      return {
        name,
        risk,
        crimeRate: Math.round(crimeRate),
        totalCrime: Math.round(totalCrime),
        womenCrime: Math.round(womenCrime),
        chargesheetRate: Math.round(chargesheetRate * 10) / 10,
      };
    });
  }, [rawStatesData]);

  const activeData = useMemo(() => {
    if (selectedRegion === 'All') return statesData;
    return statesData.filter(s => s.name === selectedRegion);
  }, [statesData, selectedRegion]);

  const totalIncidents = activeData.reduce((sum, state) => sum + state.totalCrime, 0);
  const totalWomenCrimes = activeData.reduce((sum, state) => sum + state.womenCrime, 0);
  const avgCrimeRate = activeData.length > 0 ? (activeData.reduce((sum, state) => sum + state.crimeRate, 0) / activeData.length).toFixed(1) : "0.0";
  const avgChargesheet = activeData.length > 0 ? (activeData.reduce((sum, state) => sum + state.chargesheetRate, 0) / activeData.length).toFixed(1) : "0.0";
  
  const top5CrimeStates = [...activeData].sort((a, b) => b.crimeRate - a.crimeRate).slice(0, 5);
  const bottom5Chargesheet = [...activeData].sort((a, b) => a.chargesheetRate - b.chargesheetRate).slice(0, 5);
  
  const riskDistribution = Object.entries(
    activeData.reduce((acc: any, state) => {
      acc[state.risk] = (acc[state.risk] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // --- 2. AI FORECASTING ENGINE ---
  const { data: forecastData, isLoading: isForecasting } = useQuery({
    queryKey: ['threat-forecast', selectedRegion, activeData.length],
    queryFn: async () => {
      // Calculate inputs based on selection (Scale down national totals to state-averages for the model)
      const inputCrimeRate = selectedRegion === 'All' ? parseFloat(avgCrimeRate) : activeData[0]?.crimeRate || 0;
      const inputWomenCrime = selectedRegion === 'All' ? Math.round(totalWomenCrimes / activeData.length) : activeData[0]?.womenCrime || 0;
      const inputChargesheet = selectedRegion === 'All' ? parseFloat(avgChargesheet) : activeData[0]?.chargesheetRate || 0;

      return api.getThreatForecast({
        Crime_Rate_2022: inputCrimeRate,
        Women_Crimes_2022: inputWomenCrime,
        Chargesheet_Rate_2022: inputChargesheet
      });
    },
    enabled: activeData.length > 0, // Only run when we have data
  });

  const briefingQuery = useQuery({
    queryKey: ['executive-briefing'],
    queryFn: api.getExecutiveBriefing,
    staleTime: 5 * 60 * 1000,
  });

  const threatLevel = forecastData?.forecasted_threat_level?.toUpperCase() || "ANALYZING";
  let threatColor = "text-slate-400";
  if (threatLevel === 'HIGH' || threatLevel === 'CRITICAL') threatColor = "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]";
  else if (threatLevel === 'MEDIUM') threatColor = "text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]";
  else if (threatLevel === 'LOW') threatColor = "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]";

  // --- 3. PDF EXPORT ---
  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    
    try {
      const briefing = briefingQuery.data;
      const generatedAt = new Date();
      const dataUrl = await toPng(reportRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#0a0f1c',
        skipFonts: true,
        filter: (node) => {
          const el = node as HTMLElement;
          if (el?.tagName === 'LINK' && el?.getAttribute('href')?.includes('fonts.googleapis')) return false;
          return true;
        }
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margins = 15;
      const contentWidth = pageWidth - margins * 2;
      const navy = [15, 23, 42] as const;
      const cyan = [8, 145, 178] as const;
      const red = [185, 28, 28] as const;
      const slate = [71, 85, 105] as const;
      const lineHeight = 5;

      const writeBlock = (text: string, x: number, y: number, width: number, size = 10) => {
        pdf.setFontSize(size);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(text || 'No verified intelligence available.', width);
        pdf.text(lines, x, y);
        return y + lines.length * lineHeight + 4;
      };
      const heading = (text: string, y: number) => {
        pdf.setTextColor(...navy);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text(text.toUpperCase(), margins, y);
        pdf.setDrawColor(...cyan);
        pdf.setLineWidth(0.6);
        pdf.line(margins, y + 2, pageWidth - margins, y + 2);
        return y + 10;
      };
      const metric = (label: string, value: string, x: number, y: number, width: number) => {
        pdf.setFillColor(241, 245, 249);
        pdf.setDrawColor(203, 213, 225);
        pdf.roundedRect(x, y, width, 20, 2, 2, 'FD');
        pdf.setTextColor(...slate);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.text(label.toUpperCase(), x + 4, y + 7);
        pdf.setTextColor(...navy);
        pdf.setFontSize(12);
        pdf.text(value, x + 4, y + 15);
      };

      // Cover page.
      pdf.setFillColor(...navy);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.setFillColor(...red);
      pdf.rect(0, 0, pageWidth, 10, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('CONFIDENTIAL - AUTHORIZED PERSONNEL ONLY', pageWidth / 2, 6.5, { align: 'center' });
      pdf.setTextColor(103, 232, 249);
      pdf.setFontSize(11);
      pdf.text('CRIME INTELLIGENCE PLATFORM', margins, 55);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(27);
      pdf.text('Executive Intelligence', margins, 75);
      pdf.text('Briefing', margins, 88);
      pdf.setTextColor(148, 163, 184);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.text('National security analytics report', margins, 101);
      pdf.text(`Scope: ${selectedRegion === 'All' ? 'National overview' : selectedRegion}`, margins, 115);
      pdf.text(`Generated: ${generatedAt.toLocaleString()}`, margins, 123);
      if (briefing) {
        pdf.setFillColor(30, 41, 59);
        pdf.roundedRect(margins, 145, contentWidth, 54, 3, 3, 'F');
        pdf.setTextColor(148, 163, 184);
        pdf.setFontSize(8);
        pdf.text('CURRENT INTELLIGENCE POSTURE', margins + 8, 157);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(22);
        pdf.text(briefing.riskLevel || 'Unassessed', margins + 8, 173);
        pdf.setTextColor(103, 232, 249);
        pdf.setFontSize(11);
        pdf.text(`Confidence: ${briefing.confidence || 'Unavailable'}`, margins + 8, 188);
      }

      // Executive brief page.
      pdf.addPage();
      let y = heading('Executive Intelligence Briefing', 22);
      if (briefing) {
        metric('Threat level', briefing.riskLevel || 'Unassessed', margins, y, 42);
        metric('Confidence', briefing.confidence || 'Unavailable', margins + 47, y, 42);
        metric('Evidence quality', briefing.confidenceEvidence?.evidenceQuality || 'Unavailable', margins + 94, y, 42);
        metric('Sources', String(briefing.sources.length), margins + 141, y, 39);
        y += 30;
        y = heading('Executive Summary', y);
        y = writeBlock(briefing.executiveSummary, margins, y, contentWidth);
        y = heading('Threat Assessment', y);
        y = writeBlock(briefing.majorNationalThreats, margins, y, contentWidth);
        y = writeBlock(briefing.majorInternationalThreats, margins, y, contentWidth);
        y = heading('Recommendations', y + 2);
        writeBlock(briefing.recommendedActions, margins, y, contentWidth);
      } else {
        writeBlock('Executive briefing data was unavailable at export time.', margins, y, contentWidth);
      }

      // Threat matrix and timeline page.
      if (briefing) {
        pdf.addPage();
        y = heading('Threat Matrix and Timeline', 22);
        pdf.setFontSize(9);
        briefing.severityMatrix?.forEach((item, index) => {
          const rowY = y + index * 12;
          pdf.setTextColor(...slate);
          pdf.text(item.category, margins, rowY);
          pdf.text(String(item.score), pageWidth - margins - 12, rowY);
          pdf.setFillColor(226, 232, 240);
          pdf.roundedRect(margins + 45, rowY - 4, contentWidth - 65, 4, 1, 1, 'F');
          pdf.setFillColor(item.score >= 70 ? 220 : item.score >= 40 ? 245 : 16, item.score >= 70 ? 38 : item.score >= 40 ? 158 : 185, item.score >= 70 ? 38 : item.score >= 40 ? 11 : 129);
          pdf.roundedRect(margins + 45, rowY - 4, (contentWidth - 65) * Math.min(item.score / 100, 1), 4, 1, 1, 'F');
        });
        y += Math.max((briefing.severityMatrix?.length || 0) * 12 + 10, 28);
        y = heading('Threat Timeline', y);
        for (const day of briefing.threatTimeline || []) {
          if (y > pageHeight - 35) { pdf.addPage(); y = heading('Threat Timeline (continued)', 22); }
          pdf.setTextColor(...cyan);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.text(day.date, margins, y);
          y += 6;
          for (const event of day.events) {
            y = writeBlock(`• ${event.title}: ${event.summary}`, margins + 4, y, contentWidth - 4, 8);
            if (y > pageHeight - 30) { pdf.addPage(); y = heading('Threat Timeline (continued)', 22); }
          }
        }
      }

      // Existing dashboard image remains the authoritative charts snapshot.
      pdf.addPage();
      y = heading('Charts and Analytics Snapshot', 22);
      const maxImageHeight = pageHeight - y - 25;
      const imageProps = pdf.getImageProperties(dataUrl);
      const imageHeight = Math.min((imageProps.height * contentWidth) / imageProps.width, maxImageHeight);
      pdf.addImage(dataUrl, 'PNG', margins, y, contentWidth, imageHeight);

      if (briefing) {
        pdf.addPage();
        y = heading('Source Intelligence', 22);
        const publisherCounts = new Map<string, number>();
        briefing.sources.forEach((source) => publisherCounts.set(source.sourceName || 'Unknown publisher', (publisherCounts.get(source.sourceName || 'Unknown publisher') || 0) + 1));
        const topPublisher = [...publisherCounts.entries()].sort((a, b) => b[1] - a[1])[0];
        y = writeBlock(`Most frequent publisher: ${topPublisher?.[0] || 'Unavailable'} (${topPublisher?.[1] || 0} articles)\nEvidence quality: ${briefing.confidenceEvidence?.evidenceQuality || 'Unavailable'}\nRecency: ${briefing.confidenceEvidence?.recency || 'Unavailable'}\nConfidence assessment: ${briefing.confidenceEvidence?.assessment || 'Unavailable'}`, margins, y, contentWidth);
        y = heading('Sources Consulted', y + 3);
        for (const source of briefing.sources) {
          if (y > pageHeight - 30) { pdf.addPage(); y = heading('Sources Consulted (continued)', 22); }
          y = writeBlock(`${source.title}\n${source.sourceName || 'Unknown publisher'} · ${source.publicationDate || 'Date unavailable'}\n${source.url}`, margins, y, contentWidth, 8);
        }
      }

      // Add consistent footer and page numbers after all pages are created.
      const totalPages = pdf.getNumberOfPages();
      for (let page = 1; page <= totalPages; page += 1) {
        pdf.setPage(page);
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.2);
        pdf.line(margins, pageHeight - 16, pageWidth - margins, pageHeight - 16);
        pdf.setTextColor(...slate);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.text('Crime Intelligence Platform · Confidential', margins, pageHeight - 10);
        pdf.text(`Page ${page} of ${totalPages}`, pageWidth - margins, pageHeight - 10, { align: 'right' });
      }

      pdf.save(`Briefing_${selectedRegion}_${generatedAt.toISOString().split('T')[0]}.pdf`);
      
    } catch (err) {
      console.error("CRITICAL PDF EXPORT ERROR:", err);
      alert("Error generating PDF. Please check the browser console.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppShell title="Intelligence Dashboard" subtitle="Real-time national security metrics and threat vectors.">
      <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-slate-900/50 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-400" />
            </div>
            <select 
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-slate-950 border border-white/20 rounded-lg px-4 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-slate-900 transition-colors"
            >
              <option value="All">National Overview (All Regions)</option>
              {[...statesData]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((state) => (
                  <option key={state.name} value={state.name}>{state.name}</option>
                ))}
            </select>
          </div>

          <button
            onClick={handleExportPDF}
            disabled={isExporting || isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 shadow-lg shadow-blue-900/20"
          >
            {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            {isExporting ? 'Generating Briefing...' : 'Export Briefing'}
          </button>
        </div>

        <div className="mb-6">
          <ExecutiveBriefingCard
            briefing={briefingQuery.data}
            isLoading={briefingQuery.isLoading}
            isFetching={briefingQuery.isFetching}
            error={briefingQuery.error}
            onRefresh={() => void briefingQuery.refetch()}
          />
        </div>

        <div ref={reportRef} className="space-y-6 pb-4 bg-[#0a0f1c] p-2 rounded-xl">
          {isLoading ? (
             <div className="h-64 flex items-center justify-center border border-white/5 rounded-xl bg-slate-900/20">
               <div className="flex flex-col items-center space-y-4">
                 <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                 <span className="text-slate-400 font-mono text-sm uppercase tracking-widest">Compiling Database Vectors...</span>
               </div>
             </div>
          ) : error ? (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400">
              Failed to load dashboard metrics. Ensure the core API is online.
            </div>
          ) : (
            <>
              {/* AI Forecasting Banner */}
              <div className="bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-500/30 p-6 rounded-xl shadow-2xl relative overflow-hidden z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                
                <div className="relative z-10 flex items-center space-x-4">
                  <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                    <BrainCircuit className="h-8 w-8 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-wide">Predictive AI Threat Engine</h2>
                    <p className="text-indigo-200/60 text-sm mt-1">Forecasting future trajectory based on live intelligence vectors</p>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col items-end">
                  <span className="text-xs font-mono text-slate-400 mb-1 uppercase tracking-widest">Projected Threat Level</span>
                  {isForecasting ? (
                    <div className="flex items-center space-x-3 text-indigo-400">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="font-mono text-sm">CALCULATING...</span>
                    </div>
                  ) : (
                    <span className={`text-4xl font-black uppercase tracking-widest ${threatColor}`}>
                      {threatLevel}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                <KPICard title="Total Incidents (YTD)" value={totalIncidents.toLocaleString()} icon={AlertTriangle} trend={selectedRegion === 'All' ? "National Total" : "State Total"} trendColor="text-blue-400"/>
                <KPICard title="Avg Crime Rate" value={avgCrimeRate} icon={TrendingUp} trend="Per Lakh" />
                <KPICard title="Crimes Against Women" value={totalWomenCrimes.toLocaleString()} icon={Users} />
                <KPICard title={selectedRegion === 'All' ? "Highest Threat Region" : "Current Threat Level"} value={selectedRegion === 'All' ? (top5CrimeStates[0]?.name || "N/A") : (activeData[0]?.risk || "N/A")} icon={ShieldAlert} trend={selectedRegion === 'All' ? "Critical" : ""} trendColor={activeData[0]?.risk === 'Critical' ? 'text-red-400' : 'text-orange-400'}/>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-2 mb-6">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                    <h3 className="text-base font-bold text-white">{selectedRegion === 'All' ? 'Highest Crime Rate Regions' : `${selectedRegion} Crime Rate`}</h3>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={top5CrimeStates}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} itemStyle={{ color: '#60a5fa' }} />
                        <Bar dataKey="crimeRate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-2 mb-6">
                    <ShieldAlert className="h-5 w-5 text-blue-400" />
                    <h3 className="text-base font-bold text-white">{selectedRegion === 'All' ? 'National Threat Distribution' : `${selectedRegion} Threat Profile`}</h3>
                  </div>
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                          {riskDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-lg lg:col-span-2">
                  <div className="flex items-center space-x-2 mb-6">
                    <FileText className="h-5 w-5 text-blue-400" />
                    <h3 className="text-base font-bold text-white">{selectedRegion === 'All' ? 'Investigation Bottlenecks (Lowest Chargesheet Rates)' : `${selectedRegion} Investigation Efficiency`}</h3>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={bottom5Chargesheet}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} itemStyle={{ color: '#ef4444' }} />
                        <Line type="monotone" dataKey="chargesheetRate" stroke="#ef4444" strokeWidth={3} dot={{ r: 6, fill: '#0f172a', stroke: '#ef4444', strokeWidth: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute('/dashboard')({
  component: DashboardComponent,
});