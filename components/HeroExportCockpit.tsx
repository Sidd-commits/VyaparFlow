'use client';

import React, { useState, useEffect } from 'react';
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
  Wifi,
  Battery,
} from 'lucide-react';

interface TradeCorridorData {
  id: string;
  name: string;
  shortLabel: string;
  product: string;
  cargoValue: string;
  originHub: string;
  originPort: string;
  destination: string;
  transitTime: string;
  dutyRate: string;
  dutyBenefit: string;
  baseScore: number;
  resolvedScore: number;
  carrier: string;
  freightCost: string;
  documents: Array<{ name: string; status: 'ready' | 'pending' }>;
}

const TRADE_CORRIDORS: TradeCorridorData[] = [
  {
    id: 'nashik-dubai',
    name: 'Nashik → Dubai',
    shortLabel: 'Grapes (UAE)',
    product: 'Sonaka Fresh Table Grapes',
    cargoValue: '₹12,50,000',
    originHub: 'Nashik Agro-Cluster',
    originPort: 'JNPT Port (Nhava Sheva)',
    destination: 'Jebel Ali, Dubai',
    transitTime: '4–5 Days',
    dutyRate: '0% (India-UAE CEPA)',
    dutyBenefit: '₹1.48L saved',
    baseScore: 68,
    resolvedScore: 95,
    carrier: 'SwiftGlobe Logistics',
    freightCost: '₹1,35,000',
    documents: [
      { name: 'Commercial Invoice (CEPA)', status: 'ready' },
      { name: 'Certificate of Origin (Form 1)', status: 'ready' },
      { name: 'APEDA Phytosanitary Cert', status: 'pending' },
      { name: 'Shipping Bill & LEO', status: 'ready' },
    ],
  },
  {
    id: 'surat-rotterdam',
    name: 'Surat → Rotterdam',
    shortLabel: 'Fabrics (EU)',
    product: 'Woven Synthetic Fabrics',
    cargoValue: '₹28,40,000',
    originHub: 'Surat Textile SEZ',
    originPort: 'Hazira Port',
    destination: 'Rotterdam, Netherlands',
    transitTime: '21–23 Days',
    dutyRate: '4.8% (REX / EUR.1)',
    dutyBenefit: '₹2.24L saved',
    baseScore: 72,
    resolvedScore: 94,
    carrier: 'OceanBridge Global',
    freightCost: '₹2,80,000',
    documents: [
      { name: 'Commercial Invoice (EUR)', status: 'ready' },
      { name: 'Carton Breakdown Packing List', status: 'ready' },
      { name: 'OEKO-TEX 100 Safety Pass', status: 'pending' },
      { name: 'EU REX Origin Declaration', status: 'ready' },
    ],
  },
  {
    id: 'morbi-usa',
    name: 'Morbi → Long Beach',
    shortLabel: 'Tiles (USA)',
    product: 'Polished Vitrified Tiles',
    cargoValue: '₹42,00,000',
    originHub: 'Morbi Ceramic Cluster',
    originPort: 'Mundra Port',
    destination: 'Long Beach, California',
    transitTime: '28–30 Days',
    dutyRate: '3.2% MFN Duty',
    dutyBenefit: 'Anti-dumping exempt',
    baseScore: 70,
    resolvedScore: 96,
    carrier: 'Apex Maritime India',
    freightCost: '₹3,45,000',
    documents: [
      { name: 'US Customs 7501 Manifest', status: 'ready' },
      { name: 'Detailed CBM Packing List', status: 'ready' },
      { name: 'ISPM-15 Heat-Treated Pallet Cert', status: 'pending' },
      { name: 'Ocean Bill of Lading (OBL)', status: 'ready' },
    ],
  },
  {
    id: 'pune-frankfurt',
    name: 'Pune → Frankfurt',
    shortLabel: 'Auto (DE)',
    product: 'CNC Aluminum Housings',
    cargoValue: '₹18,90,000',
    originHub: 'Pune Engineering Belt',
    originPort: 'Mumbai Air Cargo (BOM)',
    destination: 'Frankfurt CargoCity',
    transitTime: '16 Hours',
    dutyRate: '0% (GSP Auto)',
    dutyBenefit: 'IATF 16949 Pass',
    baseScore: 74,
    resolvedScore: 98,
    carrier: 'Lufthansa Express Cargo',
    freightCost: '₹1,95,000',
    documents: [
      { name: 'Master Air Waybill (MAWB)', status: 'ready' },
      { name: 'Commercial Invoice (USD DDP)', status: 'ready' },
      { name: 'IATA Non-DG Declaration', status: 'pending' },
      { name: 'PPAP Quality Report', status: 'ready' },
    ],
  },
];

