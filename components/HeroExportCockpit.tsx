'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Ship,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Boxes,
  Compass,
  MapPin,
  Building2,
  Truck,
  Sparkles,
  Download,
  ExternalLink,
  Layers,
  ChevronRight,
  TrendingUp,
  Globe2,
  Award,
  Zap,
  RefreshCw,
  Activity,
  Check,
  Lock,
} from 'lucide-react';

interface TradeCorridorData {
  id: string;
  name: string;
  product: string;
  hsCode: string;
  originHub: string;
  originPort: string;
  destination: string;
  destinationCountry: string;
  transitMode: 'Ocean' | 'Air';
  transitTime: string;
  tariffPreferential: string;
  tariffStandard: string;
  ftaAgreement: string;
  baseScore: number;
  resolvedScore: number;
  blockerTitle: string;
  blockerDesc: string;
  blockerResolution: string;
  documents: Array<{ name: string; status: 'ready' | 'pending' }>;
  telemetryLogs: string[];
}

const TRADE_CORRIDORS: TradeCorridorData[] = [
  {
    id: 'nashik-dubai',
    name: 'Nashik → Dubai',
    product: 'Sonaka Fresh Table Grapes',
    hsCode: '0806.10.00',
    originHub: 'Nashik Agro-Cluster, Maharashtra',
    originPort: 'JNPT Port (Nhava Sheva)',
    destination: 'Jebel Ali Port, Dubai (UAE)',
    destinationCountry: 'United Arab Emirates',
    transitMode: 'Ocean',
    transitTime: '4–5 Days',
    tariffPreferential: '0% (India-UAE CEPA)',
    tariffStandard: '5.0% MFN',
    ftaAgreement: 'CEPA COO Form 1 Verified',
    baseScore: 62,
    resolvedScore: 94,
    blockerTitle: 'APEDA Phytosanitary & Pesticide MRL Clearance Pending',
    blockerDesc: 'EU/GCC MRL thresholds require NABL-accredited chemical residue audit before port CFS gate-in.',
    blockerResolution: 'NABL Lab Report #APEDA-2026-891 synced to ICEGATE e-Sanchit vault.',
    documents: [
      { name: 'Commercial Invoice (CEPA Compliant)', status: 'ready' },
      { name: 'Standard Packing List (Reefer 40ft HC)', status: 'ready' },
      { name: 'APEDA Phytosanitary Certificate', status: 'pending' },
      { name: 'Certificate of Origin (Form 1)', status: 'ready' },
    ],
    telemetryLogs: [
      'HS 0806.10.00 classified under Chapter 08 (Edible Fruits).',
      'India-UAE CEPA preferential tariff of 0% applied (Saved ₹1,48,000 duty).',
      'Port of Loading: JNPT Nhava Sheva Berth 4 scheduled.',
    ],
  },
  {
    id: 'surat-rotterdam',
    name: 'Surat → Rotterdam',
    product: 'Woven Synthetic & Silk Fabrics',
    hsCode: '5407.52.00',
    originHub: 'Surat Textile Export SEZ, Gujarat',
    originPort: 'Hazira Port / Mundra',
    destination: 'Port of Rotterdam (Netherlands)',
    destinationCountry: 'European Union',
    transitMode: 'Ocean',
    transitTime: '21–23 Days',
    tariffPreferential: '4.8% (REX / EUR.1)',
    tariffStandard: '8.0% Standard MFN',
    ftaAgreement: 'EU REX Self-Certification',
    baseScore: 58,
    resolvedScore: 91,
    blockerTitle: 'EU REACH Azo Dye & OEKO-TEX 100 Safety Audit Missing',
    blockerDesc: 'European Union chemicals regulation requires zero aromatic amine dye report.',
    blockerResolution: 'OEKO-TEX Standard 100 lab pass verified and registered in customs dossier.',
    documents: [
      { name: 'Commercial Invoice (EUR Pricing)', status: 'ready' },
      { name: 'Carton Breakdown Packing List', status: 'ready' },
      { name: 'OEKO-TEX Standard 100 Certificate', status: 'pending' },
      { name: 'EU REX Statement of Origin', status: 'ready' },
    ],
    telemetryLogs: [
      'HS 5407.52.00 verified for European Union Customs Entry.',
      'EU REACH hazardous chemical screening initiated.',
      'Container Booking: 1x40ft GP via Maersk Hazira Line.',
    ],
  },
  {
    id: 'morbi-usa',
    name: 'Morbi → Long Beach',
    product: 'Polished Vitrified Porcelain Tiles',
    hsCode: '6907.21.00',
    originHub: 'Morbi Ceramic Industrial Cluster, Gujarat',
    originPort: 'Mundra Port',
    destination: 'Port of Long Beach, California (USA)',
    destinationCountry: 'United States',
    transitMode: 'Ocean',
    transitTime: '28–30 Days',
    tariffPreferential: '3.2% MFN Duty',
    tariffStandard: '28.5% Non-Compliant',
    ftaAgreement: 'US ISF 10+2 Pre-Filing',
    baseScore: 70,
    resolvedScore: 96,
    blockerTitle: 'ISPM-15 Heat-Treated Wooden Pallet Fumigation Cert Required',
    blockerDesc: 'US CBP requires IPPC stamp and phytosanitary certificate for solid wood packaging.',
    blockerResolution: 'ISPM-15 heat-treatment certificate #HT-MORBI-441 attached to packing manifest.',
    documents: [
      { name: 'US Customs Entry 7501 Manifest', status: 'ready' },
      { name: 'Detailed CBM & Pallet Weight List', status: 'ready' },
      { name: 'ISPM-15 Phytosanitary Pallet Cert', status: 'pending' },
      { name: 'Ocean Bill of Lading (OBL)', status: 'ready' },
    ],
    telemetryLogs: [
      'HS 6907.21.00 anti-dumping duty exemption validated.',
      'US CBP ISF 10+2 security filing confirmed 48h prior to loading.',
      'Mundra Gateway Port Container Berth assigned.',
    ],
  },
  {
    id: 'pune-frankfurt',
    name: 'Pune → Frankfurt',
    product: 'CNC Aluminum Transmission Housings',
    hsCode: '8708.40.00',
    originHub: 'Pune Automotive Engineering Belt, Maharashtra',
    originPort: 'Mumbai Air Cargo Complex (BOM)',
    destination: 'Frankfurt CargoCity (FRA, Germany)',
    destinationCountry: 'Germany (EU)',
    transitMode: 'Air',
    transitTime: '16 Hours',
    tariffPreferential: '0% (GSP Automotive)',
    tariffStandard: '4.5% Standard',
    ftaAgreement: 'IATF 16949 / ISO 9001 Certified',
    baseScore: 74,
    resolvedScore: 98,
    blockerTitle: 'Air Cargo Dangerous Goods & Magnetic Field Inspection Pending',
    blockerDesc: 'IATA air transport regulations mandate non-DG quality certification for machined metals.',
    blockerResolution: 'IATA Non-DG Air declaration and PPAP dimensional report certified by BOM cargo.',
    documents: [
      { name: 'Master Air Waybill (MAWB)', status: 'ready' },
      { name: 'Commercial Invoice (USD DDP)', status: 'ready' },
      { name: 'IATA Non-DG Air Declaration', status: 'pending' },
      { name: 'PPAP Quality Inspection Report', status: 'ready' },
    ],
    telemetryLogs: [
      'HS 8708.40.00 verified for Priority Air Express corridor.',
      'Air Waybill #098-BOM-FRA allocated with Lufthansa Cargo.',
      'Pre-customs clearance validated via Frankfurt Atlas EDI.',
    ],
  },
];

