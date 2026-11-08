'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    // Gentle 3D perspective tilt
    const rotateY = ((x - centerX) / centerX) * 3.5;
    const rotateX = -((y - centerY) / centerY) * 3.5;
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
      {/* AniMaster Style: Ambient warm lighting aura */}
      <div className="absolute -inset-2 bg-linear-to-tr from-orange-500/15 via-amber-400/10 to-orange-200/10 rounded-3xl blur-2xl opacity-70 group-hover:opacity-90 transition-opacity pointer-events-none" />

      {/* Vengeance UI Style: Frosted glass elevated console card that harmonizes with page */}
      <div
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
        className="relative rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_20px_50px_-10px_rgba(234,88,12,0.09)] p-5 sm:p-7 text-slate-900 space-y-5 overflow-hidden"
      >
        {/* Subtle Specular Shine Overlay */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none opacity-40 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 350px at ${mousePos.x}% ${mousePos.y}%, rgba(234,88,12,0.04), transparent 80%)`,
          }}
        />

        {/* Console Header Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shadow-2xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  Export Operations Console
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span className="text-[11px] text-slate-500 block">
                Live Trade Corridor Telemetry
              </span>
            </div>
          </div>

          {/* Dynamic LEO Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              isResolved
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {isResolved ? '● LEO Cleared for Port Gate-in' : '▲ Verification in Progress'}
          </span>
        </div>

        {/* Skiper UI Style: Sliding pill corridor tabs */}
        <div className="relative z-10 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {CORRIDORS.map((c) => {
            const active = c.id === activeId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={`relative p-2 rounded-xl text-left transition-colors cursor-pointer select-none min-w-0 ${
                  active ? 'text-white font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="hero-active-corridor"
                    className="absolute inset-0 bg-linear-to-r from-orange-600 to-orange-500 rounded-xl shadow-sm shadow-orange-600/30"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 block text-[11px] sm:text-xs font-bold truncate">{c.name}</span>
                <span className={`relative z-10 block text-[10px] truncate mt-0.5 ${active ? 'text-orange-100' : 'text-slate-400'}`}>
                  {c.commodity.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Corridor Card & Route Progression (Rigid Stable Layout with Zero Shift) */}
        <div className="relative z-10 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
            <div className="sm:col-span-8 min-w-0 space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider font-bold text-orange-600 block">
                Active Consignment
              </span>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {current.commodity}
              </h4>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-medium truncate">
                <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span className="truncate">{current.originPort}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                <Globe2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">{current.destPort}</span>
              </p>
            </div>
            <div className="sm:col-span-4 text-left sm:text-right shrink-0">
              <span className="text-[11px] text-slate-500 block font-medium">Estimated Transit</span>
              <span className="text-xs font-bold text-slate-800 mt-0.5 block whitespace-nowrap">
                {current.transitTime}
              </span>
            </div>
          </div>

          {/* AniMaster Style: 4-Stage Visual Clearance Pipeline */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-2">
              <span>Factory Dispatch</span>
              <span>CFS Gate-in</span>
              <span>Customs Inspection</span>
              <span>LEO Release</span>
            </div>

            {/* Pipeline Track with Glowing Nodes */}
            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 right-0 h-1.5 bg-slate-200 rounded-full" />
              <div
                className="absolute left-0 h-1.5 bg-linear-to-r from-orange-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: isResolved ? '100%' : '66%' }}
              />

              {/* Node 1 */}
              <div className="relative w-6 h-6 rounded-full bg-orange-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                ✓
              </div>
              {/* Node 2 */}
              <div className="relative w-6 h-6 rounded-full bg-orange-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                ✓
              </div>
              {/* Node 3 */}
              <div className={`relative w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold transition-all ${
                isResolved ? 'bg-orange-600 text-white' : 'bg-amber-400 text-slate-900 animate-pulse'
              }`}>
                {isResolved ? '✓' : '•'}
              </div>
              {/* Node 4 */}
              <div className={`relative w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold transition-all ${
                isResolved ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30' : 'bg-slate-200 text-slate-500'
              }`}>
                {isResolved ? '✓' : '4'}
              </div>
            </div>
          </div>
        </div>

        {/* Vengeance UI Bento Style: Key Operational Metrics */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {/* Tile 1: Readiness Score */}
          <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200/80 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Export Readiness Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-orange-600">
                {score}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/ 100</span>
            </div>
            <div className="w-full bg-orange-200/60 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isResolved ? 'bg-emerald-500' : 'bg-orange-600'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Tile 2: Cargo & Duty Arbitrage */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Consignment Value
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {current.cargoValue}
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold block truncate">
              {current.dutySaving}
            </span>
          </div>
        </div>

        {/* Clearances Status Strip */}
        <div className="relative z-10 p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-slate-900 block truncate">
                {current.keyDoc}
              </span>
              <span className="text-[10px] text-slate-500 block truncate font-medium">
                Verified Logistics Partner: {current.carrier}
              </span>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 ml-2 ${
              isResolved
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {isResolved ? 'Cleared ✓' : 'Sync Required'}
          </span>
        </div>

        {/* AniMaster Magnetic Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleToggleResolve}
          disabled={isSimulating}
          className="relative z-10 w-full py-3.5 px-4 rounded-2xl bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-75"
        >
          <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>
            {isResolved
              ? 'Reset Clearance Simulation'
              : 'Run Live Customs LEO Clearance Simulation'}
          </span>
        </motion.button>

      </div>
    </div>
  );
}