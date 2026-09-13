import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Map as MapIcon,
  BarChart3,
  Network,
  MessageSquare,
  Info,
  Bell,
  Menu,
  LogOut,
  ChevronDown,
  Layers,
  Sparkles,
  Clock,
  X,
  Shield,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ParticleSystem } from "./ParticleSystem";
import { useAuth } from "../hooks/useAuth";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const navItems = [
  { path: "/home", label: "Overview", icon: Layers, code: "OV" },
  { path: "/dashboard", label: "Command Center", icon: LayoutDashboard, code: "CC" },
  { path: "/india-map", label: "Geospatial Intel", icon: MapIcon, code: "GI" },
  { path: "/state-comparison", label: "Comparative Matrix", icon: BarChart3, code: "CM" },
  { path: "/knowledge-graph", label: "Entity Network", icon: Network, code: "EN" },
  { path: "/cio", label: "Intelligence Officer", icon: MessageSquare, code: "IO" },
];

function useCurrentTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return time;
}

export function AppShell({ children, title, subtitle }: AppShellProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const now = useCurrentTime();
  const { user, session, isLoading, signInWithGoogle, signOut } = useAuth();
  
  const [isLoginPromptDismissed, setIsLoginPromptDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoginPromptDismissed(sessionStorage.getItem('loginPromptDismissed') === 'true');
    }
  }, []);
  
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Derive user display info from Supabase user metadata
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Operator";
  const displayEmail = user?.email || "";
  const userInitial = (displayName[0] || "O").toUpperCase();

  const formattedDate = now
    .toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();

  const formattedTime = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDismissLoginPrompt = () => {
    setIsLoginPromptDismissed(true);
    sessionStorage.setItem('loginPromptDismissed', 'true');
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#fafafa] overflow-hidden selection:bg-black/10 text-[#111111] font-sans">
      <div className="noise-overlay" />

      {/* Premium Floating Sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-white/70 backdrop-blur-2xl border-r border-black/[0.06] z-40 m-3 mr-0 rounded-2xl shadow-sm h-[calc(100vh-24px)] relative overflow-hidden">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/[0.02] to-transparent pointer-events-none" />

        {/* Classification Banner */}
        <div className="px-5 pt-3">
          <div className="text-[8px] font-mono font-semibold text-[#999] tracking-[0.2em] uppercase text-center py-1.5 border border-dashed border-black/[0.08] rounded bg-black/[0.02]">
            RESTRICTED // AUTHORIZED ACCESS
          </div>
        </div>

        {/* Branding */}
        <div className="flex items-center gap-3 px-5 py-5 relative z-10">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-[#f4f4f4] border border-black/[0.08] shadow-sm flex items-center justify-center p-1.5 z-10 relative overflow-hidden">
              <img
                src="/Crime_Intel_Logo.png"
                alt="CrimeIntel Logo"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            {/* Glowing pulse behind logo */}
            <div className="absolute inset-0 bg-[#FF9933] rounded-xl blur-xl opacity-15 radar-ping" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-[#111] tracking-tight leading-tight">
              CrimeIntel
            </h1>
            <p className="text-[9px] font-mono tracking-[0.15em] text-[#888] uppercase mt-0.5">
              Intelligence Platform
            </p>
          </div>
        </div>

        {/* Saffron accent line */}
        <div className="mx-5 gradient-saffron opacity-40" />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto custom-scrollbar relative z-10">
          <div className="text-[9px] font-semibold text-[#999] uppercase tracking-[0.15em] mb-2 ml-3 mt-2">
            Modules
          </div>
          {navItems.map((item) => {
            const isActive =
              currentPath === item.path || (item.path === "/home" && currentPath === "/");
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-3 py-2.5 text-[13px] rounded-xl transition-all duration-300 relative cursor-pointer ${
                  isActive
                    ? "bg-[#111] text-white shadow-md shadow-black/10"
                    : "text-[#555] hover:text-[#111] hover:bg-black/[0.04] font-medium"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 bg-[#111] rounded-xl shadow-md shadow-black/10"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <item.icon
                  className={`h-4 w-4 mr-3 stroke-[1.5] transition-all duration-300 ${
                    isActive
                      ? "text-white"
                      : "text-[#888] group-hover:text-[#111] group-hover:scale-110"
                  }`}
                />
                <span className="tracking-wide flex-1">{item.label}</span>
                <span
                  className={`text-[9px] font-mono font-bold tracking-wider transition-opacity duration-300 ${
                    isActive ? "text-white/50" : "text-[#ccc] opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {item.code}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer System Status */}
        <div className="p-4 mb-1 relative z-10">
          <div className="px-3 py-3 rounded-xl bg-black/[0.02] border border-black/[0.05] flex items-center gap-3">
            <div className="relative flex items-center justify-center w-3 h-3">
              {/* Concentric rings */}
              <span
                className="absolute w-3 h-3 rounded-full border border-[#138808]/30"
                style={{ animation: "radar-ping 3s ease-out infinite" }}
              />
              <span
                className="absolute w-2 h-2 rounded-full border border-[#138808]/50"
                style={{ animation: "radar-ping 3s ease-out 0.5s infinite" }}
              />
              <span className="relative w-1.5 h-1.5 rounded-full bg-[#138808]" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-medium text-[#111] tracking-tight">
                SYSTEM ONLINE
              </p>
              <p className="text-[9px] text-[#999] font-mono mt-0.5">ALL SUBSYSTEMS NOMINAL</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative flex-1 max-w-xs w-full bg-white/95 backdrop-blur-2xl border-r border-black/[0.06] flex flex-col p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6 px-2 mt-2">
                <span className="font-bold text-lg text-[#111]">CrimeIntel</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
                >
                  <X className="h-5 w-5 text-[#666]" />
                </button>
              </div>
              <nav className="flex-1 space-y-0.5">
                {navItems.map((item) => {
                  const isActive =
                    currentPath === item.path || (item.path === "/home" && currentPath === "/");
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                        isActive ? "bg-[#111] text-white" : "text-[#444] hover:bg-black/[0.04]"
                      }`}
                    >
                      <item.icon className="h-4 w-4 mr-3" /> {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-transparent z-10 w-full h-full">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none z-[-1] ambient-gradient" />
        <ParticleSystem />

        {/* Top Header */}
        <header className="h-16 shrink-0 flex items-center justify-between px-5 md:px-8 z-30 mt-3 mx-3 lg:mx-5 rounded-2xl relative">
          {/* Background and Scanline with overflow hidden, so dropdown can escape the header */}
          <div className="absolute inset-0 rounded-2xl glass-nav overflow-hidden z-[-1]">
            <div className="scanline" />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#444] hover:text-[#111] hover:bg-black/5 transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5 stroke-[1.5]" />
            </button>
            <motion.div
              key={title}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-[16px] font-bold text-[#111] tracking-tight">{title}</h2>
              {subtitle && (
                <p className="text-[11px] text-[#888] font-medium tracking-wide mt-0.5">
                  {subtitle}
                </p>
              )}
            </motion.div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Timestamp */}
            <div className="hidden xl:flex items-center gap-2 text-[10px] font-mono text-[#999] tracking-wider">
              <Clock className="h-3 w-3" />
              <span>{formattedDate}</span>
              <span className="text-[#ccc]">|</span>
              <span>{formattedTime} IST</span>
            </div>

            <div className="hidden xl:block w-px h-5 bg-black/[0.06]" />

            {/* About CrimeIntel */}
            <Link
              to="/about"
              className="hidden md:flex items-center gap-2 bg-black/[0.03] border border-black/[0.05] rounded-lg py-1.5 px-3 cursor-pointer transition-all duration-300 hover:bg-white/80 hover:border-black/[0.1] group w-52 no-underline"
              aria-label="About CrimeIntel"
            >
              <Info className="h-3.5 w-3.5 text-[#999] stroke-[1.5] shrink-0 group-hover:text-[#666] transition-colors" />
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[9px] font-mono font-semibold text-[#888] tracking-[0.1em] uppercase leading-tight">
                  ABOUT CRIMEINTEL
                </span>
                <span className="text-[10px] text-[#aaa] font-medium leading-tight truncate w-full">
                  Decision-ready intelligence
                </span>
              </div>
            </Link>

            <Link
              to="/cio"
              className="hidden sm:inline-flex btn-premium-glass items-center gap-2 group cursor-pointer text-[12px] py-1.5 px-3"
            >
              <Sparkles className="h-3 w-3 text-[#7c3aed] stroke-[1.5] group-hover:rotate-12 transition-transform duration-300" />
              <span>Ask Analyst</span>
            </Link>

            <button
              className="btn-premium-glass p-2 rounded-full relative group"
              aria-label="Notifications"
            >
              <Bell className="h-3.5 w-3.5 stroke-[1.5] group-hover:scale-110 transition-transform" />
              <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-[#FF9933] text-white text-[8px] font-bold border-2 border-white shadow-sm">
                3
              </span>
            </button>

            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsProfileOpen(false);
                }}
                className="btn-premium-glass p-1 pl-1 pr-2.5 flex items-center gap-1.5 rounded-full cursor-pointer hover:border-black/15"
              >
                <div className="w-7 h-7 rounded-full bg-[#111] text-white flex items-center justify-center text-[10px] font-bold shadow-inner overflow-hidden">
                  {user?.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt={displayName} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    userInitial
                  )}
                </div>
                <ChevronDown
                  className={`h-3 w-3 text-[#999] stroke-[2] transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    key="profile-dropdown"
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg p-1.5 z-50 border border-black/[0.08]"
                  >
                    <div className="px-3 py-2.5 border-b border-black/[0.05] mb-1">
                      <p className="text-[12px] font-bold text-[#111] truncate">{displayName}</p>
                      <p className="text-[10px] font-mono text-[#888] mt-0.5 truncate">
                        {displayEmail}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        setIsProfileOpen(false);
                        if (session) {
                          await signOut();
                          navigate({ to: "/login" });
                        } else {
                          navigate({ to: "/login" });
                        }
                      }}
                      className={`w-full flex items-center px-3 py-2 text-[12px] rounded-lg transition-colors cursor-pointer font-semibold ${
                        session 
                          ? "text-[#7F1D1D] hover:bg-red-50" 
                          : "text-[#111] hover:bg-black/5"
                      }`}
                    >
                      {session ? (
                         <LogOut className="h-3.5 w-3.5 mr-2 stroke-[2]" />
                      ) : (
                         <Shield className="h-3.5 w-3.5 mr-2 stroke-[2]" />
                      )}
                      {session ? "Sign out" : "Sign in"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="flex-1 overflow-auto custom-scrollbar relative z-20 px-3 lg:px-5 pb-6 pt-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPath}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="h-full w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Login Notification (Floating) */}
        <AnimatePresence>
          {!session && !isLoading && !isLoginPromptDismissed && (
            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="fixed bottom-6 right-6 z-50 w-[340px] bg-white/80 backdrop-blur-2xl border border-black/[0.08] rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF9933] to-transparent opacity-50" />
              <div className="p-5 relative">
                <button
                  type="button"
                  onClick={handleDismissLoginPrompt}
                  className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/5 text-[#888] hover:text-[#111] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-black/[0.04] rounded-xl">
                    <Shield className="h-5 w-5 text-[#111]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111] leading-tight">SECURE ACCESS</h3>
                    <p className="text-[10px] font-mono tracking-widest text-[#888] uppercase">Session Required</p>
                  </div>
                </div>
                
                <p className="text-xs text-[#555] mb-4 leading-relaxed">
                  Sign in with Google to establish your CrimeIntel session and access restricted systems.
                </p>
                
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="w-full py-2.5 rounded-xl bg-white border border-black/[0.1] hover:bg-black/[0.02] hover:border-black/[0.15] active:scale-[0.98] disabled:opacity-50 text-[#111] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {isLoggingIn ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#666]" />
                  ) : (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  {isLoggingIn ? "Authenticating..." : "Continue with Google"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
