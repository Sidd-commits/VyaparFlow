'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

interface CorridorOption {
  id: string;
  originHub: string;
  state: string;
  productName: string;
  hsCode: string;
  category: string;
  destination: string;
  destinationCountry: string;
  transitMode: 'Ocean' | 'Air';
  transitDays: string;
  dutyRate: string;
  cepaStatus: string;
  readinessScore: number;
  mandatoryDocs: string[];
  blockersCount: number;
  highlight: string;
}

const CORRIDOR_PRESETS: CorridorOption[] = [
  {
    id: 'nashik-dubai',
    originHub: 'Nashik Agro-Logistics Hub',
    state: 'Maharashtra',
    productName: 'Sonaka Fresh Table Grapes',
    hsCode: '0806.10.00',
    category: 'Perishable Agriculture',
    destination: 'Jebel Ali Port, Dubai',
    destinationCountry: 'United Arab Emirates',
    transitMode: 'Ocean',
    transitDays: '4–5 Days (JNPT → Jebel Ali)',
    dutyRate: '0% (Duty-Free under India-UAE CEPA)',
    cepaStatus: 'CEPA COO Form 1 Verified',
    readinessScore: 82,
    mandatoryDocs: ['APEDA Phytosanitary Certificate', 'Certificate of Origin (CEPA)', 'Cold Chain Temp Log', 'Commercial Invoice'],
    blockersCount: 1,
    highlight: 'Reefer Container Pre-Cooling SLA Active',
  },
  {
    id: 'surat-rotterdam',
    originHub: 'Surat Textile Export Zone',
    state: 'Gujarat',
    productName: 'Woven Synthetic & Silk Fabrics',
    hsCode: '5407.52.00',
    category: 'Textiles & Apparel',
    destination: 'Port of Rotterdam',
    destinationCountry: 'European Union (Netherlands)',
    transitMode: 'Ocean',
    transitDays: '21–23 Days (Hazira → Rotterdam)',
    dutyRate: '4.8% (REX / EUR.1 Self-Certified)',
    cepaStatus: 'EU REACH Chemical Safety Cleared',
    readinessScore: 76,
    mandatoryDocs: ['REX Statement on Invoice', 'OEKO-TEX Standard 100', 'Packing List with Net/Gross KGs', 'Bill of Lading'],
    blockersCount: 2,
    highlight: 'Zero Hazardous Azo Dyes Lab Certified',
  },
  {
    id: 'morbi-usa',
    originHub: 'Morbi Ceramic Cluster',
    state: 'Gujarat',
    productName: 'Polished Vitrified Porcelain Tiles',
    hsCode: '6907.21.00',
    category: 'Building Materials',
    destination: 'Long Beach Port, California',
    destinationCountry: 'United States',
    transitMode: 'Ocean',
    transitDays: '28–30 Days (Mundra → Long Beach)',
    dutyRate: '3.2% MFN + Section 301 Exemption',
    cepaStatus: 'US Customs ISF 10+2 Pre-Filing',
    readinessScore: 90,
    mandatoryDocs: ['ISF 10+2 Security Filing', 'ISPM-15 Heat-Treated Wooden Pallet Cert', 'Commercial Invoice', 'Customs Entry 7501'],
    blockersCount: 0,
    highlight: 'Green Channel Customs Cleared',
  },
  {
    id: 'pune-frankfurt',
    originHub: 'Pune Automotive Engineering Hub',
    state: 'Maharashtra',
    productName: 'CNC Precision Aluminum Transmission Housings',
    hsCode: '8708.40.00',
    category: 'Engineering & Auto-Components',
    destination: 'Frankfurt CargoCity',
    destinationCountry: 'Germany',
    transitMode: 'Air',
    transitDays: '16 Hours (BOM Air Cargo → FRA)',
    dutyRate: '0% (Automotive Parts GSP / MFN)',
    cepaStatus: 'IATF 16949 / ISO 9001 Compliant',
    readinessScore: 94,
    mandatoryDocs: ['Air Waybill (Master AWB)', 'PPAP Quality Inspection Report', 'Non-DG Air Declaration', 'Commercial Invoice'],
    blockersCount: 0,
    highlight: 'Priority Air Freight Express Slot Confirmed',
  },
  {
    id: 'tirupur-uk',
    originHub: 'Tirupur Knitwear Cluster',
    state: 'Tamil Nadu',
    productName: 'Organic Cotton Knitted Garments',
    hsCode: '6109.10.00',
    category: 'Apparel & Ready-to-Wear',
    destination: 'Port of Felixstowe, London',
    destinationCountry: 'United Kingdom',
    transitMode: 'Ocean',
    transitDays: '20–22 Days (Chennai → Felixstowe)',
    dutyRate: '0% under Developing Countries Trading Scheme (DCTS)',
    cepaStatus: 'GOTS Organic Chain of Custody Cleared',
    readinessScore: 88,
    mandatoryDocs: ['GOTS Organic Transaction Certificate', 'UK Customs Declaration Service (CDS)', 'Detailed Carton Packing List', 'COO'],
    blockersCount: 1,
    highlight: 'Barcode Scanning & EDI Filing Active',
  },
];

