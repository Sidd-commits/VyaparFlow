'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Ship,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPin,
  Globe2,
  TrendingUp,
  RefreshCw,
  Check,
  Sparkles,
  Truck,
  Box,
  Layers,
  Zap,
} from 'lucide-react';

interface TradeCorridorData {
  id: string;
  name: string;
  commodity: string;
  originPort: string;
  destPort: string;
  cargoValue: string;
  dutySaving: string;
  transitTime: string;
  baseScore: number;
  resolvedScore: number;
  carrier: string;
  keyDoc: string;
}

const CORRIDORS: TradeCorridorData[] = [
  {
    id: 'nashik-dubai',
    name: 'Nashik → Dubai',
    commodity: 'Sonaka Fresh Table Grapes',
    originPort: 'JNPT Port (Nhava Sheva)',
    destPort: 'Jebel Ali Port (UAE)',
    cargoValue: '₹12,50,000',
    dutySaving: '₹1,48,000 duty saved (0% CEPA)',
    transitTime: '4–5 Days Ocean Reefer',
    baseScore: 68,
    resolvedScore: 96,
    carrier: 'SwiftGlobe Logistics India',
    keyDoc: 'APEDA Phytosanitary & NABL Residue Pass',
  },
  {
    id: 'surat-rotterdam',
    name: 'Surat → Rotterdam',
    commodity: 'Woven Synthetic Fabrics',
    originPort: 'Hazira Port / Mundra',
    destPort: 'Port of Rotterdam (EU)',
    cargoValue: '₹28,40,000',
    dutySaving: '₹2,24,000 duty saved (REX 4.8%)',
    transitTime: '21–23 Days Ocean Container',
    baseScore: 72,
    resolvedScore: 95,
    carrier: 'OceanBridge Global Express',
    keyDoc: 'OEKO-TEX 100 & EU REACH Safety Pass',
  },
  {
    id: 'morbi-usa',
    name: 'Morbi → Long Beach',
    commodity: 'Vitrified Porcelain Tiles',
    originPort: 'Mundra Port Gateway',
    destPort: 'Port of Long Beach (USA)',
    cargoValue: '₹42,00,000',
    dutySaving: 'Anti-dumping duty exempt',
    transitTime: '28–30 Days Ocean FCL',
    baseScore: 70,
    resolvedScore: 94,
    carrier: 'Apex Maritime India Ltd',
    keyDoc: 'ISPM-15 Heat-Treated Pallet Cert',
  },
  {
    id: 'pune-frankfurt',
    name: 'Pune → Frankfurt',
    commodity: 'CNC Precision Auto Housings',
    originPort: 'Mumbai Air Cargo (BOM)',
    destPort: 'Frankfurt CargoCity (DE)',
    cargoValue: '₹18,90,000',
    dutySaving: '0% GSP Preferential Duty',
    transitTime: '16 Hours Air Priority',
    baseScore: 74,
    resolvedScore: 98,
    carrier: 'Lufthansa Express Cargo',
    keyDoc: 'IATA Non-DG Quality & PPAP Clearance',
  },
];

