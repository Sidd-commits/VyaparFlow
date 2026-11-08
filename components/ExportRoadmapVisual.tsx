'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  MapPin,
  ArrowRight,
  Globe2,
  ShieldCheck,
  RefreshCw,
  Check,
} from 'lucide-react';

interface TradeCorridorData {
  id: string;
  name: string;
  shortLabel: string;
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
    shortLabel: 'Sonaka',
    commodity: 'Sonaka Table Grapes',
    originPort: 'JNPT Port (Nhava Sheva)',
    destPort: 'Jebel Ali Port (UAE)',
    cargoValue: '₹12,50,000',
    dutySaving: '0% CEPA Preferential Duty',
    transitTime: '4–5 Days Ocean Reefer',
    baseScore: 68,
    resolvedScore: 96,
    carrier: 'SwiftGlobe Logistics India',
    keyDoc: 'APEDA Phytosanitary & NABL Residue Pass',
  },
  {
    id: 'surat-rotterdam',
    name: 'Surat → Rotterdam',
    shortLabel: 'Woven',
    commodity: 'Woven Synthetic Fabrics',
    originPort: 'Hazira Port Terminal',
    destPort: 'Port of Rotterdam (EU)',
    cargoValue: '₹28,40,000',
    dutySaving: '4.8% REX Tariff Concession',
    transitTime: '21–23 Days Ocean FCL',
    baseScore: 72,
    resolvedScore: 95,
    carrier: 'OceanBridge Global Express',
    keyDoc: 'OEKO-TEX 100 & REACH Safety Pass',
  },
  {
    id: 'morbi-usa',
    name: 'Morbi → Long Beach',
    shortLabel: 'Vitrified',
    commodity: 'Polished Vitrified Tiles',
    originPort: 'Mundra Port Gateway',
    destPort: 'Port of Long Beach (USA)',
    cargoValue: '₹42,00,000',
    dutySaving: 'Anti-dumping Duty Exempt',
    transitTime: '28–30 Days Ocean FCL',
    baseScore: 70,
    resolvedScore: 94,
    carrier: 'Apex Maritime India Ltd',
    keyDoc: 'ISPM-15 Heat-Treated Pallet Cert',
  },
  {
    id: 'pune-frankfurt',
    name: 'Pune → Frankfurt',
    shortLabel: 'CNC',
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

export default function ExportRoadmapVisual() {
  const [activeId, setActiveId] = useState<string>('pune-frankfurt');
  const [isResolved, setIsResolved] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const current = CORRIDORS.find((c) => c.id === activeId) || CORRIDORS[3];
  const score = isResolved ? current.resolvedScore : current.baseScore;

  const handleToggleResolve = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsResolved((prev) => !prev);
      setIsSimulating(false);
    }, 350);
  };

  const handleSelectCorridor = (id: string) => {
    setActiveId(id);
    setIsResolved(false);
  };

  return (
    <div className="w-full select-none">
      {/* High-Contrast Export Operations Console (Exact Reference Design) */}
      <div className="rounded-3xl bg-[#0B0F19] text-white border border-slate-800/90 shadow-2xl p-5 sm:p-7 space-y-5 relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* 1. Header Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">
                  Export Operations Console
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-xs text-slate-400 block">
                Live Trade Corridor Telemetry
              </span>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              isResolved
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-xs'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
            }`}
          >
            {isResolved ? '● LEO Cleared for Gate-in' : '▲ Verification in Progress'}
          </span>
        </div>

        {/* 2. Corridor Tabs */}
        <div className="relative z-10 bg-[#131B2E]/90 p-1.5 rounded-2xl border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {CORRIDORS.map((c) => {
            const active = c.id === activeId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectCorridor(c.id)}
                className={`relative p-2 rounded-xl text-left transition-colors cursor-pointer min-w-0 ${
                  active ? 'text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="console-active-corridor"
                    className="absolute inset-0 bg-linear-to-r from-orange-600 to-orange-500 rounded-xl shadow-md shadow-orange-600/30"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 block text-xs font-bold truncate">
                  {c.name}
                </span>
                <span
                  className={`relative z-10 block text-[11px] truncate mt-0.5 ${
                    active ? 'text-orange-100' : 'text-slate-500'
                  }`}
                >
                  {c.shortLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. Active Consignment Card & Visual Clearance Pipeline */}
        <div className="relative z-10 p-5 rounded-2xl bg-[#131B2E] border border-slate-800/80 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
            <div className="sm:col-span-8 min-w-0 space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-orange-400 block">
                Active Consignment
              </span>
              <h4 className="text-lg font-bold text-white truncate">
                {current.commodity}
              </h4>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium truncate">
                <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span className="truncate">{current.originPort}</span>
                <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                <Globe2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">{current.destPort}</span>
              </p>
            </div>
            <div className="sm:col-span-4 text-left sm:text-right shrink-0">
              <span className="text-xs text-slate-400 block">Estimated Transit</span>
              <span className="text-xs font-bold text-white mt-0.5 block whitespace-nowrap">
                {current.transitTime}
              </span>
            </div>
          </div>

          {/* 4-Stage Visual Clearance Pipeline (Roadmap) */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2.5">
              <span>Factory Dispatch</span>
              <span>CFS Gate-in</span>
              <span>Customs Inspection</span>
              <span>LEO Release</span>
            </div>

            {/* Visual Track with Connected Milestones */}
            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 right-0 h-1 bg-slate-800 rounded-full" />
              <div
                className="absolute left-0 h-1 bg-linear-to-r from-orange-500 via-amber-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: isResolved ? '100%' : '66%' }}
              />

              {/* Node 1 */}
              <div className="relative w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>

              {/* Node 2 */}
              <div className="relative w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>

              {/* Node 3 */}
              <div
                className={`relative w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isResolved
                    ? 'bg-orange-600 text-white'
                    : 'bg-amber-400 text-slate-900 ring-4 ring-amber-400/20'
                }`}
              >
                {isResolved ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '•'}
              </div>

              {/* Node 4 */}
              <div
                className={`relative w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isResolved
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {isResolved ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '4'}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Operational Metric Tiles (Bento Style) */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {/* Tile 1: Export Readiness Score */}
          <div className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800/80 space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 block">
              Export Readiness Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-orange-500">
                {score}
              </span>
              <span className="text-sm text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isResolved ? 'bg-emerald-400' : 'bg-orange-500'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Tile 2: Consignment Value */}
          <div className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800/80 space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 block">
              Consignment Value
            </span>
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {current.cargoValue}
            </div>
            <span className="text-xs text-emerald-400 font-semibold block truncate">
              {current.dutySaving}
            </span>
          </div>
        </div>

        {/* 5. Clearances Status Strip */}
        <div className="relative z-10 p-3.5 rounded-xl bg-[#131B2E]/90 border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-white block truncate">
                {current.keyDoc}
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                Verified Logistics Partner: {current.carrier}
              </span>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 ml-2 ${
              isResolved
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {isResolved ? 'Cleared ✓' : 'Sync Required'}
          </span>
        </div>

        {/* 6. Interactive Clearance Simulation Button */}
        <button
          type="button"
          onClick={handleToggleResolve}
          disabled={isSimulating}
          className="relative z-10 w-full py-3.5 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-75"
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
