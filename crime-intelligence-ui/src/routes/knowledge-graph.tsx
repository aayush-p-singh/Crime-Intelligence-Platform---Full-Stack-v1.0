import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '../components/AppShell';
import { api, GraphNode, GraphLink } from '../lib/api';
import { Network, Search, Layers, Info, AlertCircle, Loader2, MousePointer2, Focus } from 'lucide-react';

// --- Safe Client-Side Graph Loader ---
// Prevents SSR crashes when rendering Canvas elements
function ClientSideForceGraph(props: any) {
  const [ForceGraph2D, setForceGraph2D] = useState<any>(null);

  useEffect(() => {
    import('react-force-graph-2d').then((mod) => {
      setForceGraph2D(() => mod.default);
    });
  }, []);

  if (!ForceGraph2D) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p>Initializing Graph Physics Engine...</p>
      </div>
    );
  }

  return <ForceGraph2D {...props} />;
}

// --- Theme Constants ---
const NODE_COLORS: Record<string, string> = {
  'State': '#3b82f6',   // blue-500
  'Metric': '#8b5cf6',  // violet-500
  'AI': '#ec4899',      // pink-500
  'Unknown': '#94a3b8'  // slate-400
};

// --- Main Route Component ---
function KnowledgeGraphComponent() {
  const fgRef = useRef<any>(null);
  const [selectedState, setSelectedState] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  
  // Highlight state
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);

  // Queries
  const { data: stateList, isLoading: isListLoading } = useQuery({
    queryKey: ['states-list'],
    queryFn: api.getStates,
  });

  // Auto-select the first state when the list loads
  useEffect(() => {
    if (stateList && stateList.length > 0 && !selectedState) {
      setSelectedState(stateList[0]);
    }
  }, [stateList, selectedState]);

  const { data: graphData, isLoading: isGraphLoading, error: graphError } = useQuery({
    queryKey: ['knowledge-graph', selectedState],
    queryFn: () => api.getKnowledgeGraph(selectedState),
    enabled: !!selectedState,
  });

  // Pre-calculate node neighbors for fast highlighting
  const neighbors = useMemo(() => {
    const map = new Map<string, { nodes: Set<string>, links: Set<any> }>();
    if (graphData) {
      graphData.links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
        
        if (!map.has(sourceId)) map.set(sourceId, { nodes: new Set(), links: new Set() });
        if (!map.has(targetId)) map.set(targetId, { nodes: new Set(), links: new Set() });
        
        map.get(sourceId)!.nodes.add(targetId);
        map.get(sourceId)!.links.add(link);
        map.get(targetId)!.nodes.add(sourceId);
        map.get(targetId)!.links.add(link);
      });
    }
    return map;
  }, [graphData]);

  // Handle Hover logic
  const handleNodeHover = useCallback((node: any) => {
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    if (node) {
      const neighborData = neighbors.get(node.id);
      if (neighborData) {
        setHighlightNodes(neighborData.nodes);
        setHighlightLinks(neighborData.links);
      }
      setHighlightNodes(prev => new Set(prev).add(node.id));
    }
    setHoverNode(node || null);
  }, [neighbors]);

  // Handle Search Filtering
  const filteredNodes = useMemo(() => {
    if (!graphData) return [];
    if (!searchQuery) return graphData.nodes;
    return graphData.nodes.filter(n => 
      n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.group.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [graphData, searchQuery]);

  return (
    <AppShell title="Knowledge Graph" subtitle="Explore entity relationships and threat networks.">
      <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col max-w-[1600px] mx-auto">
        
        {/* Controls Header */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Network className="h-5 w-5 text-blue-400" />
            </div>
            <select 
              className="bg-slate-800 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              disabled={isListLoading}
            >
              <option value="">Select Target State...</option>
              {stateList?.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search nodes or metrics..."
              className="w-full bg-slate-800 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
          
          {/* Graph Visualization (Left 3/4) */}
          <div className="lg:col-span-3 relative bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-inner flex flex-col">
            
            {isGraphLoading ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-300">Constructing Graph Topology...</p>
              </div>
            ) : graphError ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur text-red-400">
                <AlertCircle className="h-10 w-10 mb-4" />
                <p>Failed to retrieve node data.</p>
              </div>
            ) : graphData && (
              <div className="flex-1 w-full h-full cursor-crosshair">
                <ClientSideForceGraph
                  ref={fgRef}
                  graphData={graphData}
                  nodeId="id"
                  nodeLabel="label"
                  nodeColor={(node: any) => {
                    const isSearchHit = searchQuery && filteredNodes.includes(node);
                    const baseColor = NODE_COLORS[node.group] || NODE_COLORS['Unknown'];
                    if (highlightNodes.size > 0 && !highlightNodes.has(node.id)) return '#334155'; // Dim non-neighbors
                    if (isSearchHit) return '#fbbf24'; // Highlight search matches
                    return baseColor;
                  }}
                  nodeRelSize={6}
                  linkColor={(link: any) => highlightLinks.has(link) ? '#60a5fa' : '#334155'}
                  linkWidth={(link: any) => highlightLinks.has(link) ? 2 : 1}
                  linkDirectionalParticles={(link: any) => highlightLinks.has(link) ? 4 : 0}
                  linkDirectionalParticleWidth={3}
                  onNodeHover={handleNodeHover}
                  onNodeClick={(node: any) => {
                    setSelectedNode(node);
                    // Camera focus animation
                    if (fgRef.current) {
                      fgRef.current.centerAt(node.x, node.y, 1000);
                      fgRef.current.zoom(2.5, 1000);
                    }
                  }}
                  d3VelocityDecay={0.3} // Makes the physics settle slightly faster
                  backgroundColor="#0f172a" // slate-900 to match theme perfectly
                />
              </div>
            )}

            {/* Graph Legend Overlay */}
            <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur border border-white/10 p-3 rounded-lg flex flex-col gap-2 z-10">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1 flex items-center">
                <Layers className="h-3 w-3 mr-1" /> Node Taxonomy
              </span>
              {Object.entries(NODE_COLORS).map(([group, color]) => (
                group !== 'Unknown' && (
                  <div key={group} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color }}></div>
                    <span className="text-xs text-slate-300 font-medium">{group}</span>
                  </div>
                )
              ))}
            </div>

            {/* Hint Overlay */}
            <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur border border-white/10 px-3 py-1.5 rounded-full z-10 flex items-center shadow-lg">
              <Focus className="h-4 w-4 text-blue-400 mr-2" />
              <span className="text-xs text-slate-300">Scroll to zoom. Drag background to pan.</span>
            </div>
          </div>

          {/* Node Details Sidebar (Right 1/4) */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg flex flex-col overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center space-x-2 border-b border-white/10 pb-4 mb-4">
              <Info className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Entity Inspection</h3>
            </div>

            {!selectedNode ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <MousePointer2 className="h-12 w-12 text-slate-400 mb-4" />
                <p className="text-sm text-slate-400">Click any node in the graph to inspect its metadata and relationships.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div>
                  <span className="text-xs font-bold tracking-wider uppercase" style={{ color: NODE_COLORS[selectedNode.group] || NODE_COLORS['Unknown'] }}>
                    {selectedNode.group} Node
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1 whitespace-pre-wrap leading-tight">
                    {selectedNode.label}
                  </h2>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-white/5 pb-2">Properties</h4>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 break-words">
                    <span className="text-xs text-slate-400 block mb-1">System ID</span>
                    <span className="text-sm font-mono text-slate-300">{selectedNode.id}</span>
                  </div>
                  
                  {/* Dynamic properties rendering */}
                  {Object.entries(selectedNode).map(([key, value]) => {
                    if (['id', 'label', 'group', 'x', 'y', 'vx', 'vy', 'index'].includes(key)) return null;
                    return (
                      <div key={key} className="bg-white/5 border border-white/10 rounded-lg p-3 break-words">
                        <span className="text-xs text-slate-400 block mb-1 capitalize">{key.replace('_', ' ')}</span>
                        <span className="text-sm text-slate-300 font-medium">{String(value)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Connections Summary */}
                {neighbors.has(selectedNode.id) && (
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Topology Summary</h4>
                    <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <span className="text-sm text-blue-400 font-medium">Direct Connections</span>
                      <span className="text-lg font-bold text-blue-400">{neighbors.get(selectedNode.id)?.nodes.size}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute('/knowledge-graph')({
  component: KnowledgeGraphComponent,
});