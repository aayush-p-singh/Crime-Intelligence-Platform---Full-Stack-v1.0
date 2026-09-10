import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Map as MapIcon,
  BarChart3,
  Network,
  MessageSquare,
  Search,
  Bell,
  Menu,
  LogOut,
  ChevronDown,
  Layers,
  Sparkles,
  Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ParticleSystem } from "./ParticleSystem";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const navItems = [
  { path: "/home", label: "Overview", icon: Layers },
  { path: "/dashboard", label: "Command Center", icon: LayoutDashboard },
  { path: "/india-map", label: "Geospatial Intelligence", icon: MapIcon },
  { path: "/state-comparison", label: "Comparative Matrix", icon: BarChart3 },
  { path: "/knowledge-graph", label: "Entity Network", icon: Network },
  { path: "/cio", label: "Intelligence Officer", icon: MessageSquare },
];

const SEARCH_PHRASES = [
  "Search intelligence...",
  "Search entities...",
  "Search jurisdictions...",
  "Search threats...",
];

function useCyclingPlaceholder(phrases: string[]) {
  const [currentText, setCurrentText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const typeSpeed = 50;
    const deleteSpeed = 30;
    const pauseTime = 3000;
    const currentPhrase = phrases[phraseIndex];

    const timer = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentText.length < currentPhrase.length) {
            setCurrentText(currentPhrase.slice(0, currentText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), pauseTime);
          }
        } else {
          if (currentText.length > 0) {
            setCurrentText(currentPhrase.slice(0, currentText.length - 1));
          } else {
            setIsDeleting(false);
            setPhraseIndex((prev) => (prev + 1) % phrases.length);
          }
        }
      },
      isDeleting ? deleteSpeed : typeSpeed,
    );

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIndex, phrases]);

  return currentText;
}

