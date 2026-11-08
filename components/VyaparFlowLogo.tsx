'use client';

import React from 'react';

interface VyaparFlowLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  textClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  subtitle?: string;
  variant?: 'light' | 'dark';
}

export default function VyaparFlowLogo({
  size = 36,
  showText = false,
  className = '',
  textClassName = '',
  titleClassName = '',
  subtitleClassName = '',
  subtitle = 'Export Logistics Platform',
  variant = 'light',
}: VyaparFlowLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Dynamic Vector Brand Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="logo-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="35%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          <linearGradient id="logo-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>

          <linearGradient id="logo-glare" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </linearGradient>

          <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#7C2D12" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Ambient Glow */}
        <rect x="36" y="36" width="440" height="440" rx="112" fill="#EA580C" opacity="0.3" filter="blur(16px)" />

        {/* Squircle Base */}
        <rect x="32" y="32" width="448" height="448" rx="112" fill="url(#logo-bg-grad)" />

        {/* Subtle Top Glare */}
        <rect x="34" y="34" width="444" height="220" rx="110" fill="url(#logo-glare)" />

        {/* Subtle Inner Bevel Stroke */}
        <rect x="32" y="32" width="448" height="448" rx="112" stroke="rgba(255,255,255,0.28)" strokeWidth="6" />

        {/* Central Symbol: Interlocking 'V' Vessel Hull & Momentum Flow Chevron */}
        <g filter="url(#logo-shadow)">
          {/* Outer Vessel Hull 'V' — Pure Crisp White */}
          <path
            d="M 120 156 L 256 388 L 392 156 L 322 156 L 256 288 L 190 156 Z"
            fill="#FFFFFF"
          />

          {/* Forward Momentum Chevron Wing — Radiant Gold */}
          <path
            d="M 194 132 L 256 236 L 318 132 L 356 132 L 256 280 L 156 132 Z"
            fill="url(#logo-gold-grad)"
            opacity="0.95"
          />

          {/* Streamline Node */}
          <path
            d="M 238 316 L 256 348 L 274 316 Z"
            fill="url(#logo-gold-grad)"
          />

          {/* Horizon Dot */}
          <circle cx="256" cy="104" r="16" fill="#FFFFFF" />
        </g>
      </svg>

      {/* Optional Wordmark */}
      {showText && (
        <div className={`flex flex-col text-left leading-none ${textClassName}`}>
          <span
            className={`font-black text-lg tracking-tight font-sans ${
              titleClassName || (variant === 'dark' ? 'text-white' : 'text-slate-900')
            }`}
          >
            VyaparFlow
          </span>
          {subtitle && (
            <span
              className={`text-[10px] font-medium tracking-tight mt-1 ${
                subtitleClassName || (variant === 'dark' ? 'text-slate-400' : 'text-slate-500')
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
