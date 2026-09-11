import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "../components/AppShell";
import { api, GraphNode, GraphLink } from "../lib/api";
import {
  Network,
  Search,
  Layers,
  Info,
  AlertCircle,
  Loader2,
  MousePointer2,
  Focus,
  Maximize,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  Database,
  Crosshair,
  Link as LinkIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Safe Client-Side Graph Loader ---
function ClientSideForceGraph(props: any) {
  const [ForceGraph2D, setForceGraph2D] = useState<any>(null);

  useEffect(() => {
    import("react-force-graph-2d").then((mod) => {
      setForceGraph2D(() => mod.default);
    });
  }, []);

  if (!ForceGraph2D) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#666]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0891b2] mb-4" />
        <p className="text-[11px] font-mono tracking-widest uppercase">Initializing Physics Engine</p>
      </div>
    );
  }

  return <ForceGraph2D {...props} />;
}

// --- Theme Constants ---
const NODE_COLORS: Record<string, string> = {
  State: "#0891b2", // Cyan/Blue
  Metric: "#f59e0b", // Amber
  AI: "#7c3aed", // Purple
  Unknown: "#64748b", // Slate
};

const NODE_SIZES: Record<string, number> = {
  State: 20,
  Metric: 12,
  AI: 14,
  Unknown: 10,
};

