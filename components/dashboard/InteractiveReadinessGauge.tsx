'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface InteractiveReadinessGaugeProps {
  score: number;
  readinessState: string;
  isHealthy: boolean;
}

export default function InteractiveReadinessGauge({
  score,
  readinessState,
  isHealthy,
}: InteractiveReadinessGaugeProps) {
  // SVG circular dimensions
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const gradientId = isHealthy ? 'gauge-emerald' : score >= 60 ? 'gauge-amber' : 'gauge-orange';

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="relative group/gauge flex flex-col items-center justify-center shrink-0 cursor-default"
    >
      {/* AniMaster Style: 3D Ambient Glow behind gauge */}
      <div
        className={`absolute inset-0 rounded-full blur-xl opacity-25 group-hover/gauge:opacity-45 transition-opacity pointer-events-none ${
          isHealthy
            ? 'bg-emerald-500'
            : score >= 60
            ? 'bg-amber-500'
            : 'bg-orange-600'
        }`}
      />

      {/* SVG Circular Progress Meter */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="gauge-orange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
            <linearGradient id="gauge-amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="gauge-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth="7"
            className="transition-colors"
          />

          {/* AniMaster Animated SVG Stroke with 3D drop-shadow */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={`url(#${gradientId})`}
            strokeWidth="7"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            style={{
              filter: isHealthy
                ? 'drop-shadow(0 4px 6px rgba(16, 185, 129, 0.35))'
                : 'drop-shadow(0 4px 6px rgba(234, 88, 12, 0.35))',
            }}
          />
        </svg>

        {/* Center Numbers with Crisp Typography */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className={`text-2xl font-black font-mono tracking-tight leading-none ${
              isHealthy
                ? 'text-emerald-600'
                : score >= 60
                ? 'text-amber-600'
                : 'text-orange-600'
            }`}
          >
            {score}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            / 100
          </span>
        </div>
      </div>

      {/* Skiper UI Mini Pill Status Indicator */}
      <span
        className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-2xs ${
          isHealthy
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-orange-50 text-orange-700 border-orange-200'
        }`}
      >
        {isHealthy ? 'Export Cleared' : 'Audit In-Progress'}
      </span>
    </motion.div>
  );
}