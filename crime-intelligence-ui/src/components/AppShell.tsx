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
  Clock,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ParticleSystem } from "./ParticleSystem";

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
  const [searchVal, setSearchVal] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const placeholderText = useCyclingPlaceholder(SEARCH_PHRASES);
  const now = useCurrentTime();

  const formattedDate = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).toUpperCase();

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
                        isActive
                          ? "bg-[#111] text-white"
                          : "text-[#444] hover:bg-black/[0.04]"
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
        <header className="h-16 shrink-0 flex items-center justify-between px-5 md:px-8 z-30 mt-3 mx-3 lg:mx-5 rounded-2xl glass-nav relative overflow-hidden">
          {/* Scanline */}
          <div className="scanline" />

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

            {/* Command Palette Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#999] stroke-[1.5]" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder={isSearchFocused ? "Filter intel..." : placeholderText}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="bg-black/[0.03] border border-black/[0.05] rounded-lg py-1.5 pl-8 pr-12 text-[12px] font-medium text-[#111] placeholder:text-[#aaa] outline-none transition-all duration-300 focus:bg-white focus:border-[#111]/20 focus:shadow-sm hover:bg-white/80 focus:w-64 w-52"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                <div className="flex items-center gap-0.5 bg-black/[0.04] px-1.5 py-0.5 rounded text-[#888]">
                  <Command className="h-2.5 w-2.5" />
                  <span className="text-[9px] font-bold">K</span>
                </div>
              </div>
            </div>

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
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="btn-premium-glass p-1 pl-1 pr-2.5 flex items-center gap-1.5 rounded-full cursor-pointer hover:border-black/15"
              >
                <div className="w-7 h-7 rounded-full bg-[#111] text-white flex items-center justify-center text-[10px] font-bold shadow-inner">
                  A
                </div>
                <ChevronDown className={`h-3 w-3 text-[#999] stroke-[2] transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg p-1.5 z-50 border border-black/[0.08]"
                  >
                    <div className="px-3 py-2.5 border-b border-black/[0.05] mb-1">
                      <p className="text-[12px] font-bold text-[#111]">Analyst-01</p>
                      <p className="text-[10px] font-mono text-[#888] mt-0.5">ID: 8829-DELHI-HQ</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate({ to: "/login" });
                      }}
                      className="w-full flex items-center px-3 py-2 text-[12px] text-[#7F1D1D] hover:bg-red-50 rounded-lg transition-colors cursor-pointer font-semibold"
                    >
                      <LogOut className="h-3.5 w-3.5 mr-2 stroke-[2]" />
                      Terminate Session
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
      </main>
    </div>
  );
}
