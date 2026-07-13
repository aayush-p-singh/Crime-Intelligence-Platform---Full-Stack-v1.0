import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Map as MapIcon, ShieldAlert, Users, Activity, Crosshair, Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { AppShell } from '../components/AppShell';
import { api, StateData } from '../lib/api';

// --- Types & Theming ---

type ColorMode = 'risk' | 'crimeRate';

const RISK_COLORS: Record<string, string> = {
  'Critical': '#ef4444', // red-500
  'High': '#f97316',     // orange-500
  'Medium': '#eab308',   // yellow-500
  'Low': '#22c55e',      // green-500
  'Unknown': '#3b82f6',  // blue-500
};

// Reliable public CDN for India TopoJSON
// 2024 Updated India TopoJSON (Includes Ladakh & Accurate NE Borders)
const INDIA_TOPO_JSON = "https://raw.githubusercontent.com/udit-001/india-maps-data/main/topojson/india.json";

function getCrimeRateColor(rate: number, maxRate: number): string {
  const intensity = Math.min(Math.max(rate / (maxRate || 1), 0.1), 1);
  return `rgba(139, 92, 246, ${intensity})`; 
}

// Helper to match map TopoJSON names with DB names
const normalizeName = (name: string) => {
  if (!name) return "";
  return name.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/nct of delhi/g, 'delhi')
    .replace(/ state/g, '')
    .trim();
};

// --- Reusable Components ---

function MetricRow({ icon: Icon, label, value, colorClass = "text-white" }: { icon: any, label: string, value: string | number, colorClass?: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
      <div className="flex items-center space-x-3">
        <Icon className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-300">{label}</span>
      </div>
      <span className={`text-sm font-bold ${colorClass}`}>{value}</span>
    </div>
  );
}

// --- Main Route Component ---