export default function LandingInteractiveShowcase({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('nashik-dubai');
  const [activeTab, setActiveTab] = useState<'exporter' | 'forwarder' | 'lab' | 'customs'>('exporter');

  const selectedCorridor = CORRIDOR_PRESETS.find((c) => c.id === selectedCorridorId) || CORRIDOR_PRESETS[0];

  return (
    <div className="space-y-16">
      {/* 1. INTERACTIVE EXPORT CORRIDOR & READINESS SIMULATOR */}
      <section className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Interactive Simulator</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-tight">
                Simulate Your Cross-Border Export Readiness
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Select an Indian manufacturing hub below to simulate real-time HS chapter classification, Bilateral Trade Agreement tariffs (CEPA/DCTS), mandatory documentation, and readiness scores.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-300 font-medium">Deterministic Engine Live</span>
            </div>
          </div>

          {/* Corridor Selection Pills */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Real-World Indian Trade Corridor:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {CORRIDOR_PRESETS.map((corridor) => (
                <button
                  key={corridor.id}
                  type="button"
                  onClick={() => setSelectedCorridorId(corridor.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedCorridorId === corridor.id
                      ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-600/30 scale-[1.02]'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block truncate">
                      {corridor.state}
                    </span>
                    <span className="text-xs font-extrabold block truncate mt-0.5">
                      {corridor.originHub.split(' ')[0]} → {corridor.destination.split(' ')[0]}
                    </span>
                  </div>
                  <span className="text-[10px] opacity-75 mt-2 truncate block">
                    {corridor.productName.split(' ').slice(0, 2).join(' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Simulation Results Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950/70 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
            {/* Left: Corridor Specs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                    {selectedCorridor.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-serif mt-0.5">
                    {selectedCorridor.productName}
                  </h3>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-orange-300">
                  HS: <strong>{selectedCorridor.hsCode}</strong>
                </div>
              </div>

              {/* Origin to Destination Route Banner */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Origin Manufacturing Hub</span>
                  <p className="font-bold text-slate-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    {selectedCorridor.originHub} ({selectedCorridor.state})
                  </p>
                </div>

                <div className="hidden sm:flex items-center text-slate-600 px-2">
                  <ArrowRight className="w-4 h-4 text-orange-500" />
                </div>

                <div className="space-y-0.5 sm:text-right">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Destination Port & Market</span>
                  <p className="font-bold text-slate-200 flex sm:justify-end items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    {selectedCorridor.destination}
                  </p>
                </div>
              </div>

              {/* Transit & Tariff Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-orange-400" />
                    Logistics & Transit Lead Time
                  </span>
                  <p className="text-xs font-bold text-white">
                    {selectedCorridor.transitDays}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Mode: <strong className="text-slate-200">{selectedCorridor.transitMode} Freight</strong>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Bilateral Trade Tariff & Duty
                  </span>
                  <p className="text-xs font-bold text-emerald-400">
                    {selectedCorridor.dutyRate}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    Status: <strong className="text-slate-200">{selectedCorridor.cepaStatus}</strong>
                  </p>
                </div>
              </div>

              {/* Mandatory Checklist Items */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                  Mandatory Compliance & Document Vault Pre-Requisites:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedCorridor.mandatoryDocs.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Readiness Score Ring & CTA */}
            <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-linear-to-b from-slate-900 to-slate-950 border border-slate-800/90 space-y-6">
              <div className="space-y-4 text-center sm:text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Pre-Shipment Readiness Audit
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                      selectedCorridor.readinessScore >= 85
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                    }`}
                  >
                    {selectedCorridor.readinessScore >= 85 ? 'Dispatch Ready' : 'Blockers Active'}
                  </span>
                </div>

                {/* Score Progress Visual */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-4xl sm:text-5xl font-black font-serif text-white">
                      {selectedCorridor.readinessScore}
                      <span className="text-xl font-normal text-slate-500"> / 100</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Weighted Score
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedCorridor.readinessScore >= 85
                          ? 'bg-linear-to-r from-emerald-500 to-teal-400'
                          : 'bg-linear-to-r from-orange-500 to-amber-400'
                      }`}
                      style={{ width: `${selectedCorridor.readinessScore}%` }}
                    />
                  </div>
                </div>

                {/* Blocker Alert Box */}
                <div
                  className={`p-3 rounded-xl border text-xs text-left ${
                    selectedCorridor.blockersCount === 0
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                      : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                  }`}
                >
                  <p className="flex items-center gap-1.5 font-bold">
                    {selectedCorridor.blockersCount === 0 ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        0 Dispatch Blockers — Ready for Port Gate-In
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        {selectedCorridor.blockersCount} Critical Requirement{selectedCorridor.blockersCount > 1 ? 's' : ''} Pending
                      </>
                    )}
                  </p>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {selectedCorridor.highlight}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Link
                  href={isLoggedIn ? '/dashboard' : '/login'}
                  className="w-full py-3.5 px-4 rounded-xl bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>{isLoggedIn ? 'Manage in Exporter Dashboard' : 'Open Full Readiness Engine'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-[10px] text-center text-slate-500">
                  Calculated using verified CBIC, DGFT, and Destination Customs Rules.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 4-PILLAR ECOSYSTEM INTERACTIVE WORKFLOW */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-orange-600" />
            <span>Integrated Trade Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-serif">
            One Single Operating Canvas for All Trade Stakeholders
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Eliminate isolated WhatsApp chats, fragmented email chains, and customs detention penalties.
          </p>
        </div>

        {/* Persona Tabs */}
        <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl max-w-3xl mx-auto border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('exporter')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'exporter'
                ? 'bg-white text-orange-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>1. MSME Exporter</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('forwarder')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'forwarder'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Ship className="w-4 h-4" />
            <span>2. Freight Forwarder</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lab')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'lab'
                ? 'bg-white text-emerald-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>3. Testing Laboratory</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('customs')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'customs'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>4. Customs CHA Agent</span>
          </button>
        </div>

        {/* Tab Detail Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xl max-w-5xl mx-auto">
          {activeTab === 'exporter' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold">
                  <span>🏢 Indian MSME Manufacturer</span>
                </div>
                <h3 className="text-2xl font-bold font-serif text-slate-900">
                  Factory-Floor Readiness & Auto-Generated Export Documentation
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Enter your product once. VyaparFlow matches HS codes, audits compliance requirements against target foreign customs regulations, and generates authentic Commercial Invoices and Packing Lists in 1 click.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>0–100 Explainable Score with zero hidden regulatory traps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Direct carrier quote comparison across major shipping lines</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Real-time milestone tracking from factory dispatch to ocean vessel</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Live MSME Command Widget</span>
                  <span className="text-orange-400 font-bold">Palghar & Pan-India</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold">Organic Mango Pulp → Rotterdam</span>
                    <span className="text-emerald-400 font-bold">92% Ready</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[92%]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/60">
                    <span className="text-slate-400 block">HS Code</span>
                    <strong className="text-white">2008.99.11</strong>
                  </div>
                  <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/60">
                    <span className="text-slate-400 block">EU Tariff</span>
                    <strong className="text-emerald-400">0% REX Preferential</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'forwarder' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                  <span>🚢 Freight Forwarder & Logistics Partner</span>
                </div>
                <h3 className="text-2xl font-bold font-serif text-slate-900">
                  Verified Cargo Demand & Guaranteed Lead Times
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Bid transparently on pre-cleared MSME export shipments with verified weights, dimensions, and HS classifications. Fulfill shipping line bookings, container gate-in, and vessel tracking.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Access pre-verified export bookings from Pan-India clusters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Zero cargo detention risk with pre-vetted compliance checks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Real-time milestone sync with GPS and EDI updates</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Provider Fulfillment Console</span>
                  <span className="text-blue-400 font-bold">SwiftGlobe Logistics</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center text-xs">
                  <div>
                    <strong className="block text-white">40ft HC Reefer Container</strong>
                    <span className="text-slate-400 text-[11px]">JNPT Port → Jebel Ali</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                    ₹1,24,000
                  </span>
                </div>
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300">
                  ✓ Booking Confirmed | Container Picked Up from Nashik Packhouse
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lab' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <span>🔬 NABL & APEDA Accredited Laboratory</span>
                </div>
                <h3 className="text-2xl font-bold font-serif text-slate-900">
                  Digital Certificate Issuance & Quality Assurance
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Receive direct sample testing requests from MSME manufacturers. Upload digital test certificates, chemical safety reports (EU REACH/RoHS), and pesticide residue analysis directly to the shipment audit vault.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>NABL-accredited digital report uploads with tamper-proof IDs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Automatic readiness score unlock upon test pass</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Direct integration with customs e-Sanchit vault</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Quality Testing Portal</span>
                  <span className="text-emerald-400 font-bold">CertifyLab India</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>Phytosanitary & Pesticide Residue</span>
                    <span className="text-emerald-400">PASSED</span>
                  </div>
                  <p className="text-[11px] text-slate-400">MRL compliance verified under EU Regulation 396/2005</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 text-xs text-slate-300 flex items-center justify-between">
                  <span>Certificate #NABL-2026-8941</span>
                  <span className="text-emerald-400 font-bold">Vault Synced ✓</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold">
                  <span>🛡️ Licensed Customs House Agent (CHA)</span>
                </div>
                <h3 className="text-2xl font-bold font-serif text-slate-900">
                  Shipping Bill Filing & Port Customs Clearance
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Execute ICEGATE Shipping Bill filings, claim duty drawback / RoDTEP incentives, and coordinate port customs clearance with zero manual data re-entry.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>ICEGATE Shipping Bill generation with pre-validated data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Automated RoDTEP & Duty Drawback incentive calculation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Let Export Order (LEO) timestamp audit trail</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Customs Clearance Desk</span>
                  <span className="text-orange-400 font-bold">Apex CHA Associates</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>Shipping Bill #SB-98214-JNPT</span>
                    <span className="text-emerald-400">LEO ISSUED</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Port of Loading: Jawaharlal Nehru Port (JNPT), Nhava Sheva</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 text-xs text-slate-300 flex items-center justify-between">
                  <span>RoDTEP Rebate: <strong>1.4%</strong></span>
                  <span className="text-emerald-400 font-bold">Customs Cleared ✓</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. NATIONAL IMPACT METRICS */}
      <section className="bg-linear-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-3xl p-8 sm:p-12 text-white shadow-2xl space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black font-serif tracking-tight">
            Built for India&apos;s $1 Trillion Export Economy
          </h2>
          <p className="text-white/90 text-sm">
            Empowering grassroots manufacturers across Maharashtra, Gujarat, Tamil Nadu, and national industrial corridors.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
            <span className="text-3xl sm:text-4xl font-black font-serif block">100%</span>
            <span className="text-xs uppercase tracking-wider font-semibold opacity-90 mt-1 block">
              Deterministic Rules
            </span>
            <span className="text-[10px] opacity-75 mt-0.5 block">Zero AI Hallucinations</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
            <span className="text-3xl sm:text-4xl font-black font-serif block">&lt; 3 Min</span>
            <span className="text-xs uppercase tracking-wider font-semibold opacity-90 mt-1 block">
              Readiness Audit
            </span>
            <span className="text-[10px] opacity-75 mt-0.5 block">Instant HS & Duty Lookup</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
            <span className="text-3xl sm:text-4xl font-black font-serif block">0–100</span>
            <span className="text-xs uppercase tracking-wider font-semibold opacity-90 mt-1 block">
              Compliance Scoring
            </span>
            <span className="text-[10px] opacity-75 mt-0.5 block">Explainable Blockers</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
            <span className="text-3xl sm:text-4xl font-black font-serif block">1-Click</span>
            <span className="text-xs uppercase tracking-wider font-semibold opacity-90 mt-1 block">
              Document Vault
            </span>
            <span className="text-[10px] opacity-75 mt-0.5 block">Commercial Invoice & Packing List</span>
          </div>
        </div>
      </section>
    </div>
  );
}