// --- Main Route Component ---
function KnowledgeGraphComponent() {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedState, setSelectedState] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);

  // Maintain actual dimension of canvas container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", updateDimensions);
    // Initial measure after mount
    setTimeout(updateDimensions, 50);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Queries
  const { data: stateList, isLoading: isListLoading } = useQuery({
    queryKey: ["states-list"],
    queryFn: api.getStates,
  });

  useEffect(() => {
    if (stateList && stateList.length > 0 && !selectedState) {
      setSelectedState(stateList[0]);
    }
  }, [stateList, selectedState]);

  const {
    data: graphData,
    isLoading: isGraphLoading,
    error: graphError,
  } = useQuery({
    queryKey: ["knowledge-graph-synthesized", selectedState],
    queryFn: async () => {
      const [stateData, predictionData] = await Promise.all([
        api.getStateDetails(selectedState),
        api.getPrediction(selectedState).catch(() => null) // graceful fallback
      ]);

      const nodes: GraphNode[] = [];
      const links: GraphLink[] = [];

      const stateId = selectedState.toLowerCase();
      
      // 1. Anchor Node (State)
      nodes.push({
        id: stateId,
        label: selectedState,
        group: "State",
        type: "jurisdiction",
        ...stateData
      });

      // 2. Metrics (Total, Rate, Women, Chargesheet)
      if (stateData.totalCrime) {
        nodes.push({
          id: `${stateId}-total`,
          label: "Total Incidents",
          group: "Metric",
          type: "metric",
          value: stateData.totalCrime.toLocaleString(),
          raw_value: stateData.totalCrime
        });
        links.push({ source: stateId, target: `${stateId}-total`, type: "has_metric" });
      }

      if (stateData.crimeRate) {
        nodes.push({
          id: `${stateId}-rate`,
          label: "Crime Rate",
          group: "Metric",
          type: "metric",
          value: stateData.crimeRate.toString(),
          raw_value: stateData.crimeRate
        });
        links.push({ source: stateId, target: `${stateId}-rate`, type: "has_metric" });
      }

      if (stateData.womenCrime) {
        nodes.push({
          id: `${stateId}-women`,
          label: "Crimes Against Women",
          group: "Metric",
          type: "metric",
          value: stateData.womenCrime.toLocaleString(),
          raw_value: stateData.womenCrime
        });
        links.push({ source: stateId, target: `${stateId}-women`, type: "has_metric" });
      }

      if (stateData.chargesheetRate) {
        nodes.push({
          id: `${stateId}-chargesheet`,
          label: "Chargesheet Rate",
          group: "Metric",
          type: "metric",
          value: `${stateData.chargesheetRate}%`,
          raw_value: stateData.chargesheetRate
        });
        links.push({ source: stateId, target: `${stateId}-chargesheet`, type: "has_metric" });
      }
      
      // 3. AI / Intelligence Nodes
      if (predictionData) {
        if (predictionData.riskLevel || stateData.risk) {
          nodes.push({
            id: `${stateId}-risk`,
            label: "AI Threat Level",
            group: "AI",
            type: "prediction",
            value: predictionData.riskLevel || stateData.risk,
            risk_score: predictionData.riskScore
          });
          links.push({ source: stateId, target: `${stateId}-risk`, type: "assessed_as" });
        }
        
        if (predictionData.trend) {
          nodes.push({
            id: `${stateId}-trend`,
            label: "Forecast Trend",
            group: "AI",
            type: "prediction",
            value: predictionData.trend,
            growth_percent: `${predictionData.growthPercent}%`,
            predicted_incidents: predictionData.predictedTotalCrime
          });
          links.push({ source: stateId, target: `${stateId}-trend`, type: "forecasts" });
        }
      }

      return { nodes, links };
    },
    enabled: !!selectedState,
  });

  // Reset selected node when data changes
  useEffect(() => {
    setSelectedNode(null);
    setHoverNode(null);
    
    // Once data is loaded, apply force spacing and fit
    if (graphData && fgRef.current) {
      // Tighter physics to make sparse graphs feel dense and intentional
      fgRef.current.d3Force("charge").strength(-100);
      fgRef.current.d3Force("link").distance(100);
      // Wait for physics to settle then tightly fit the graph
      setTimeout(() => {
        fgRef.current?.zoomToFit(1000, 100); 
      }, 1000);
    }
  }, [graphData]);

  // Pre-calculate node neighbors
  const neighbors = useMemo(() => {
    const map = new Map<string, { nodes: Set<string>; links: Set<any> }>();
    if (graphData) {
      graphData.links.forEach((link) => {
        const sourceId = typeof link.source === "object" ? (link.source as any).id : link.source;
        const targetId = typeof link.target === "object" ? (link.target as any).id : link.target;

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

  // Active state logic
  const activeNode = selectedNode || hoverNode;
  const highlightNodes = useMemo(() => {
    if (!activeNode) return new Set();
    const set = new Set(neighbors.get(activeNode.id)?.nodes || []);
    set.add(activeNode.id);
    return set;
  }, [activeNode, neighbors]);

  const highlightLinks = useMemo(() => {
    if (!activeNode) return new Set();
    return neighbors.get(activeNode.id)?.links || new Set();
  }, [activeNode, neighbors]);

  // Search
  const filteredNodes = useMemo(() => {
    if (!graphData || !searchQuery) return [];
    return graphData.nodes.filter(
      (n) =>
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.group || "").toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [graphData, searchQuery]);

  // Custom Node Painting
  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isSearchHit = searchQuery && filteredNodes.includes(node);
    const isHovered = node === hoverNode;
    const isSelected = node === selectedNode;
    const isNeighbor = highlightNodes.has(node.id);
    const isDimmed = activeNode && !isNeighbor;
    
    const baseColor = NODE_COLORS[node.group] || NODE_COLORS["Unknown"];
    const baseRadius = NODE_SIZES[node.group] || NODE_SIZES["Unknown"];
    const radius = isSelected ? baseRadius * 1.6 : isHovered ? baseRadius * 1.3 : baseRadius;
    
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    
    if (isDimmed) {
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fill();
    } else {
      ctx.fillStyle = isSearchHit ? "#fff" : baseColor;
      ctx.fill();
      
      ctx.lineWidth = isSelected ? 2 / globalScale : 1.5 / globalScale;
      ctx.strokeStyle = isSelected ? "#fff" : "rgba(0,0,0,0.8)";
      ctx.stroke();
      
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + (4 / globalScale), 0, 2 * Math.PI, false);
        ctx.fillStyle = `${baseColor}44`; 
        ctx.fill();
      }
    }

    // Display labels prominently to fill empty space and provide immediate context
    const isStateNode = node.group === "State";
    const showLabel = isStateNode || isSelected || isHovered || (!activeNode) || isNeighbor;
    if (showLabel && !isDimmed) {
      const fontSize = isStateNode ? Math.max(14 / globalScale, 6) : Math.max(11 / globalScale, 4);
      ctx.font = `600 ${fontSize}px "Inter", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = isSelected ? "#fff" : isStateNode ? "#fff" : "rgba(255,255,255,0.7)";
      ctx.fillText(node.label, node.x, node.y + radius + (6 / globalScale));
      
      // If the node has a 'value' property, display it under the label
      if (node.value !== undefined && node.value !== null) {
        ctx.font = `500 ${fontSize * 0.8}px "JetBrains Mono", monospace`;
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText(String(node.value), node.x, node.y + radius + (6 / globalScale) + fontSize + (2 / globalScale));
      }
    }
  }, [searchQuery, filteredNodes, hoverNode, selectedNode, highlightNodes, activeNode]);

  // Graph Controls
  const handleZoomIn = () => fgRef.current?.zoom(fgRef.current.zoom() * 1.5, 400);
  const handleZoomOut = () => fgRef.current?.zoom(fgRef.current.zoom() / 1.5, 400);
  const handleFit = () => fgRef.current?.zoomToFit(600, 50);

  return (
    <AppShell title="Entity Network" subtitle="Knowledge graph visualization of interconnected intelligence vectors.">
      <div className="h-[calc(100vh-100px)] w-full flex flex-col pb-4 max-w-[1800px] mx-auto animate-in fade-in duration-500">
        
        {/* Controls Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-black/[0.06] rounded-xl p-3 shadow-sm mb-4 shrink-0 z-10 relative">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="w-8 h-8 rounded-lg bg-black/[0.03] border border-black/[0.05] flex items-center justify-center">
              <Network className="h-4 w-4 text-[#111]" />
            </div>
            <select
              className="bg-black/[0.02] hover:bg-black/[0.04] transition-colors border border-black/[0.06] rounded-lg p-2 text-[#111] text-sm font-medium outline-none w-full sm:w-64 appearance-none cursor-pointer"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              disabled={isListLoading}
            >
              <option value="" disabled>Select Target Jurisdiction...</option>
              {stateList?.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888]" />
            <input
              type="text"
              placeholder="Search entities or metrics..."
              className="w-full bg-white border border-black/[0.08] hover:border-black/20 focus:border-[#111] transition-colors rounded-lg py-2 pl-9 pr-4 text-sm text-[#111] outline-none shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
          
          {/* Graph Canvas */}
          <div className="flex-1 relative bg-[#0b0b0d] rounded-xl overflow-hidden shadow-inner flex flex-col border border-black/10">
            <div className="absolute inset-0 blueprint-grid-premium opacity-10 pointer-events-none" />
            
            {isGraphLoading ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0b0b0d]/90 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 text-white animate-spin mb-4" />
                <p className="text-[11px] font-mono tracking-widest text-[#888] uppercase">Resolving Entity Network...</p>
              </div>
            ) : graphError ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0b0b0d]/90 text-red-400">
                <AlertCircle className="h-8 w-8 mb-4" />
                <p className="text-sm font-medium">Failed to retrieve network topology.</p>
              </div>
            ) : (
              graphData && (
                <div ref={containerRef} className="flex-1 w-full h-full cursor-crosshair">
                  <ClientSideForceGraph
                    ref={fgRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    graphData={graphData}
                    nodeId="id"
                    nodeRelSize={6}
                    nodeCanvasObject={paintNode}
                    linkColor={(link: any) => {
                      if (activeNode) return highlightLinks.has(link) ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.03)";
                      return "rgba(255,255,255,0.15)";
                    }}
                    linkWidth={(link: any) => highlightLinks.has(link) ? 3 : 1.5}
                    linkDirectionalParticles={(link: any) => highlightLinks.has(link) ? 3 : 0}
                    linkDirectionalParticleWidth={2}
                    linkDirectionalParticleColor={() => "rgba(255,255,255,0.8)"}
                    onNodeHover={(node: any) => {
                      if (!selectedNode) {
                        setHoverNode(node || null);
                      }
                    }}
                    onNodeClick={(node: any) => {
                      if (selectedNode === node) {
                        setSelectedNode(null);
                      } else {
                        setSelectedNode(node);
                        setHoverNode(null);
                        fgRef.current?.centerAt(node.x, node.y, 800);
                        fgRef.current?.zoom(2.5, 800);
                      }
                    }}
                    onBackgroundClick={() => setSelectedNode(null)}
                    d3VelocityDecay={0.25}
                    backgroundColor="transparent"
                  />
                </div>
              )
            )}

            {/* Floating Controls Overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg p-1 shadow-lg flex flex-col">
                <button onClick={handleZoomIn} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Zoom In">
                  <ZoomIn className="h-4 w-4" />
                </button>
                <div className="h-px bg-white/10 mx-1" />
                <button onClick={handleZoomOut} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Zoom Out">
                  <ZoomOut className="h-4 w-4" />
                </button>
                <div className="h-px bg-white/10 mx-1" />
                <button onClick={handleFit} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Fit to View">
                  <Maximize className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Taxonomy Legend */}
            <div className="absolute bottom-4 left-4 bg-[#0b0b0d]/80 backdrop-blur-md border border-white/10 p-3 rounded-lg flex flex-col gap-2 z-10 shadow-lg">
              <span className="text-[10px] text-[#888] font-mono font-bold uppercase tracking-[0.2em] mb-1 flex items-center">
                <Layers className="h-3 w-3 mr-1.5 opacity-70" /> Taxonomy
              </span>
              <div className="flex gap-4">
                {Object.entries(NODE_COLORS).map(([group, color]) => group !== "Unknown" && (
                  <div key={group} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: color }}></div>
                    <span className="text-[11px] text-[#ccc] font-medium tracking-wide">{group}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Status Hint */}
            <div className="absolute bottom-4 right-4 flex items-center bg-[#0b0b0d]/60 backdrop-blur px-3 py-1.5 rounded-full border border-white/5">
              <span className="flex h-2 w-2 relative mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-[#888] font-mono uppercase tracking-widest">Live Sync</span>
            </div>
          </div>

          {/* Node Details Sidebar */}
          <div className="w-full lg:w-[380px] bg-white border border-black/[0.06] rounded-xl flex flex-col shadow-sm shrink-0 overflow-hidden relative">
            <div className="px-5 py-4 border-b border-black/[0.06] bg-black/[0.01] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-black/[0.03] border border-black/[0.05]">
                <Info className="h-4 w-4 text-[#111]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111]">Entity Inspection</h3>
                <p className="text-[10px] font-mono text-[#888] uppercase tracking-wider mt-0.5">Network Analytics</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
              <AnimatePresence mode="wait">
                {!selectedNode ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center opacity-60"
                  >
                    <div className="w-12 h-12 rounded-full border border-dashed border-black/20 flex items-center justify-center mb-4">
                      <Crosshair className="h-5 w-5 text-[#888]" />
                    </div>
                    <p className="text-sm text-[#444] font-medium">No Entity Selected</p>
                    <p className="text-[11px] text-[#888] mt-2 max-w-[200px] leading-relaxed">
                      Select a node in the graph canvas to inspect properties and network topology.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key={selectedNode.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Header */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: NODE_COLORS[selectedNode.group || "Unknown"] }}></span>
                        <span className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-[#666]">
                          {selectedNode.group} Node
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-[#111] leading-snug tracking-tight">
                        {selectedNode.label}
                      </h2>
                    </div>

                    {/* Properties */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-1 border-b border-black/[0.06]">
                        <Database className="h-3.5 w-3.5 text-[#888]" />
                        <h4 className="text-[11px] font-bold text-[#111] uppercase tracking-wider">Properties</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <div className="bg-black/[0.02] border border-black/[0.04] rounded-lg px-3 py-2 flex flex-col">
                          <span className="text-[10px] text-[#888] font-medium uppercase tracking-wider">System ID</span>
                          <span className="text-xs font-mono text-[#111] mt-0.5 truncate" title={selectedNode.id}>{selectedNode.id}</span>
                        </div>
                        
                        {Object.entries(selectedNode).map(([key, value]) => {
                          if (["id", "label", "group", "x", "y", "vx", "vy", "index"].includes(key)) return null;
                          return (
                            <div key={key} className="bg-black/[0.02] border border-black/[0.04] rounded-lg px-3 py-2 flex flex-col">
                              <span className="text-[10px] text-[#888] font-medium uppercase tracking-wider">
                                {key.replace(/_/g, " ")}
                              </span>
                              <span className="text-sm text-[#111] font-medium mt-0.5 break-words">
                                {String(value)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Topology Summary */}
                    {neighbors.has(selectedNode.id) && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2 pb-1 border-b border-black/[0.06]">
                          <LinkIcon className="h-3.5 w-3.5 text-[#888]" />
                          <h4 className="text-[11px] font-bold text-[#111] uppercase tracking-wider">Topology Summary</h4>
                        </div>
                        
                        <div className="bg-[#111] rounded-lg p-4 relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex justify-between items-center relative z-10">
                            <div>
                              <span className="text-[10px] text-[#888] font-mono font-bold uppercase tracking-wider">Direct Links</span>
                              <p className="text-2xl font-bold text-white mt-0.5">{neighbors.get(selectedNode.id)?.nodes.size}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                              <Network className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute("/knowledge-graph")({
  component: KnowledgeGraphComponent,
});