export default function HeroExportCockpit({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activeId, setActiveId] = useState<string>('nashik-dubai');
  const [isResolved, setIsResolved] = useState<boolean>(false);
  const [score, setScore] = useState<number>(68);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const corridor = TRADE_CORRIDORS.find((c) => c.id === activeId) || TRADE_CORRIDORS[0];

  useEffect(() => {
    setIsResolved(false);
    setScore(corridor.baseScore);
  }, [activeId, corridor.baseScore]);

  const handleToggleResolve = () => {
    setIsSimulating(true);
    setTimeout(() => {
      if (isResolved) {
        setIsResolved(false);
        setScore(corridor.baseScore);
      } else {
        setIsResolved(true);
        setScore(corridor.resolvedScore);
      }
      setIsSimulating(false);
    }, 300);
  };

  return (
    <div className="relative mx-auto w-full max-w-[390px] sm:max-w-[420px]">
      {/* Subtle outer glow */}
      <div className="absolute -inset-1.5 bg-linear-to-b from-blue-500/20 to-indigo-500/10 rounded-[50px] blur-xl opacity-60 pointer-events-none" />

      {/* Realistic Smartphone Chassis */}
      <div className="relative rounded-[46px] p-3 sm:p-3.5 bg-slate-900 shadow-2xl shadow-slate-400/40 border border-slate-700/80">
        {/* Dynamic Island Pill */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-end px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800 ring-1 ring-slate-700" />
        </div>

        {/* Inside Phone Screen */}
        <div className="bg-[#F8FAFC] rounded-[36px] overflow-hidden pt-7 pb-4 px-3.5 sm:px-4 text-slate-900 border border-slate-200/80 flex flex-col gap-3">
          {/* Status Bar */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1 pt-0.5">
            <span>9:00 PM</span>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="text-[10px] font-bold">5G</span>
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Clean App Header */}
          <div className="flex items-center justify-between pt-1 px-1">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Exporter Portal
              </span>
              <h3 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                Apex Agro Processing
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-[10px] font-bold">
              Verified
            </span>
          </div>

          {/* Quick Corridor Filter Pills */}
          <div className="grid grid-cols-4 gap-1 bg-slate-100/90 p-1 rounded-xl">
            {TRADE_CORRIDORS.map((item) => {
              const active = item.id === activeId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  className={`py-1 px-1 rounded-lg text-[10px] font-semibold text-center transition-all truncate cursor-pointer ${
                    active
                      ? 'bg-white text-blue-600 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.shortLabel}
                </button>
              );
            })}
          </div>

          {/* Primary Metric Cards (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Card 1: Readiness Score */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">Readiness</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                    isResolved
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {isResolved ? 'Cleared' : 'Audit'}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono tracking-tight text-blue-600">
                  {score}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isResolved ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>

            {/* Card 2: Consignment Value */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[11px] font-medium text-slate-500 block">
                Cargo Value
              </span>
              <div className="text-xl font-bold font-mono tracking-tight text-slate-900 truncate">
                {corridor.cargoValue}
              </div>
              <span className="text-[10px] text-slate-500 truncate block">
                {corridor.product.split(' ').slice(0, 2).join(' ')}
              </span>
            </div>

            {/* Card 3: Tariff & CEPA */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-medium text-slate-500 block">Duty Rate</span>
              <div className="text-xs font-bold text-emerald-700 truncate">
                {corridor.dutyRate}
              </div>
              <span className="text-[9px] text-slate-400 block truncate">
                {corridor.dutyBenefit}
              </span>
            </div>

            {/* Card 4: Route & Transit */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-medium text-slate-500 block">Ocean Transit</span>
              <div className="text-xs font-bold text-slate-900 truncate">
                {corridor.transitTime}
              </div>
              <span className="text-[9px] text-slate-400 block truncate">
                {corridor.destination}
              </span>
            </div>
          </div>

          {/* Statutory Clearances List */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Required Clearances</span>
              <span className="text-blue-600 lowercase font-medium">4 items</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {corridor.documents.map((doc, idx) => {
                const isCleared = doc.status === 'ready' || isResolved;
                return (
                  <div
                    key={doc.name}
                    className="flex items-center justify-between py-1 border-b border-slate-100 last:border-b-0"
                  >
                    <span className="text-slate-700 font-medium truncate max-w-[210px] text-[11px]">
                      {doc.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0 ${
                        isCleared
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {isCleared ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Cleared</span>
                        </>
                      ) : (
                        <span>Lab Sync</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logistics Provider Quote Snippet */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] text-slate-400 block">Verified Logistics Rate</span>
              <span className="font-bold text-slate-900 text-xs truncate block">
                {corridor.carrier}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="font-bold text-blue-600 font-mono text-xs block">
                {corridor.freightCost}
              </span>
              <span className="text-[9px] text-slate-400">All-in FCL Quote</span>
            </div>
          </div>

          {/* Interactive Action Simulation Button */}
          <button
            type="button"
            onClick={handleToggleResolve}
            disabled={isSimulating}
            className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>
              {isResolved
                ? 'Reset Blocker Simulation'
                : 'Simulate Lab Sync & LEO Release'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