export default function HeroExportCockpit({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activeCorridorId, setActiveCorridorId] = useState<string>('nashik-dubai');
  const [isResolved, setIsResolved] = useState<boolean>(false);
  const [score, setScore] = useState<number>(62);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const corridor = TRADE_CORRIDORS.find((c) => c.id === activeCorridorId) || TRADE_CORRIDORS[0];

  // Sync score when corridor or resolution status changes
  useEffect(() => {
    setIsResolved(false);
    setScore(corridor.baseScore);
  }, [activeCorridorId, corridor.baseScore]);

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
    }, 400);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-800/90 shadow-2xl bg-[#090D16] text-white p-5 sm:p-7 space-y-6 transition-all">
      {/* Top Cockpit Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-orange-400 font-bold">
                COMMAND CENTER TELEMETRY
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Deterministic Compliance & Blocker Audit
            </span>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${
              isResolved
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}
          >
            {isResolved ? '● LEO DISPATCH READY' : '▲ 1 BLOCKER DETECTED'}
          </span>
        </div>
      </div>

      {/* Corridor Quick-Selector Pills */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
          <span>Active Trade Payload Simulator:</span>
          <span className="text-orange-400 font-mono">Pan-India Network</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TRADE_CORRIDORS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveCorridorId(item.id)}
              className={`px-3 py-2 rounded-xl text-left border text-xs transition-all cursor-pointer truncate ${
                activeCorridorId === item.id
                  ? 'bg-orange-600 text-white border-orange-500 font-bold shadow-md shadow-orange-600/30'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="block truncate font-bold">{item.name}</span>
              <span className="block text-[10px] opacity-75 truncate">{item.product.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Payload Information Card */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-orange-400 block">
              Active Manifest: {corridor.originHub.split(',')[0]}
            </span>
            <h4 className="text-base sm:text-lg font-bold text-white font-serif mt-0.5">
              {corridor.product}
            </h4>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span>{corridor.originPort}</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <Globe2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>{corridor.destination}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-orange-300 inline-block">
              HS: {corridor.hsCode}
            </span>
            <span className="block text-[10px] text-slate-400 mt-1 font-mono">
              Transit: {corridor.transitTime} ({corridor.transitMode})
            </span>
          </div>
        </div>

        {/* Key Tariff Arbitrage & FTA Indicator */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Bilateral Tariff</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">{corridor.tariffPreferential}</span>
            <span className="text-[9px] text-slate-500 block truncate">vs {corridor.tariffStandard}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">FTA Agreement</span>
            <span className="text-xs font-bold text-slate-200 truncate block">{corridor.ftaAgreement}</span>
            <span className="text-[9px] text-emerald-400 block">Duty Benefit Active ✓</span>
          </div>
        </div>
      </div>

      {/* Dynamic Readiness Score Ring & Telemetry Meter */}
      <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              EXPORT READINESS INDEX
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black font-serif text-white font-mono transition-all">
                {score}
              </span>
              <span className="text-sm font-bold text-slate-500">/ 100</span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md font-mono transition-colors ${
                  score >= 85 ? 'text-emerald-400 bg-emerald-500/15' : 'text-orange-400 bg-orange-500/15'
                }`}
              >
                {score >= 85 ? 'CERTIFIED PASS' : 'BLOCKERS DETECTED'}
              </span>
            </div>
          </div>

          {/* Interactive Simulation Button */}
          <button
            type="button"
            onClick={handleToggleResolve}
            disabled={isSimulating}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm ${
              isResolved
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                : 'bg-orange-600 hover:bg-orange-500 text-white border-orange-500 shadow-orange-600/30 animate-pulse-subtle'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isResolved ? 'Re-Audit Blockers' : 'Resolve Blocker (Simulate)'}</span>
          </button>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              score >= 85
                ? 'bg-linear-to-r from-emerald-500 via-teal-400 to-emerald-300'
                : 'bg-linear-to-r from-orange-500 via-amber-500 to-yellow-400'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Blocker Details Box */}
        <div
          className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
            isResolved
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
              : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              {isResolved ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>0 Critical Blockers — Cleared for LEO & Vessel Staging</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>1 Dispatch Blocker Active: {corridor.blockerTitle}</span>
                </>
              )}
            </span>
          </div>
          <p className="text-[11px] opacity-80 leading-relaxed font-sans">
            {isResolved ? corridor.blockerResolution : corridor.blockerDesc}
          </p>
        </div>

        {/* 4 Micro-Audit Pillar Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate text-slate-300">1. GST & IEC</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate text-slate-300">2. CEPA Origin</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
            {isResolved ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            <span className={`truncate ${isResolved ? 'text-slate-300' : 'text-amber-300 font-bold'}`}>
              3. Lab Certificate
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate text-slate-300">4. Carrier Slot</span>
          </div>
        </div>
      </div>

      {/* Primary CTA Inside Command Center */}
      <div className="space-y-2 pt-1">
        {isLoggedIn ? (
          <Link
            href="/dashboard"
            className="block w-full py-3.5 text-center bg-linear-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-orange-600/30 cursor-pointer flex items-center justify-center gap-2 group"
          >
            <span>Open MSME Exporter Command Center</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : (
          <Link
            href="/login"
            className="block w-full py-3.5 text-center bg-linear-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-orange-600/30 cursor-pointer flex items-center justify-center gap-2 group"
          >
            <span>Sign In to Audit Your Active Cargo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
          <span>ICEGATE &bull; DGFT &bull; CBIC Synced</span>
          <span>Zero Demurrage Risk Guarantee</span>
        </div>
      </div>
    </div>
  );
}
