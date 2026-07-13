import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Map as MapIcon, BarChart3, Network, 
  MessageSquare, Search, Bell, Sparkles, User, ChevronDown, LogOut, Shield
} from 'lucide-react';

export function AppShell({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle?: string }) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  
  // State for the Admin Profile Dropdown
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Main Sidebar Navigation Links
  const navItems = [
    { path: '/', label: 'Home', icon: Shield },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/india-map', label: 'India Map', icon: MapIcon },
    { path: '/state-comparison', label: 'State Comparison', icon: BarChart3 },
    { path: '/cio', label: 'Intelligence Officer', icon: MessageSquare },
    { path: '/knowledge-graph', label: 'Knowledge Graph', icon: Network },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-300 flex overflow-hidden font-sans select-none">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d1326] border-r border-white/5 flex flex-col z-20 shadow-2xl">
        <div className="h-16 flex items-center px-6 border-b border-white/5 bg-[#0a0f1c]">
          <Shield className="h-6 w-6 text-blue-500 mr-3" />
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase">Crime Intel</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Platform</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <item.icon className={`h-4 w-4 mr-3 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/5">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2"></div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">AI Engine Active</span>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0f1c] to-[#0a0f1c]">
        
        {/* Header / Topbar */}
        <header className="h-16 bg-[#0d1326]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 z-10">
          <div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>

          {/* Interactive Topbar Actions */}
          <div className="flex items-center space-x-4">
            
            {/* 1. Interactive Search Bar */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search database..." 
                className="bg-slate-900 border border-white/10 rounded-full py-1.5 pl-9 pr-10 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none w-48 transition-all duration-300 focus:w-64 shadow-inner"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1 pointer-events-none">
                <kbd className="bg-white/10 border border-white/20 text-slate-400 rounded px-1.5 text-[10px] font-mono">⌘K</kbd>
              </div>
            </div>

            {/* Notifications */}
            <button 
              className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors outline-none focus:ring-2 focus:ring-blue-500"
              title="System Alerts"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-pink-500 border-2 border-[#0d1326]"></span>
            </button>

            {/* 2. AI Assist Quick Route */}
            <button 
              onClick={() => navigate({ to: '/cio' })}
              className="flex items-center px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-full text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              title="Open Intelligence Officer"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              AI Assist
            </button>

            {/* 3. Admin Profile & Logout Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-1.5 pr-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              >
                <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-white leading-none">Admin</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-0.5">Director</p>
                </div>
                <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[#0d1326] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-white/5 mb-1">
                    <p className="text-sm font-bold text-white">System Admin</p>
                    <p className="text-xs text-slate-400 font-mono mt-1">Clearance: Level 5</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate({ to: '/login' });
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect Terminal
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Page Content Viewport */}
        <div className="flex-1 overflow-auto relative custom-scrollbar">
          {children}
        </div>
        
      </main>
    </div>
  );
}