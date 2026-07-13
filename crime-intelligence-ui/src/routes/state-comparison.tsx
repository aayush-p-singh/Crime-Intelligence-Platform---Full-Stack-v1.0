import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '../components/AppShell';
import { api } from '../lib/api';
import { 
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, ResponsiveContainer, XAxis, 
  YAxis, Tooltip, Legend, CartesianGrid 
} from 'recharts';
import { Scale, Activity, Users, ShieldAlert, Crosshair, AlertCircle, Loader2 } from 'lucide-react';

// --- Theme Constants ---
const COLORS = {
  state1: '#3b82f6', // blue-500
  state2: '#8b5cf6', // violet-500
  text: '#cbd5e1',
  grid: '#334155'
};

// --- Reusable Component ---
function ComparisonCard({ label, value1, value2, prefix = "", suffix = "" }: { label: string, value1: number, value2: number, prefix?: string, suffix?: string }) {
  const diff = value1 - value2;
  const is1Higher = value1 > value2;
  const is2Higher = value2 > value1;

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col justify-between">
      <h4 className="text-sm font-semibold text-slate-400 mb-4">{label}</h4>
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className={`text-2xl font-bold ${is1Higher ? 'text-blue-400' : 'text-slate-300'}`}>
            {prefix}{value1.toLocaleString()}{suffix}
          </span>
          <span className="text-xs text-slate-500">State 1</span>
        </div>
        
        {diff !== 0 && (
          <div className="flex flex-col items-center justify-center px-4">
            <span className="text-xs font-mono text-slate-400">Δ {Math.abs(diff).toLocaleString()}{suffix}</span>
            <div className="h-px w-12 bg-slate-600 my-1"></div>
          </div>
        )}

        <div className="flex flex-col text-right">
          <span className={`text-2xl font-bold ${is2Higher ? 'text-purple-400' : 'text-slate-300'}`}>
            {prefix}{value2.toLocaleString()}{suffix}
          </span>
          <span className="text-xs text-slate-500">State 2</span>
        </div>
      </div>
    </div>
  );
}