export default function HeroExportCockpit({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activeId, setActiveId] = useState<string>('nashik-dubai');
  const [isResolved, setIsResolved] = useState<boolean>(false);
  const [score, setScore] = useState<number>(68);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  const current = CORRIDORS.find((c) => c.id === activeId) || CORRIDORS[0];

  useEffect(() => {
    setIsResolved(false);
    setScore(current.baseScore);
  }, [activeId, current.baseScore]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || typeof window === 'undefined' || window.innerWidth < 768) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Subtle 3D tilt (+-4.5 deg max)
    const rotateY = ((x - centerX) / centerX) * 4.5;
    const rotateX = -((y - centerY) / centerY) * 4.5;
    setTilt({ x: rotateX, y: rotateY });
    setMousePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setMousePos({ x: 50, y: 50 });
  };

  const handleToggleResolve = () => {
    setIsSimulating(true);
    setTimeout(() => {
      if (isResolved) {
        setIsResolved(false);
        setScore(current.baseScore);
      } else {
        setIsResolved(true);
        setScore(current.resolvedScore);
      }
      setIsSimulating(false);
    }, 350);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto w-full max-w-xl group perspective-1200"
    >
      {/* Dynamic 3D ambient orange/amber backlight */}
      <div className="absolute -inset-2 bg-linear-to-tr from-orange-600/25 via-amber-500/20 to-orange-400/10 rounded-3xl blur-2xl opacity-70 group-hover:opacity-90 transition-opacity pointer-events-none" />

      {/* 3D Elevated Glassmorphic Console Card */}
      <div
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
        className="relative rounded-3xl bg-slate-950/95 border border-slate-800 shadow-2xl p-5 sm:p-7 text-white space-y-5 overflow-hidden"
      >
        {/* Subtle Specular Shine Overlay */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none opacity-40 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 350px at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.07), transparent 80%)`,
          }}
        />

        {/* Console Header Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-tight">
                  Export Operations Console
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[11px] text-slate-400 block">
                Live Trade Corridor Telemetry
              </span>
            </div>
          </div>

          {/* Dynamic LEO Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              isResolved
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-xs'
                : 'bg-orange-500/15 text-orange-400 border-orange-500/40'
            }`}
          >
            {isResolved ? '● LEO Cleared for Port Gate-in' : '▲ Verification in Progress'}
          </span>
        </div>

        {/* Corridor Selector Chips */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CORRIDORS.map((c) => {
            const active = c.id === activeId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  active
                    ? 'bg-orange-600 text-white border-orange-500 font-bold shadow-md shadow-orange-600/30'
                    : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
                }`}
              >
                <span className="block text-xs font-bold truncate">{c.name}</span>
                <span className="block text-[10px] opacity-80 truncate mt-0.5">
                  {c.commodity.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Corridor Card & Route Progression */}
        <div className="relative z-10 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-orange-400 block">
                Active Consignment
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {current.commodity}
              </h4>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>{current.originPort}</span>
                <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                <Globe2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{current.destPort}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Estimated Transit</span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 block">
                {current.transitTime}
              </span>
            </div>
          </div>

          {/* 4-Stage Visual Clearance Pipeline */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-2">
              <span>Factory Dispatch</span>
              <span>CFS Gate-in</span>
              <span>Customs Inspection</span>
              <span>LEO Release</span>
            </div>

            {/* Pipeline Track with Glowing Nodes */}
            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 right-0 h-1 bg-slate-800 rounded-full" />
              <div
                className="absolute left-0 h-1 bg-linear-to-r from-orange-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: isResolved ? '100%' : '66%' }}
              />

              {/* Node 1 */}
              <div className="relative w-6 h-6 rounded-full bg-orange-600 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                ✓
              </div>
              {/* Node 2 */}
              <div className="relative w-6 h-6 rounded-full bg-orange-600 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                ✓
              </div>
              {/* Node 3 */}
              <div className={`relative w-6 h-6 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold transition-all ${
                isResolved ? 'bg-orange-600 text-white' : 'bg-amber-400 text-slate-950 animate-pulse'
              }`}>
                {isResolved ? '✓' : '•'}
              </div>
              {/* Node 4 */}
              <div className={`relative w-6 h-6 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold transition-all ${
                isResolved ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40' : 'bg-slate-800 text-slate-500'
              }`}>
                {isResolved ? '✓' : '4'}
              </div>
            </div>
          </div>
        </div>

        {/* Key Operational Metrics (Dual Elevated Tiles) */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {/* Tile 1: Readiness Score */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Export Readiness Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-mono text-orange-500">
                {score}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/ 100</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isResolved ? 'bg-emerald-500' : 'bg-orange-500'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Tile 2: Cargo & Duty Arbitrage */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Consignment Value
            </span>
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {current.cargoValue}
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold block truncate">
              {current.dutySaving}
            </span>
          </div>
        </div>

        {/* Clearances Status Strip */}
        <div className="relative z-10 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-white block truncate">
                {current.keyDoc}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                Verified Logistics Partner: {current.carrier}
              </span>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 ml-2 ${
              isResolved
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {isResolved ? 'Cleared ✓' : 'Sync Required'}
          </span>
        </div>

        {/* Interactive Simulation Action Button */}
        <button
          type="button"
          onClick={handleToggleResolve}
          disabled={isSimulating}
          className="relative z-10 w-full py-3.5 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-75"
        >
          <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>
            {isResolved
              ? 'Reset Clearance Simulation'
              : 'Run Live Customs LEO Clearance Simulation'}
          </span>
        </button>

      </div>
    </div>
  );
}