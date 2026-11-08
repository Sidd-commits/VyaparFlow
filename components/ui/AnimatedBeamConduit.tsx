'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBeamConduitProps {
  fromText?: string;
  toText?: string;
  viaText?: string;
  className?: string;
}

export default function AnimatedBeamConduit({
  fromText = 'Origin Hub (JNPT / Mundra)',
  toText = 'Destination Port (Jebel Ali / Rotterdam)',
  viaText = 'Customs LEO & EDI Gateway',
  className = '',
}: AnimatedBeamConduitProps) {
  return (
    <div className={`relative w-full overflow-hidden p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-lg ${className}`}>
      {/* Background ambient grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#EA580C_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 py-2">
        {/* Node 1: Origin */}
        <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-xl">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Export Node</span>
            <span className="text-xs font-semibold text-slate-100">{fromText}</span>
          </div>
        </div>

        {/* Dynamic Animated Beam SVG */}
        <div className="flex-1 w-full max-w-xs md:max-w-sm px-2 relative flex items-center justify-center">
          <svg className="w-full h-8 overflow-visible" viewBox="0 0 200 24" fill="none">
            {/* Base pathway track */}
            <path
              d="M 10 12 L 190 12"
              stroke="#334155"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {/* Glowing Traveling Beam */}
            <motion.path
              d="M 10 12 L 190 12"
              stroke="url(#orange-beam-grad)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0.2, pathOffset: 0 }}
              animate={{ pathOffset: [0, 1] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <defs>
              <linearGradient id="orange-beam-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EA580C" stopOpacity="0" />
                <stop offset="50%" stopColor="#F97316" stopOpacity="1" />
                <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Central Relay Badge */}
          <div className="absolute px-2.5 py-0.5 rounded-full bg-orange-950/80 border border-orange-500/50 text-[10px] text-orange-400 font-mono font-bold tracking-tight">
            {viaText}
          </div>
        </div>

        {/* Node 2: Destination */}
        <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-xl">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Discharge Node</span>
            <span className="text-xs font-semibold text-slate-100">{toText}</span>
          </div>
          <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

