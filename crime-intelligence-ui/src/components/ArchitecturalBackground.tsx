import React from "react";
import { INDIA_OUTLINE_PATH } from "./indiaOutlinePath";
import { motion } from "framer-motion";

export function ArchitecturalBackground({
  variant = "hero",
}: {
  variant?: "hero" | "dashboard" | "network" | "analyst" | "command";
}) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dynamic gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(255,153,51,0.03)_0%,transparent_70%)] translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(19,136,8,0.02)_0%,transparent_70%)] -translate-x-1/3 translate-y-1/3" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 blueprint-grid-premium opacity-40" />

      {/* Crosshairs & Scanning Elements */}
      <div className="absolute top-8 left-8 w-4 h-4 border-t border-l border-black/20" />
      <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-black/20" />
      <div className="absolute bottom-8 left-8 w-4 h-4 border-b border-l border-black/20" />
      <div className="absolute bottom-8 right-8 w-4 h-4 border-b border-r border-black/20" />

      {/* India Map Outline */}
      {variant === "hero" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none"
        >
          <svg viewBox="0 0 1000 1000" className="w-[120%] h-[120%] max-w-none">
            <path
              d={INDIA_OUTLINE_PATH}
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              className="drop-shadow-lg"
            />
            <path
              d={INDIA_OUTLINE_PATH}
              fill="none"
              stroke="#000000"
              strokeWidth="0.5"
              transform="translate(4, 4)"
              opacity="0.5"
            />
          </svg>
        </motion.div>
      )}

      {/* Network Nodes */}
      {variant === "network" && (
        <div className="absolute inset-0 opacity-[0.05]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="50%"
              cy="50%"
              r="200"
              stroke="#000"
              strokeWidth="1"
              fill="none"
              strokeDasharray="4 8"
            />
            <circle
              cx="50%"
              cy="50%"
              r="350"
              stroke="#000"
              strokeWidth="1"
              fill="none"
              strokeDasharray="2 6"
            />
            <line
              x1="0"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke="#000"
              strokeWidth="1"
              strokeDasharray="2 10"
            />
            <line
              x1="50%"
              y1="0"
              x2="50%"
              y2="100%"
              stroke="#000"
              strokeWidth="1"
              strokeDasharray="2 10"
            />
          </svg>
        </div>
      )}

      {/* Analyst Tech Markings */}
      {variant === "analyst" && (
        <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-20">
          <div className="text-[8px] font-mono tracking-[0.2em] text-[#111]">
            INTEL.MATRIX.AUTH / [CONFIDENTIAL]
          </div>
          <div className="text-[8px] font-mono tracking-[0.2em] text-[#111] text-right">
            SCAN.SEQ.3929.11
          </div>
        </div>
      )}
    </div>
  );
}
