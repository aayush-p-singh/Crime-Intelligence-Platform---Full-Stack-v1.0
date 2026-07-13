import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, TrendingUp, Activity, Users, AlertCircle, Loader2 } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { api } from '../lib/api';
import { AppShell } from '../components/AppShell';

// --- Theme Constants ---
const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e']; 
const CHART_THEME = {
  text: '#cbd5e1', 
  grid: '#334155', 
  bg: 'transparent'
};

// --- Reusable Components ---
function LoadingSpinner() {
  return (
    <div className="flex h-full w-full items-center justify-center min-h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center text-red-400 min-h-[200px] gap-2 p-4 text-center">
      <AlertCircle className="h-8 w-8" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

function MetricCard({ 
  title, value, icon: Icon, isLoading, error 
}: { 
  title: string; value?: string | number; icon: any; isLoading: boolean; error: any 
}) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg flex flex-col justify-between transition-all hover:bg-white/10">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Icon className="h-5 w-5 text-blue-400" />
        </div>
      </div>
      <div className="mt-4">
        {isLoading ? (
          <div className="h-8 w-24 bg-white/10 animate-pulse rounded"></div>
        ) : error ? (
          <span className="text-sm text-red-400">Failed</span>
        ) : (
          <span className="text-3xl font-bold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
        )}
      </div>
    </div>
  );
}

function ChartCard({ 
  title, children, isLoading, error 
}: { 
  title: string; children: React.ReactNode; isLoading: boolean; error: any 
}) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg h-[400px] flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      <div className="flex-1 w-full h-full">
        {isLoading ? <LoadingSpinner /> : error ? <ErrorState message={error.message || "Failed to load chart data"} /> : children}
      </div>
    </div>
  );
}

// --- Main Page Component ---
function DashboardComponent() {
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useQuery({ queryKey: ['dashboard-kpis'], queryFn: api.getDashboardKPIs });
  const { data: crimeRate, isLoading: crLoading, error: crError } = useQuery({ queryKey: ['dashboard-crime-rate'], queryFn: api.getCrimeRateChart });
  const { data: trendData, isLoading: trendLoading, error: trendError } = useQuery({ queryKey: ['dashboard-trend'], queryFn: api.getTrend });
  const { data: riskDist, isLoading: riskLoading, error: riskError } = useQuery({ queryKey: ['dashboard-risk-distribution'], queryFn: api.getRiskDistribution });
  const { data: womenCrime, isLoading: wcLoading, error: wcError } = useQuery({ queryKey: ['dashboard-women-crime'], queryFn: api.getWomenCrimeChart });

  return (
    <AppShell title="Dashboard" subtitle="Real-time crime analytics and predictive monitoring.">
      <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <MetricCard title="Total Crime" value={kpis?.totalCrime} icon={ShieldAlert} isLoading={kpisLoading} error={kpisError} />
          <MetricCard title="Average Crime Rate" value={kpis?.averageCrimeRate} icon={TrendingUp} isLoading={kpisLoading} error={kpisError} />
          <MetricCard title="Avg Chargesheet Rate" value={kpis?.averageChargesheetRate ? `${kpis.averageChargesheetRate}%` : undefined} icon={Activity} isLoading={kpisLoading} error={kpisError} />
          <MetricCard title="Total Women Crime" value={kpis?.totalWomenCrime} icon={Users} isLoading={kpisLoading} error={kpisError} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Overall Crime Trend" isLoading={trendLoading} error={trendError}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
                <XAxis dataKey="name" stroke={CHART_THEME.text} tick={{ fill: CHART_THEME.text }} />
                <YAxis stroke={CHART_THEME.text} tick={{ fill: CHART_THEME.text }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} itemStyle={{ color: '#60a5fa' }} />
                <Line type="monotone" dataKey="value" stroke={COLORS[0]} strokeWidth={3} dot={{ r: 4, fill: COLORS[0] }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top States by Crime Rate" isLoading={crLoading} error={crError}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crimeRate} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} horizontal={false} />
                <XAxis type="number" stroke={CHART_THEME.text} />
                <YAxis dataKey="name" type="category" stroke={CHART_THEME.text} width={80} />
                <Tooltip cursor={{ fill: '#334155', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                <Bar dataKey="value" fill={COLORS[1]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="National Risk Distribution" isLoading={riskLoading} error={riskError}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDist} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                  {riskDist?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: CHART_THEME.text }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Women Crime Volumes" isLoading={wcLoading} error={wcError}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={womenCrime}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
                <XAxis dataKey="name" stroke={CHART_THEME.text} />
                <YAxis stroke={CHART_THEME.text} />
                <Tooltip cursor={{ fill: '#334155', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                <Bar dataKey="value" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

      </div>
    </AppShell>
  );
}

export const Route = createFileRoute('/dashboard')({
  component: DashboardComponent,
});