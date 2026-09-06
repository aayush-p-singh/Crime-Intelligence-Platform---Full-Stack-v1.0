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
    <div className="min-h-screen bg-[#060606] text-white flex overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:w-64 shrink-0 bg-[#050505] border-r border-[#1e2229] flex-col z-20 shadow-lg">
        <div className="h-16 flex items-center px-6 border-b border-[#1e2229] bg-[#050505]">
          <Shield className="h-6 w-6 text-[#b6bdc9] mr-3" />
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase">Crime Intel</h1>
            <p className="text-[10px] font-bold text-[#7e8795] uppercase tracking-widest">Classified Platform</p>
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
                    ? 'bg-transparent text-white border border-transparent border-l-2 border-l-[#345e8c] shadow-none' 
                    : 'text-[#7e8795] hover:text-white hover:bg-[#1a1d23] border border-transparent'
                }`}
              >
                <item.icon className={`h-4 w-4 mr-3 ${isActive ? 'text-[#8daed1]' : 'text-[#7e8795]'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-[#1e2229]">
          <div className="bg-[#111317] border border-[#2a2e36] rounded p-3 flex items-center">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2"></div>
            <span className="text-xs font-semibold text-[#2fbf71] uppercase tracking-wider">System Active</span>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="min-w-0 flex-1 flex flex-col relative overflow-hidden bg-[#101114]">
        
        {/* Header / Topbar */}
        <header className="sticky top-0 h-16 shrink-0 bg-[#050505] border-b border-[#1e2229] flex items-center justify-between gap-4 px-4 md:px-6 z-30">
          <div>
            <h2 className="truncate text-base md:text-lg font-bold text-white">{title}</h2>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>

          {/* Interactive Topbar Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* 1. Interactive Search Bar */}
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-white transition-colors" />
              <input 
                type="text" 
                aria-label="Search database"
                placeholder="Search database..." 
                className="bg-[#111317] border border-[#2a2e36] rounded py-1.5 pl-9 pr-10 text-sm text-white focus:ring-1 focus:ring-[#345e8c] outline-none w-48 transition-all duration-300 focus:w-64"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1 pointer-events-none">
                <kbd className="bg-white/10 border border-white/20 text-slate-300 rounded px-1.5 text-[10px] font-mono">⌘K</kbd>
              </div>
            </div>

            {/* Notifications */}
            <button 
              className="relative p-2 text-[#b6bdc9] hover:text-white hover:bg-[#1a1d23] rounded transition-colors outline-none focus:ring-2 focus:ring-[#345e8c]"
              title="System Alerts"
              aria-label="System alerts"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-pink-500 border-2 border-[#0d1326]"></span>
            </button>

            {/* 2. AI Assist Quick Route */}
            <button 
              onClick={() => navigate({ to: '/cio' })}
              className="flex items-center px-2 md:px-3 py-1.5 bg-[#183a66] hover:bg-[#1a1d23] border border-[#345e8c] text-white rounded text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-[#345e8c]"
              title="Open Intelligence Officer"
            >
              <Sparkles className="h-4 w-4 md:mr-1.5" />
              <span className="hidden md:inline">AI Assist</span>
            </button>

            {/* 3. Admin Profile & Logout Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-expanded={isProfileOpen}
                aria-haspopup="menu"
                aria-label="Open administrator menu"
                className="flex items-center space-x-3 p-1.5 pr-3 bg-[#111317] hover:bg-[#1a1d23] border border-[#2a2e36] rounded transition-colors outline-none focus:ring-2 focus:ring-[#345e8c]"
              >
                <div className="h-7 w-7 rounded bg-[#1a1d23] border border-[#2a2e36] flex items-center justify-center">
                  <User className="h-4 w-4 text-[#b6bdc9]" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-white leading-none">Admin</p>
                  <p className="text-[10px] text-[#7e8795] leading-none mt-0.5">Director</p>
                </div>
                <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-[#e5e7eb] rounded-md shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-[#e5e7eb] mb-1">
                    <p className="text-sm font-bold text-[#111827]">System Admin</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">Clearance: Level 5</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate({ to: '/login' });
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
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
        <div className="min-w-0 flex-1 overflow-auto relative custom-scrollbar">
          {children}
        </div>
        
      </main>
    </div>
  );
}