// --- Main Route Component ---
function StateComparisonComponent() {
  const [state1, setState1] = useState<string>('');
  const [state2, setState2] = useState<string>('');

  // Fetch the list of available states
  const { data: stateList, isLoading: isListLoading } = useQuery({
    queryKey: ['states-list'],
    queryFn: api.getStates,
  });

  // Fetch comparison data if both states are selected
  const canCompare = Boolean(state1 && state2 && state1 !== state2);
  
  const { data: compData, isLoading: isCompLoading, error: compError } = useQuery({
    queryKey: ['compare', state1, state2],
    queryFn: () => api.compareStates(state1, state2),
    enabled: canCompare,
  });

  // Safely check if we have exactly 2 records returned from the array
  const hasValidData = Array.isArray(compData) && compData.length === 2;

  // Transform data for Recharts
  const barChartData = hasValidData ? [
    { name: 'Crime Rate', [state1]: compData[0].crimeRate, [state2]: compData[1].crimeRate },
    { name: 'Chargesheet %', [state1]: compData[0].chargesheetRate, [state2]: compData[1].chargesheetRate }
  ] : [];

  const radarData = hasValidData ? [
    { metric: 'Risk Score (Norm)', [state1]: compData[0].crimeRate / 10, [state2]: compData[1].crimeRate / 10 },
    { metric: 'Women Crime (Norm)', [state1]: compData[0].womenCrime / 1000, [state2]: compData[1].womenCrime / 1000 },
    { metric: 'Chargesheet Rate', [state1]: compData[0].chargesheetRate, [state2]: compData[1].chargesheetRate },
  ] : [];

  return (
    <AppShell title="State Comparison" subtitle="Cross-reference regional intelligence metrics.">
      <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
        
        {/* Selection Bar */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-blue-400 mb-2">Primary Target (State 1)</label>
            <select 
              className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={state1}
              onChange={(e) => setState1(e.target.value)}
              disabled={isListLoading}
            >
              <option value="">Select State...</option>
              {stateList?.map(s => <option key={s} value={s} disabled={s === state2}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-center pt-6">
            <div className="p-3 bg-white/5 rounded-full border border-white/10">
              <Scale className="h-6 w-6 text-slate-400" />
            </div>
          </div>

          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-purple-400 mb-2">Secondary Target (State 2)</label>
            <select 
              className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
              value={state2}
              onChange={(e) => setState2(e.target.value)}
              disabled={isListLoading}
            >
              <option value="">Select State...</option>
              {stateList?.map(s => <option key={s} value={s} disabled={s === state1}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Dynamic Content Area */}
        {!canCompare ? (
           <div className="flex flex-col items-center justify-center py-24 opacity-50 bg-white/5 rounded-xl border border-white/5 border-dashed">
             <Crosshair className="h-16 w-16 text-slate-400 mb-4" />
             <h3 className="text-xl font-bold text-white mb-2">Awaiting Parameters</h3>
             <p className="text-sm text-slate-400">Select two distinct states above to initiate comparison protocols.</p>
           </div>
        ) : isCompLoading ? (
           <div className="flex flex-col items-center justify-center py-24">
             <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
             <p className="text-slate-300">Correlating intelligence records...</p>
           </div>
        ) : compError ? (
           <div className="flex flex-col items-center justify-center py-24 text-red-400">
             <AlertCircle className="h-10 w-10 mb-4" />
             <p>Error retrieving comparison data.</p>
           </div>
        ) : hasValidData ? (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* KPI Matchups */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ComparisonCard label="Total Incidents" value1={compData[0].totalCrime} value2={compData[1].totalCrime} />
              <ComparisonCard label="Crime Rate" value1={compData[0].crimeRate} value2={compData[1].crimeRate} />
              <ComparisonCard label="Crimes Against Women" value1={compData[0].womenCrime} value2={compData[1].womenCrime} />
              <ComparisonCard label="Chargesheet Rate" value1={compData[0].chargesheetRate} value2={compData[1].chargesheetRate} suffix="%" />
            </div>

            {/* AI Risk Assessment Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 flex justify-between items-center">
                <div>
                  <h4 className="text-blue-400 font-bold mb-1">{compData[0].name} AI Threat Level</h4>
                  <p className="text-sm text-slate-400">Predicted by Random Forest Engine</p>
                </div>
                <span className="px-4 py-2 rounded font-bold uppercase tracking-wider border border-white/20 bg-white/5 text-white">
                  {compData[0].risk || 'Unknown'}
                </span>
              </div>
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 flex justify-between items-center">
                <div>
                  <h4 className="text-purple-400 font-bold mb-1">{compData[1].name} AI Threat Level</h4>
                  <p className="text-sm text-slate-400">Predicted by Random Forest Engine</p>
                </div>
                <span className="px-4 py-2 rounded font-bold uppercase tracking-wider border border-white/20 bg-white/5 text-white">
                  {compData[1].risk || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Comparative Bar Chart */}
              <div className="bg-slate-900/50 backdrop-blur border border-white/10 rounded-xl p-6 h-[400px] flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-6">Metric Analysis</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                    <XAxis dataKey="name" stroke={COLORS.text} />
                    <YAxis stroke={COLORS.text} />
                    <Tooltip cursor={{ fill: '#334155', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey={state1} fill={COLORS.state1} radius={[4, 4, 0, 0]} />
                    <Bar dataKey={state2} fill={COLORS.state2} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Multi-vector Radar Chart */}
              <div className="bg-slate-900/50 backdrop-blur border border-white/10 rounded-xl p-6 h-[400px] flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-2">Threat Vector Topology</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke={COLORS.grid} />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: COLORS.text, fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="transparent" tick={false} />
                    <Radar name={state1} dataKey={state1} stroke={COLORS.state1} fill={COLORS.state1} fillOpacity={0.5} />
                    <Radar name={state2} dataKey={state2} stroke={COLORS.state2} fill={COLORS.state2} fillOpacity={0.5} />
                    <Legend />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

            </div>
          </div>
        ) : null}

      </div>
    </AppShell>
  );
}

export const Route = createFileRoute('/state-comparison')({
  component: StateComparisonComponent,
});