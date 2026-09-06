import { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, Loader2, Network } from 'lucide-react';
import type { ExecutiveBriefing } from '../lib/api';
import {
  getOperationalAssessment,
  getRelationshipGraph,
  getSourceIntelligence,
  getThreatDistribution,
  getTopKeywords,
} from '../lib/executiveBriefingAnalysis';

function ClientSideForceGraph(props: any) {
  const [ForceGraph2D, setForceGraph2D] = useState<any>(null);
  useEffect(() => {
    import('react-force-graph-2d').then((module) => setForceGraph2D(() => module.default));
  }, []);
  if (!ForceGraph2D) return <div className="flex h-full items-center justify-center text-xs text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Initializing intelligence graph...</div>;
  return <ForceGraph2D {...props} />;
}

const GROUP_COLORS: Record<string, string> = {
  Threat: '#dc2626',
  Country: '#8daed1',
  Organization: '#b6bdc9',
  Technology: '#345e8c',
  'Crime Type': '#f59e0b',
  Recommendation: '#2fbf71',
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - started) / 700, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{display}</>;
}

function ViewportBar({ percentage }: { percentage: number }) {
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
  return <div ref={ref} className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-cyan-400 transition-[width] duration-700 ease-out" style={{ width: visible ? `${percentage}%` : '0%' }} /></div>;
}

export function ExecutiveIntelligenceCenter({ briefing }: { briefing: ExecutiveBriefing }) {
  const distribution = useMemo(() => getThreatDistribution(briefing), [briefing]);
  const keywords = useMemo(() => getTopKeywords(briefing), [briefing]);
  const sources = useMemo(() => getSourceIntelligence(briefing), [briefing]);
  const graph = useMemo(() => getRelationshipGraph(briefing), [briefing]);
  const assessment = useMemo(() => getOperationalAssessment(briefing), [briefing]);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  return (
    <div className="mt-5 space-y-5 border-t border-white/10 pt-5 page-enter">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div><h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300">National Threat Intelligence Center</h3><p className="text-xs text-slate-500">Derived from the current briefing evidence set</p></div>
          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2 py-1 text-[10px] text-cyan-300">Operational view</span>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {[
            ['Articles analyzed', briefing.sources.length],
            ['Unique sources', new Set(briefing.sources.map((source) => source.sourceName || source.url)).size],
            ['Earliest publication', briefing.sources.map((source) => source.publicationDate).filter(Boolean).sort()[0] || 'Unavailable'],
            ['Latest publication', briefing.sources.map((source) => source.publicationDate).filter(Boolean).sort().at(-1) || 'Unavailable'],
            ['Average article age', sources.averagePublicationRecency],
            ['Confidence', `${briefing.confidenceEvidence?.score ?? 0}/100`],
            ['Evidence quality', briefing.confidenceEvidence?.evidenceQuality || 'Unavailable'],
            ['Risk level', briefing.riskLevel],
          ].map(([label, value]) => <div key={String(label)} className="intelligence-card intelligence-card-hover rounded-lg border border-white/10 bg-slate-950/40 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 truncate text-sm font-bold text-slate-200">{typeof value === 'number' ? <AnimatedNumber value={value} /> : value}</p></div>)}
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-400">{assessment}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div><h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Threat Distribution</h3><div className="space-y-2">{distribution.map((item) => <div key={item.category} className="intelligence-card intelligence-card-hover rounded-lg p-2"><div className="mb-1 flex justify-between text-xs text-slate-400"><span>{item.category}</span><span>{item.count} articles</span></div><ViewportBar percentage={item.percentage} /></div>)}</div></div>
        <div><h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Top Intelligence Keywords</h3><div className="flex flex-wrap gap-2">{keywords.map((keyword) => <span key={keyword} className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[11px] text-blue-200">{keyword}</span>)}</div></div>
      </div>

      <div><h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Source Intelligence</h3><div className="grid grid-cols-2 gap-2 md:grid-cols-5">{[['Most frequent publisher', sources.mostFrequentPublisher], ['Government sources', sources.governmentSources], ['International sources', sources.internationalSources], ['Avg recency', sources.averagePublicationRecency], ['Source diversity', `${sources.sourceDiversityScore}/100`]].map(([label, value]) => <div key={String(label)} className="intelligence-card intelligence-card-hover rounded-lg border border-white/10 bg-slate-950/40 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 truncate text-sm font-bold text-slate-200">{typeof value === 'number' ? <AnimatedNumber value={value} /> : value}</p></div>)}</div></div>

      <div><div className="mb-3 flex items-center gap-2"><Network className="h-4 w-4 text-cyan-300" /><h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Intelligence Relationship Graph</h3></div><div className="grid min-h-[320px] grid-cols-1 overflow-hidden rounded-lg border border-white/10 bg-slate-950/60 lg:grid-cols-[1fr_240px]"><ClientSideForceGraph graphData={graph} warmupTicks={80} cooldownTicks={60} d3AlphaDecay={0.03} nodeLabel={(node: any) => `${node.name} · ${node.evidenceCount} evidence`} nodeColor={(node: any) => GROUP_COLORS[node.group] || '#94a3b8'} linkColor={() => 'rgba(148,163,184,0.3)'} linkWidth={(link: any) => Math.min(link.evidenceCount + 1, 4)} onNodeClick={(node: any) => setSelectedNode(node)} nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => { const label = node.name; const fontSize = Math.max(8 / globalScale, 3); ctx.beginPath(); ctx.shadowBlur = 10; ctx.shadowColor = GROUP_COLORS[node.group] || '#94a3b8'; ctx.fillStyle = GROUP_COLORS[node.group] || '#94a3b8'; ctx.arc(node.x, node.y, Math.max(3, 5 / globalScale), 0, 2 * Math.PI); ctx.fill(); ctx.shadowBlur = 0; ctx.font = `${fontSize}px Sans-Serif`; ctx.fillStyle = '#cbd5e1'; ctx.fillText(label, node.x + 7 / globalScale, node.y + 3 / globalScale); }} />{selectedNode ? <div className="border-l border-white/10 p-4 page-enter"><p className="text-[10px] uppercase tracking-wider text-cyan-300">Selected entity</p><h4 className="mt-1 text-sm font-bold text-white">{selectedNode.name}</h4><p className="mt-2 text-xs text-slate-400">{selectedNode.group} · {selectedNode.evidenceCount} evidence items</p><div className="mt-3 space-y-2">{selectedNode.articles.map((article: ExecutiveBriefing['sources'][number]) => <a key={article.url} href={article.url} target="_blank" rel="noreferrer" className="flex gap-2 text-xs text-slate-400 transition-colors hover:text-white"><ExternalLink className="mt-0.5 h-3 w-3 flex-shrink-0" />{article.title}</a>)}</div></div> : <div className="border-l border-white/10 p-4 text-xs text-slate-500">Select a node to inspect connected evidence, sources, and publication dates.</div>}</div></div>
    </div>
  );
}
