import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowRight, ShieldCheck, Database, BrainCircuit, Activity, 
  Map, BarChart2, Network, MessageSquare, LayoutDashboard
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { api } from '../lib/api';

// --- Reusable Components ---

function StatusBadge({ label, isOnline, icon: Icon }: { label: string; isOnline: boolean; icon: any }) {
  return (
    <div className="flex items-center space-x-2 bg-slate-900/50 backdrop-blur border border-white/5 rounded-full px-4 py-2">
      <Icon className={`h-4 w-4 ${isOnline ? 'text-emerald-400' : 'text-red-400'}`} />
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <div className="flex items-center ml-2">
        <span className="relative flex h-2 w-2">
          {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
        </span>
      </div>
    </div>
  );
}

function ModuleCard({ title, description, icon: Icon, to }: { title: string; description: string; icon: any; to: string }) {
  return (
    <Link to={to} className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg hover:bg-white/10 transition-all overflow-hidden flex flex-col justify-between h-48">
      <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
        <Icon className="h-32 w-32 text-blue-500" />
      </div>
      <div>
        <div className="p-3 bg-blue-500/20 rounded-lg w-fit mb-4">
          <Icon className="h-6 w-6 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <div className="flex items-center text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
        Access Module <ArrowRight className="ml-2 h-4 w-4" />
      </div>
    </Link>
  );
}

// --- Main Page Component ---

function HomeComponent() {
  // Ping the KPI endpoint lightly to check if backend/DB is alive
  const { isSuccess } = useQuery({
    queryKey: ['system-ping'],
    queryFn: api.getDashboardKPIs,
    retry: 1,
    staleTime: 60000,
  });

  return (
    <AppShell title="Home" subtitle="Crime Intelligence Platform Overview">
      <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-900/20 z-0"></div>
          <div className="absolute top-0 right-0 p-12 opacity-20 pointer-events-none z-0">
            <ShieldCheck className="w-64 h-64 text-blue-500" />
          </div>
          
          <div className="relative z-10 p-8 md:p-12 flex flex-col items-start w-full md:w-2/3">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full px-3 py-1 mb-6 text-xs font-semibold tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>AI Crime Intelligence</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4 tracking-tight">
              National Crime Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Platform</span>
            </h1>
            
            <p className="text-lg text-slate-300 mb-8 max-w-xl">
              Unified intelligence dashboard integrating geospatial analytics, predictive modeling, and knowledge graphs for law enforcement agencies.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/dashboard" className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/30 transition-all flex items-center">
                Launch Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link to="/cio" className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium backdrop-blur-sm transition-all flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" /> Ask AI Officer
              </Link>
            </div>
          </div>
        </div>

        {/* System Status Banner */}
        <div className="flex flex-wrap gap-4 py-2">
          <StatusBadge label="Core System" isOnline={isSuccess} icon={Activity} />
          <StatusBadge label="Neo4j Graph Database" isOnline={isSuccess} icon={Database} />
          <StatusBadge label="Predictive ML Engine" isOnline={isSuccess} icon={BrainCircuit} />
          <StatusBadge label="Sarvam AI Network" isOnline={true} icon={Network} />
        </div>

        {/* Modules Grid */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Intelligence Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModuleCard 
              to="/dashboard"
              title="Dashboard" 
              description="Real-time KPI monitoring, crime trends, and risk distribution analysis."
              icon={LayoutDashboard}
            />
            <ModuleCard 
              to="/india-map"
              title="Geospatial Map" 
              description="Interactive state-level risk mapping and crime volume visualization."
              icon={Map}
            />
            <ModuleCard 
              to="/state-comparison"
              title="State Comparison" 
              description="Side-by-side analytical comparison of regional crime metrics."
              icon={BarChart2}
            />
            <ModuleCard 
              to="/knowledge-graph"
              title="Knowledge Graph" 
              description="Explore entity relationships, networks, and interconnected crime data."
              icon={Network}
            />
            <ModuleCard 
              to="/cio"
              title="AI Intelligence Officer" 
              description="Generative AI assistant powered by Sarvam for dynamic intelligence reporting."
              icon={MessageSquare}
            />
          </div>
        </div>

      </div>
    </AppShell>
  );
}

export const Route = createFileRoute('/home')({
  component: HomeComponent,
});