function IndiaMapComponent() {
  const [colorMode, setColorMode] = useState<ColorMode>('risk');
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);
  const [selectedStateName, setSelectedStateName] = useState<string | null>(null);

  const { data: mapData, isLoading: isMapLoading, error: mapError } = useQuery({
    queryKey: ['map-data'],
    queryFn: api.getMapData,
  });

  const { data: selectedStateDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ['state-details', selectedStateName],
    queryFn: () => api.getStateDetails(selectedStateName!),
    enabled: !!selectedStateName,
  });

  const maxCrimeRate = mapData ? Math.max(...mapData.map(d => d.crimeRate || 0)) : 1000;

  // FIXED: Strict matching logic that ignores empty strings
  const findMatchingState = (geoName: string) => {
    if (!mapData || !geoName) return null;
    
    const normGeo = normalizeName(geoName);
    if (!normGeo) return null;

    return mapData.find(d => {
      const normDb = normalizeName(d.name);
      if (!normDb) return false;
      
      // Require exact match or a substantial substring match (stops empty string bugs)
      return normDb === normGeo || (normGeo.length > 3 && (normDb.includes(normGeo) || normGeo.includes(normDb)));
    }) || null;
  };

  const getStateColor = (state: StateData | null) => {
    if (!state) return '#1e293b'; 
    if (colorMode === 'risk') {
      return RISK_COLORS[state.risk || 'Unknown'] || RISK_COLORS['Unknown'];
    } else {
      return getCrimeRateColor(state.crimeRate, maxCrimeRate);
    }
  };

  return (
    <AppShell title="Geospatial Map" subtitle="Interactive risk and crime distribution analysis.">
      <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col">
        
        {/* Controls Header */}
        <div className="flex flex-wrap items-center justify-between bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-2">
            <MapIcon className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Interactive India Map</h2>
          </div>
          
          <div className="flex items-center bg-black/20 rounded-lg p-1 border border-white/5">
            <button
              onClick={() => setColorMode('risk')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${colorMode === 'risk' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Risk Level
            </button>
            <button
              onClick={() => setColorMode('crimeRate')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${colorMode === 'crimeRate' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Crime Rate
            </button>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          
          {/* MAP AREA */}
          <div className="lg:col-span-2 relative bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
            
            {isMapLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-300">Loading Geospatial Data...</p>
              </div>
            )}

            {mapError && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur text-red-400">
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
                  center: [80, 22] // Center coordinates for India
                }}
                className="w-full h-full outline-none"
              >
                <Geographies geography={INDIA_TOPO_JSON}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      // Extract name safely from nested TopoJSON structure
                      const geoName = geo.properties?.st_nm || geo.properties?.NAME_1 || geo.properties?.name || geo.id || "";
                      const matchedState = findMatchingState(geoName);
                      const isSelected = selectedStateName && matchedState?.name === selectedStateName;
                      
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={getStateColor(matchedState)}
                          stroke={isSelected ? "#ffffff" : "#334155"}
                          strokeWidth={isSelected ? 1.5 : 0.5}
                          onClick={() => matchedState && setSelectedStateName(matchedState.name)}
                          onMouseEnter={() => matchedState && setHoveredState(matchedState)}
                          onMouseLeave={() => setHoveredState(null)}
                          style={{
                            default: { outline: "none", transition: "all 0.3s" },
                            hover: { fill: matchedState ? "#60a5fa" : "#1e293b", outline: "none", cursor: matchedState ? "pointer" : "default", transition: "all 0.2s" },
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
                <div className="absolute bottom-6 left-6 bg-slate-800/90 backdrop-blur-xl border border-white/20 p-4 rounded-xl shadow-2xl z-20 pointer-events-none transform transition-all duration-200">
                  <h4 className="text-white font-bold text-lg mb-2">{hoveredState.name}</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-300 flex justify-between gap-4">
                      <span>Risk Level:</span> 
                      <span className="font-bold" style={{ color: RISK_COLORS[hoveredState.risk || 'Unknown'] }}>
                        {hoveredState.risk}
                      </span>
                    </p>
                    <p className="text-sm text-slate-300 flex justify-between gap-4">
                      <span>Crime Rate:</span> 
                      <span className="font-bold text-white">{hoveredState.crimeRate}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur border border-white/10 p-3 rounded-lg flex flex-col gap-2 z-10 pointer-events-none">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                {colorMode === 'risk' ? 'Risk Legend' : 'Intensity Legend'}
              </span>
              {colorMode === 'risk' ? (
                Object.entries(RISK_COLORS).map(([label, color]) => (
                  label !== 'Unknown' && (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                      <span className="text-xs text-slate-300">{label}</span>
                    </div>
                  )
                ))
              ) : (
                <div className="w-32 h-3 bg-gradient-to-r from-[rgba(139,92,246,0.1)] to-[rgba(139,92,246,1)] rounded-full"></div>
              )}
            </div>
          </div>

          {/* SIDEBAR AREA */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg flex flex-col overflow-y-auto custom-scrollbar">
            
            {!selectedStateName ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <Crosshair className="h-16 w-16 text-slate-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Target Required</h3>
                <p className="text-sm text-slate-400 max-w-[200px]">
                  Select a state on the geographic map to view detailed intelligence and predictions.
                </p>
              </div>
            ) : isDetailsLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-300">Decrypting state records...</p>
              </div>
            ) : selectedStateDetails ? (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                
                {/* Header */}
                <div className="border-b border-white/10 pb-4">
                  <div className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
                    State Profile
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedStateDetails.name}</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-400">Current AI Threat Assessment:</span>
                    <span 
                      className="text-sm font-bold px-2 py-0.5 rounded border"
                      style={{ 
                        color: RISK_COLORS[selectedStateDetails.risk || 'Unknown'],
                        borderColor: RISK_COLORS[selectedStateDetails.risk || 'Unknown'],
                        backgroundColor: `${RISK_COLORS[selectedStateDetails.risk || 'Unknown']}20`
                      }}
                    >
                      {selectedStateDetails.risk || 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Core Metrics</h3>
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
                    colorClass="text-blue-400"
                  />
                  <MetricRow 
                    icon={ShieldAlert} 
                    label="Total Incidents" 
                    value={selectedStateDetails.totalCrime.toLocaleString()} 
                  />
                </div>

                <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ShieldAlert className="h-4 w-4 text-blue-400" />
                    <h4 className="text-sm font-bold text-blue-400">Tactical Directive</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Intelligence suggests focusing resources on regions with compounding <span className="text-white font-medium">Crime Rate</span> and declining <span className="text-white font-medium">Chargesheet Rates</span>. 
                    Monitor {selectedStateDetails.name} closely for anomalies.
                  </p>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-red-400">
                <AlertCircle className="h-6 w-6 mr-2" /> Failed to load state data.
              </div>
            )}
          </div>

        </div>
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute('/india-map')({
  component: IndiaMapComponent,
});