export function AppShell({ children, title, subtitle }: AppShellProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const placeholderText = useCyclingPlaceholder(SEARCH_PHRASES);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#fcfcfc] overflow-hidden selection:bg-black/10 text-[#111111] font-sans">
      <div className="noise-overlay" />

      {/* Premium Floating Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white/60 backdrop-blur-3xl border-r border-[#00000010] z-40 m-3 mr-0 rounded-2xl shadow-sm h-[calc(100vh-24px)] relative overflow-hidden">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#11111105] to-transparent pointer-events-none" />

        {/* Branding */}
        <div className="flex items-center gap-3 px-5 py-6 mt-2 relative z-10">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffffff] to-[#f4f4f4] border border-[#00000015] shadow-sm flex items-center justify-center p-1.5 z-10 relative overflow-hidden">
              <img
                src="/Crime_Intel_Logo.png"
                alt="CrimeIntel Logo"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            {/* Glowing pulse behind logo */}
            <div className="absolute inset-0 bg-[#FF9933] rounded-xl blur-xl opacity-20 radar-ping" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-[#111] tracking-tight leading-tight">
              CrimeIntel
            </h1>
            <p className="text-[10px] font-mono tracking-wider text-[#666] uppercase mt-0.5">
              Govt. Platform
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar relative z-10">
          <div className="text-[10px] font-semibold text-[#888] uppercase tracking-wider mb-2 ml-2 mt-4">
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
                    ? "bg-[#111111] text-white shadow-md shadow-black/10"
                    : "text-[#555555] hover:text-[#111] hover:bg-[#00000008] font-medium"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-xl border border-white/20 pointer-events-none"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon
                  className={`h-4 w-4 mr-3 stroke-[1.5] transition-all duration-300 ${
                    isActive
                      ? "text-white"
                      : "text-[#777] group-hover:text-[#111] group-hover:scale-110"
                  }`}
                />
                <span className="tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer System Status */}
        <div className="p-4 mb-2 relative z-10">
          <div className="px-3 py-3 rounded-xl bg-[#00000005] border border-[#00000008] flex items-center gap-3">
            <div className="relative flex items-center justify-center w-2.5 h-2.5">
              <span
                className="absolute w-2.5 h-2.5 rounded-full bg-[#138808] opacity-60 animate-ping"
                style={{ animationDuration: "3s" }}
              />
              <span className="relative w-1.5 h-1.5 rounded-full bg-[#138808]" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-medium text-[#111] tracking-tight">
                SYSTEM ONLINE
              </p>
              <p className="text-[9px] text-[#777] font-mono mt-0.5">LATENCY: 12ms</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Nav Overlay (Skipping detailed update for brevity, preserving structure) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative flex-1 max-w-xs w-full bg-white/90 backdrop-blur-2xl border-r border-[#E9E9E9] flex flex-col p-4 shadow-2xl"
            >
              {/* Similar items to desktop */}
              <div className="flex items-center justify-between mb-8 px-2 mt-2">
                <span className="font-bold text-lg">CrimeIntel</span>
              </div>
              <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-[#333] hover:bg-[#f0f0f0]"
                  >
                    <item.icon className="h-4 w-4 mr-3" /> {item.label}
                  </Link>
                ))}
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
        <header className="h-20 shrink-0 flex items-center justify-between px-6 md:px-10 z-30 mt-2 mx-3 lg:mx-6 rounded-2xl glass-nav relative">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#444] hover:text-[#111] hover:bg-black/5 transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5 stroke-[1.5]" />
            </button>
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-[18px] font-bold text-[#111] tracking-tight">{title}</h2>
              {subtitle && (
                <p className="text-[12px] text-[#666] font-medium tracking-wide mt-0.5">
                  {subtitle}
                </p>
              )}
            </motion.div>
          </div>

          <div className="flex items-center gap-4">
            {/* Command Palette Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888] stroke-[1.5]" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder={isSearchFocused ? "Filter intel..." : placeholderText}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="bg-black/5 border border-black/5 rounded-full py-2 pl-9 pr-14 text-[13px] font-medium text-[#111] placeholder:text-[#888] outline-none transition-all duration-300 focus:bg-white focus:border-[#111] focus:shadow-glass hover:bg-white focus:w-72 w-60"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                <div className="flex items-center gap-0.5 bg-black/5 px-1.5 py-0.5 rounded text-[#666]">
                  <Command className="h-3 w-3" />
                  <span className="text-[10px] font-bold">K</span>
                </div>
              </div>
            </div>

            <Link
              to="/cio"
              className="hidden sm:inline-flex btn-premium-glass items-center gap-2 group cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#111] stroke-[1.5] group-hover:rotate-12 transition-transform duration-300" />
              <span>Ask Analyst</span>
            </Link>

            <button
              className="btn-premium-glass p-2.5 rounded-full relative group"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 stroke-[1.5] group-hover:scale-110 transition-transform" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#FF9933] border-2 border-white" />
            </button>

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="btn-premium-glass p-1 pl-1 pr-3 flex items-center gap-2 rounded-full cursor-pointer hover:border-black/20"
              >
                <div className="w-8 h-8 rounded-full bg-[#111] text-white flex items-center justify-center text-xs font-bold shadow-inner">
                  A
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-[#888] stroke-[2]" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-56 glass-panel rounded-2xl shadow-glass-hover p-2 z-50 border border-black/10"
                  >
                    <div className="px-3 py-3 border-b border-black/5 mb-1">
                      <p className="text-[13px] font-bold text-[#111]">Analyst-01</p>
                      <p className="text-[11px] font-mono text-[#666] mt-0.5">ID: 8829-DELHI-HQ</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate({ to: "/login" });
                      }}
                      className="w-full flex items-center px-3 py-2.5 text-[13px] text-[#7F1D1D] hover:bg-[#7F1D1D10] rounded-xl transition-colors cursor-pointer font-semibold"
                    >
                      <LogOut className="h-4 w-4 mr-2.5 stroke-[2]" />
                      Terminate Session
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="flex-1 overflow-auto custom-scrollbar relative z-20 px-3 lg:px-6 pb-6 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="h-full w-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
