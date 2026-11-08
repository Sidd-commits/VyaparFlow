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
  Check,
  X,
  FileCheck2,
  Scale,
  Clock,
  Coins,
  ShieldAlert,
  ArrowUpRight,
  Workflow,
  Eye,
  Terminal,
  ChevronDown,
} from 'lucide-react';

interface ScrollStoryProps {
  isLoggedIn: boolean;
}

interface CommodityData {
  title: string;
  category: string;
  corridor: string;
  destinationCountry: string;
  fta: string;
  standardDuty: string;
  prefDuty: string;
  dutySaving: string;
  keyCert: string;
  leadTime: string;
}

const COMMODITIES: CommodityData[] = [
  {
    title: 'Fresh Table Grapes',
    category: 'Fresh Produce',
    corridor: 'Nashik (MH) → Dubai (UAE)',
    destinationCountry: 'United Arab Emirates',
    fta: 'India-UAE CEPA',
    standardDuty: '5.0%',
    prefDuty: '0.0%',
    dutySaving: '₹1,48,000 / 40ft Reefer',
    keyCert: 'APEDA Phytosanitary & NABL Residue Pass',
    leadTime: '4–5 Days via JNPT Port',
  },
  {
    title: 'Woven Synthetic Fabrics',
    category: 'Textiles & Apparel',
    corridor: 'Surat (GJ) → Rotterdam (EU)',
    destinationCountry: 'Netherlands',
    fta: 'EU REX Preferential Trade',
    standardDuty: '8.0%',
    prefDuty: '4.8%',
    dutySaving: '₹2,24,000 / 40ft Container',
    keyCert: 'OEKO-TEX Standard 100 & EU REACH Safety',
    leadTime: '21–23 Days via Hazira Port',
  },
  {
    title: 'Vitrified Porcelain Tiles',
    category: 'Ceramics & Building Materials',
    corridor: 'Morbi (GJ) → Long Beach (USA)',
    destinationCountry: 'United States',
    fta: 'US CBP Duty Exemption',
    standardDuty: '28.5%',
    prefDuty: '3.2%',
    dutySaving: '₹8,90,000 / 2 Containers',
    keyCert: 'ISPM-15 Heat-Treated Pallet Fumigation',
    leadTime: '28–30 Days via Mundra Port',
  },
  {
    title: 'Precision Auto Housings',
    category: 'Engineering & Automotive',
    corridor: 'Pune (MH) → Frankfurt (DE)',
    destinationCountry: 'Germany',
    fta: 'GSP / IATF Quality Clearance',
    standardDuty: '4.5%',
    prefDuty: '0.0%',
    dutySaving: '₹3,15,000 / Air Cargo Pallet',
    keyCert: 'IATA Non-DG Quality & PPAP Inspection',
    leadTime: '16 Hours via Mumbai Air Cargo',
  },
];

export default function ScrollStorySections({ isLoggedIn }: ScrollStoryProps) {
  const [selectedCommodity, setSelectedCommodity] = useState<number>(0);
  const [activeDocPreview, setActiveDocPreview] = useState<'invoice' | 'packing' | 'coo' | 'shippingBill'>('invoice');
  const [activePersona, setActivePersona] = useState<'msme' | 'forwarder' | 'lab' | 'cha'>('msme');

  const currentCommodity = COMMODITIES[selectedCommodity];

  return (
    <div className="space-y-24 md:space-y-36">
      {/* ─────────────────────────────────────────────────────────────
          STORY 01 — THE EXPORT CRISIS VS THE OPERATING SYSTEM
      ───────────────────────────────────────────────────────────── */}
      <section id="overview" className="scroll-mt-24 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 text-orange-900 border border-orange-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-orange-600" />
            <span>01 / Overview</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 font-sans tracking-tight leading-tight">
            Cross-Border Logistics Without the Chaos.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Indian MSMEs produce world-class goods. But cross-border shipping often gets delayed by isolated government portals, manual document re-entry, and unexpected compliance checks. VyaparFlow brings clarity to the entire journey.
          </p>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left: Traditional Reality */}
          <div className="rounded-3xl bg-white border border-rose-200/90 p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
            <div className="space-y-1.5 pt-1">
              <span className="text-xs uppercase tracking-wider text-rose-600 font-bold">
                Traditional Disconnected Process
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-sans text-slate-900">
                14 Isolated Portals &amp; Endless Follow-ups
              </h3>
            </div>

            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100">
                <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-semibold">Fragmented Government Systems</strong>
                  <span className="text-slate-600">
                    Separate logins and filings across DGFT, ICEGATE, FSSAI, APEDA, and bank AD-Codes.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100">
                <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-semibold">Port Gate-in Delays</strong>
                  <span className="text-slate-600">
                    A single missing lab parameter or documentation mismatch can hold containers at port terminals.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100">
                <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-semibold">Missed Trade Treaty Savings</strong>
                  <span className="text-slate-600">
                    Exporters routinely overpay import duties because bilateral FTA preferential benefits are complex to calculate manually.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100">
                <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-semibold">Scattered Document Versions</strong>
                  <span className="text-slate-600">
                    Dozens of conflicting PDF versions exchanged over email between factory, forwarder, and customs broker.
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Right: The VyaparFlow Platform */}
          <div className="rounded-3xl bg-slate-950 border border-slate-800 text-white p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="space-y-1.5 pt-1">
              <span className="text-xs uppercase tracking-wider text-orange-400 font-bold">
                VyaparFlow Platform
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-sans text-white">
                One Single Source of Truth for Global Trade
              </h3>
            </div>

            <ul className="space-y-3 text-xs text-slate-200">
              <li className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-semibold">Automated Compliance Rules</strong>
                  <span className="text-slate-400">
                    Select your commodity once. The platform automatically maps statutory guidelines, destination standards, and mandatory lab tests.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-semibold">0–100 Real-Time Readiness Score</strong>
                  <span className="text-slate-400">
                    Detect and resolve every compliance item before cargo leaves your factory premises.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-semibold">1-Click Compliant Document Vault</strong>
                  <span className="text-slate-400">
                    Generate export invoices, packing lists, and certificates of origin without repeated manual typing.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-semibold">Shared Partner Workspace</strong>
                  <span className="text-slate-400">
                    MSME, freight forwarder, testing lab, and customs broker collaborate on one unified consignment record.
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          STORY 02 — TARIFFS & FREE TRADE AGREEMENTS SHOWCASE
      ───────────────────────────────────────────────────────────── */}
      <section id="regulatory" className="scroll-mt-24 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5 text-orange-600" />
            <span>02 / Tariffs &amp; FTAs</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 font-sans tracking-tight leading-tight">
            Instant Tariffs &amp; Free Trade Duty Savings.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Check import tariffs and discover bilateral trade treaty savings across India&apos;s primary export corridors. Verified against CBIC schedules and DGFT Foreign Trade Policy.
          </p>
        </div>

        {/* Commodity Showcase Card */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600 block">
                Trade Agreement Simulator
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-sans text-slate-900 mt-0.5">
                Select an Indian Export Commodity to Inspect Duty Savings
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-600 font-medium">Bilateral Trade Treaties Active</span>
            </div>
          </div>

          {/* Clean Commodity Selector Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {COMMODITIES.map((item, idx) => {
              const active = selectedCommodity === idx;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setSelectedCommodity(idx)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/25'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-orange-200 hover:bg-orange-50/20'
                  }`}
                >
                  <strong className="text-sm block font-bold truncate">{item.title}</strong>
                  <span className={`text-xs block mt-1 truncate ${active ? 'text-orange-100' : 'text-slate-500'}`}>
                    {item.corridor.split('→')[1]?.trim() || item.destinationCountry}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Product Details & Duty Grid */}
          <div className="bg-[#FAF9F6] rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <h4 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {currentCommodity.title}
                </h4>
                <p className="text-sm text-slate-600 mt-0.5">
                  Corridor: <strong>{currentCommodity.corridor}</strong>
                </p>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-xs font-semibold text-orange-900 shadow-2xs">
                Treaty: <strong className="text-orange-700">{currentCommodity.fta}</strong>
              </div>
            </div>

            {/* 3-Column Duty Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500 block">
                  Standard Import Tariff
                </span>
                <span className="text-3xl font-extrabold text-slate-800 font-mono">
                  {currentCommodity.standardDuty}
                </span>
                <span className="text-xs text-slate-500 block">Standard base rate without treaty</span>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1 shadow-2xs">
                <span className="text-xs font-semibold text-emerald-800 block">
                  Preferential FTA Tariff
                </span>
                <span className="text-3xl font-extrabold text-emerald-700 font-mono">
                  {currentCommodity.prefDuty}
                </span>
                <span className="text-xs text-emerald-800 font-semibold block">Unlocked via trade certification</span>
              </div>

              <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200 space-y-1 shadow-2xs">
                <span className="text-xs font-semibold text-orange-900 block">
                  Direct Net Duty Savings
                </span>
                <span className="text-3xl font-extrabold text-orange-600 font-mono">
                  {currentCommodity.dutySaving.split('/')[0]}
                </span>
                <span className="text-xs text-orange-800 font-semibold block">Direct exporter margin benefit</span>
              </div>
            </div>

            {/* Statutory Requirement Banner */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong className="block text-slate-900">Mandatory Foreign Customs Pre-Requisite:</strong>
                  <span className="text-slate-600">{currentCommodity.keyCert}</span>
                </div>
              </div>
              <span className="text-slate-500 text-xs shrink-0 font-medium">
                Typical Transit: {currentCommodity.leadTime}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          STORY 03 — THE 0–100 READINESS SCORE AUDIT MATRIX
      ───────────────────────────────────────────────────────────── */}
      <section id="readiness" className="scroll-mt-24 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 text-orange-900 border border-orange-200 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
            <span>03 / Readiness Index</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 font-sans tracking-tight leading-tight">
            The 0–100 Export Readiness Index.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Every shipment is evaluated across four core 25-point categories before leaving the factory. If any requirement is missing, you get an immediate resolution path.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Pillar 1 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md hover:border-orange-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center font-bold text-orange-600 text-sm">
                01
              </span>
              <span className="text-xs font-bold text-slate-500">25 Points</span>
            </div>
            <h3 className="text-lg font-bold font-sans text-slate-900">
              Enterprise &amp; Port Registrations
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Validation of GSTIN active status, 10-digit Import Export Code (IEC), Authorised Dealer (AD) Code registered with port customs, and Export Promotion Council membership.
            </p>
            <div className="pt-2 space-y-1.5 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>GSTIN &amp; IEC Automated Lookup</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>ICEGATE AD-Code Binding Check</span>
              </div>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md hover:border-orange-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center font-bold text-orange-600 text-sm">
                02
              </span>
              <span className="text-xs font-bold text-slate-500">25 Points</span>
            </div>
            <h3 className="text-lg font-bold font-sans text-slate-900">
              Product &amp; Quality Standards
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              HS classification verification, NABL lab test certificates, phytosanitary requirements, chemical safety (EU REACH/RoHS), and destination country guidelines.
            </p>
            <div className="pt-2 space-y-1.5 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>NABL Quality Report Verification</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Destination Lab Mandates Mapped</span>
              </div>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md hover:border-orange-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center font-bold text-orange-600 text-sm">
                03
              </span>
              <span className="text-xs font-bold text-slate-500">25 Points</span>
            </div>
            <h3 className="text-lg font-bold font-sans text-slate-900">
              Document Vault Completeness
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generation and validation of export Commercial Invoices (Incoterms 2020), Detailed Packing Lists (Net/Gross Weights, CBM), Certificates of Origin, and Shipping Bills.
            </p>
            <div className="pt-2 space-y-1.5 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>1-Click PDF Export Document Vault</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>e-Sanchit Upload Compatibility</span>
              </div>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md hover:border-orange-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center font-bold text-orange-600 text-sm">
                04
              </span>
              <span className="text-xs font-bold text-slate-500">25 Points</span>
            </div>
            <h3 className="text-lg font-bold font-sans text-slate-900">
              Carrier &amp; Port Handoff
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Container booking confirmation with shipping lines (Maersk, MSC, Hapag), Port CFS gate-in pass, customs broker allocation, and Let Export Order (LEO) tracking.
            </p>
            <div className="pt-2 space-y-1.5 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Multi-Carrier Quote Comparison</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Port Gate-In &amp; LEO Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          STORY 04 — AUTOMATED 1-CLICK EXPORT DOCUMENT VAULT
      ───────────────────────────────────────────────────────────── */}
      <section id="documents" className="scroll-mt-24 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5 text-orange-600" />
            <span>04 / Document Vault</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 font-sans tracking-tight leading-tight">
            1-Click Compliant Export Documents.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Eliminate hours of manual data re-typing. VyaparFlow pulls product specifications and buyer parameters to construct legally compliant cross-border trade documents with tamper-proof IDs.
          </p>
        </div>

        {/* Document Vault Interactive Previewer */}
        <div className="max-w-5xl mx-auto bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-10 space-y-8">
          {/* Top Doc Type Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveDocPreview('invoice')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeDocPreview === 'invoice'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                1. Commercial Invoice
              </button>
              <button
                type="button"
                onClick={() => setActiveDocPreview('packing')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeDocPreview === 'packing'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                2. Packing List
              </button>
              <button
                type="button"
                onClick={() => setActiveDocPreview('coo')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeDocPreview === 'coo'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                3. Certificate of Origin
              </button>
              <button
                type="button"
                onClick={() => setActiveDocPreview('shippingBill')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeDocPreview === 'shippingBill'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                4. ICEGATE Shipping Bill
              </button>
            </div>

            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Auto-Validation Passed
            </span>
          </div>

          {/* Interactive Document Layout */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 text-xs">
            {activeDocPreview === 'invoice' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-orange-400 font-bold block text-sm">COMMERCIAL INVOICE #EXP-2026-0941</span>
                    <span className="text-slate-400 text-xs mt-0.5 block">Incoterms 2020: CIF Jebel Ali Port, Dubai (UAE)</span>
                  </div>
                  <div className="text-right text-slate-400 text-xs">
                    <span>Date: 11-SEP-2026</span>
                    <span className="block text-emerald-400 font-medium">Currency: USD ($)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 uppercase font-bold text-[10px] block">Exporter / Consignor</span>
                    <strong className="text-white block font-semibold">Apex Agro &amp; Industrial Exports Ltd.</strong>
                    <span className="text-slate-400 block">GSTIN: 27AABCA1234F1Z8 | IEC: 0312345678</span>
                    <span className="text-slate-400 block">Nashik Hub, Maharashtra, India</span>
                  </div>
                  <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 uppercase font-bold text-[10px] block">Buyer / Consignee</span>
                    <strong className="text-white block font-semibold">Emirates Global Fresh Produce FZ-LLC</strong>
                    <span className="text-slate-400 block">TRN: 100234981200003</span>
                    <span className="text-slate-400 block">Al Aweer Fruit Market, Dubai, UAE</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[400px]">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-2">HS Code</th>
                        <th className="pb-2">Item Description</th>
                        <th className="pb-2">Qty</th>
                        <th className="pb-2">Unit Price</th>
                        <th className="pb-2 text-right">Total (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      <tr>
                        <td className="py-2 text-orange-400 font-mono">0806.10.00</td>
                        <td className="py-2">Sonaka Fresh Table Grapes (5kg Boxes)</td>
                        <td className="py-2">4,800 Boxes</td>
                        <td className="py-2">$8.50</td>
                        <td className="py-2 text-right font-bold text-white font-mono">$40,800.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center pt-2 text-xs text-slate-400 border-t border-slate-800">
                  <span>CEPA Preferential Tariff: <strong className="text-emerald-400">0% Duty</strong> applied</span>
                  <span className="text-white font-bold text-sm">Total CIF Value: $40,800.00</span>
                </div>
              </div>
            )}

            {activeDocPreview === 'packing' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-orange-400 font-bold block text-sm">STANDARDIZED EXPORT PACKING LIST #PL-9812</span>
                    <span className="text-slate-400 text-xs mt-0.5 block">Container: 1x40ft HC Reefer | Pallet Count: 20 Euro Pallets</span>
                  </div>
                  <div className="text-right text-slate-400 text-xs">
                    <span>Total Packages: 4,800 Cartons</span>
                    <span className="block text-emerald-400 font-medium">Net: 24,000 KG | Gross: 26,400 KG</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400 border-b border-slate-800/60 pb-1">
                    <span>Pallet Range: #PAL-01 to #PAL-20</span>
                    <span>240 Boxes per Pallet (5kg Corrugated Food-Grade)</span>
                  </div>
                  <p className="text-slate-300">
                    Pre-Cooling Specification: +0.5°C to +1.0°C Core Fruit Temperature Maintained. Humidity: 90–95% RH.
                  </p>
                  <p className="text-emerald-400 font-medium">
                    ✓ ISPM-15 Heat-Treated Pallet Stamps Verified. Zero Wooden Pest Infestation.
                  </p>
                </div>
              </div>
            )}

            {activeDocPreview === 'coo' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-orange-400 font-bold block text-sm">PREFERENTIAL CERTIFICATE OF ORIGIN (CEPA FORM 1)</span>
                    <span className="text-slate-400 text-xs mt-0.5 block">Issuing Authority: Directorate General of Foreign Trade (DGFT)</span>
                  </div>
                  <div className="text-right text-emerald-400 text-xs font-medium">
                    <span>Status: Digitally Signed &amp; QR Encoded</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <p className="text-slate-200">
                    Rule of Origin Criteria: <strong>Wholly Obtained (WO)</strong> in India under Article 3.3 of India-UAE Comprehensive Economic Partnership Agreement (CEPA).
                  </p>
                  <p className="text-slate-400">
                    Verification Code: 7F9A-88C4-2B10 (Verifiable directly on UAE Customs portal).
                  </p>
                </div>
              </div>
            )}

            {activeDocPreview === 'shippingBill' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-orange-400 font-bold block text-sm">ICEGATE SHIPPING BILL #SB-98214-JNPT</span>
                    <span className="text-slate-400 text-xs mt-0.5 block">Customs Station: INNSA1 (Nhava Sheva, JNPT Port)</span>
                  </div>
                  <div className="text-right text-emerald-400 text-xs font-medium">
                    <span>Let Export Order (LEO) Status: GRANTED</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>FOB Value: ₹33,86,400.00</div>
                    <div>RoDTEP Incentive: 1.4% (₹47,409.60)</div>
                    <div>Port of Loading: JNPT (Nhava Sheva)</div>
                    <div>Port of Discharge: Jebel Ali (Dubai)</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          STORY 05 — SHIPMENT MILESTONE TELEMETRY
      ───────────────────────────────────────────────────────────── */}
      <section id="shipments" className="scroll-mt-24 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 text-orange-900 border border-orange-200 text-xs font-semibold">
            <Truck className="w-3.5 h-3.5 text-orange-600" />
            <span>05 / Consignment Tracking</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 font-sans tracking-tight leading-tight">
            Factory Floor to Global Destination.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Eliminate blind spots. VyaparFlow syncs every logistics milestone from factory dispatch to port gate-in, customs LEO, ocean transit, and port arrival.
          </p>
        </div>

        {/* Responsive Milestone Stepper */}
        <div className="max-w-6xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
            {/* Stage 1 */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>01. FACTORY</span>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <strong className="block text-xs text-slate-900">Cargo Picked Up</strong>
              <p className="text-[11px] text-slate-600">Packhouse weighment verified</p>
            </div>

            {/* Stage 2 */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>02. INLAND ICD</span>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <strong className="block text-xs text-slate-900">Rail Corridor</strong>
              <p className="text-[11px] text-slate-600">Transit to JNPT Port Nhava Sheva</p>
            </div>

            {/* Stage 3 */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>03. PORT GATE-IN</span>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <strong className="block text-xs text-slate-900">CFS Scanned</strong>
              <p className="text-[11px] text-slate-600">Container gated-in at port</p>
            </div>

            {/* Stage 4 */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>04. CUSTOMS LEO</span>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <strong className="block text-xs text-slate-900">Let Export Order</strong>
              <p className="text-[11px] text-slate-600">ICEGATE e-Sanchit clear</p>
            </div>

            {/* Stage 5 */}
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-orange-800">
                <span>05. OCEAN TRANSIT</span>
                <Ship className="w-3.5 h-3.5 text-orange-600" />
              </div>
              <strong className="block text-xs text-slate-900">Vessel In-Transit</strong>
              <p className="text-[11px] text-slate-600">Arabian Sea Corridor (ETA 48h)</p>
            </div>

            {/* Stage 6 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 opacity-75">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>06. BERTH &amp; OUT</span>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <strong className="block text-xs text-slate-700">Foreign Customs</strong>
              <p className="text-[11px] text-slate-500">Jebel Ali Port UAE Delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          STORY 06 — 4-PILLAR COLLABORATIVE ECOSYSTEM CANVAS
      ───────────────────────────────────────────────────────────── */}
      <section id="ecosystem" className="scroll-mt-24 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold">
            <Workflow className="w-3.5 h-3.5 text-orange-600" />
            <span>06 / Trade Partners</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 font-sans tracking-tight leading-tight">
            One Single Operating Canvas.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Eliminate disconnected silos. MSME manufacturers, licensed freight forwarders, NABL-accredited test laboratories, and customs brokers all interact with the same verified shipment dossier.
          </p>
        </div>

        {/* Persona Switcher Tabs */}
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActivePersona('msme')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activePersona === 'msme'
                  ? 'bg-white text-orange-600 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>1. MSME Manufacturer</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePersona('forwarder')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activePersona === 'forwarder'
                  ? 'bg-white text-orange-600 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ship className="w-4 h-4" />
              <span>2. Freight Forwarder</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePersona('lab')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activePersona === 'lab'
                  ? 'bg-white text-emerald-600 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>3. Testing Laboratory</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePersona('cha')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activePersona === 'cha'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>4. Customs Broker</span>
            </button>
          </div>

          {/* Persona Detail Cards */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xl">
            {activePersona === 'msme' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-600 shrink-0" />
                    <span>ROLE: MSME EXPORTER</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-sans text-slate-900 tracking-tight leading-snug">
                    Factory Readiness &amp; Instant Documentation
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Input your product specifications once. The engine immediately validates compliance requirements against foreign customs mandates, calculates FTA duty advantages, and auto-generates Commercial Invoices and Packing Lists.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Explainable 0–100 Readiness Score with zero hidden traps</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Compare transparent ocean and air freight quotes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>End-to-end milestone tracking across Indian trade corridors</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-3">
                    <span className="font-bold text-slate-400">ACTIVE CONSIGNMENT</span>
                    <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-800/60 text-[11px]">
                      STATUS: 92% READY
                    </span>
                  </div>
                  <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2.5">
                    <span className="text-xs font-bold block text-white">Alphonso Mango Pulp &rarr; Rotterdam (EU)</span>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[92%] rounded-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">HS Code</span>
                      <strong className="text-white block mt-0.5 font-mono">2008.99.11</strong>
                    </div>
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">EU Preferential</span>
                      <strong className="text-emerald-400 block mt-0.5 font-mono">0% REX Tariff</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePersona === 'forwarder' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-600 shrink-0" />
                    <span>ROLE: FREIGHT FORWARDER</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-sans text-slate-900 tracking-tight leading-snug">
                    Pre-Verified Bookings &amp; Reliable Dispatch
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Bid transparently on pre-cleared MSME export bookings with verified weights, dimensions, and classifications. Manage container bookings, CFS gate-in, and vessel tracking.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Direct access to verified MSME export demand across Indian clusters</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Zero cargo delay risk with pre-vetted compliance checks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Live milestone telemetry synced directly with shipping lines</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-3">
                    <span className="font-bold text-slate-400">CARRIER CONSOLE</span>
                    <span className="text-orange-400 font-bold bg-orange-950/60 px-2.5 py-0.5 rounded-md border border-orange-800/60 text-[11px]">
                      SwiftGlobe Logistics
                    </span>
                  </div>
                  <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <strong className="block text-white">40ft HC Reefer Container</strong>
                      <span className="text-slate-400 text-[11px]">JNPT Port &rarr; Jebel Ali (UAE)</span>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30 font-mono">
                      ₹1,24,000
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 font-medium">
                    ✓ Booking Confirmed | Container Dispatched from Packhouse
                  </div>
                </div>
              </div>
            )}

            {activePersona === 'lab' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>ROLE: TESTING LABORATORY</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-sans text-slate-900 tracking-tight leading-snug">
                    Digital Lab Certificates &amp; Test Reports
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Receive sample testing requests directly from MSME manufacturers. Upload digital test certificates, chemical safety reports (EU REACH/RoHS), and residue analysis straight to the shipment vault.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>NABL-accredited digital report uploads with verifiable IDs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Automatic readiness score unlock upon test certification</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Instant integration with customs e-Sanchit vault</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-3">
                    <span className="font-bold text-slate-400">QUALITY TESTING LAB</span>
                    <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-800/60 text-[11px]">
                      CertifyLab India (NABL)
                    </span>
                  </div>
                  <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold">
                      <span>Phytosanitary &amp; Pesticide Residue</span>
                      <span className="text-emerald-400 font-medium">PASSED ✓</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      MRL compliance verified under EU Regulation 396/2005
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                    <span>Cert #NABL-2026-8941</span>
                    <span className="text-emerald-400 font-bold">Vault Synced ✓</span>
                  </div>
                </div>
              </div>
            )}

            {activePersona === 'cha' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
                    <span>ROLE: CUSTOMS BROKER (CHA)</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-sans text-slate-900 tracking-tight leading-snug">
                    ICEGATE Shipping Bill Filing &amp; Port Customs
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Execute ICEGATE Shipping Bill filings, claim duty drawback and RoDTEP rebates, and coordinate port customs clearance with zero manual document reconstruction.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>ICEGATE Shipping Bill generation with pre-validated data</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Automated RoDTEP &amp; Duty Drawback rebate calculations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Let Export Order (LEO) timestamp audit trail</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-3">
                    <span className="font-bold text-slate-400">CUSTOMS DESK</span>
                    <span className="text-orange-400 font-bold bg-orange-950/60 px-2.5 py-0.5 rounded-md border border-orange-800/60 text-[11px]">
                      Apex Maritime Services
                    </span>
                  </div>
                  <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold">
                      <span>Shipping Bill #SB-98214-JNPT</span>
                      <span className="text-emerald-400 font-medium">LEO ISSUED ✓</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Port of Loading: Jawaharlal Nehru Port (JNPT), Nhava Sheva
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                    <span>RoDTEP Rebate: <strong>1.4%</strong></span>
                    <span className="text-emerald-400 font-bold">Customs Cleared ✓</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          STORY 07 — NATIONAL TRADE IMPACT METRICS
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-linear-to-r from-orange-600 via-orange-500 to-amber-600 rounded-3xl p-8 sm:p-14 text-white shadow-2xl space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-wider">
            National Trade Platform
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-sans tracking-tight">
            Built for India&apos;s Growing Export Economy
          </h2>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed">
            Empowering manufacturing clusters across Maharashtra, Gujarat, Tamil Nadu, Punjab, and national industrial trade corridors.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <span className="text-3xl sm:text-5xl font-black font-sans font-mono block">100%</span>
            <span className="text-xs uppercase tracking-wider font-bold opacity-90 mt-2 block">
              Verified Rules
            </span>
            <span className="text-[11px] opacity-75 mt-0.5 block">CBIC &amp; DGFT Aligned</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <span className="text-3xl sm:text-5xl font-black font-sans font-mono block">&lt; 3 Min</span>
            <span className="text-xs uppercase tracking-wider font-bold opacity-90 mt-2 block">
              Readiness Audit
            </span>
            <span className="text-[11px] opacity-75 mt-0.5 block">Instant HS &amp; Duty Lookup</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <span className="text-3xl sm:text-5xl font-black font-sans font-mono block">0–100</span>
            <span className="text-xs uppercase tracking-wider font-bold opacity-90 mt-2 block">
              Weighted Index
            </span>
            <span className="text-[11px] opacity-75 mt-0.5 block">Explainable Blockers</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <span className="text-3xl sm:text-5xl font-black font-sans font-mono block">1-Click</span>
            <span className="text-xs uppercase tracking-wider font-bold opacity-90 mt-2 block">
              Document Vault
            </span>
            <span className="text-[11px] opacity-75 mt-0.5 block">Invoices, Pack Lists &amp; CoO</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          STORY 08 — FINAL ENTERPRISE CTA
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-slate-950 rounded-3xl border border-slate-800 p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden text-center space-y-8">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Your Export Readiness Audit</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-sans text-white tracking-tight leading-tight">
            Ready to Take Your MSME Products to Global Markets?
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Run an instant 0–100 export readiness check. Discover bilateral FTA duty savings, identify mandatory lab tests, and generate compliant documentation today.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-8 py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-base shadow-xl shadow-orange-600/25 transition-all flex items-center gap-2.5 group cursor-pointer"
              >
                <span>Go to Your Active Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-8 py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-base shadow-xl shadow-orange-600/25 transition-all flex items-center gap-2.5 group cursor-pointer"
                >
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/login?tab=register"
                  className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-base border border-slate-700 transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <Building2 className="w-5 h-5 text-orange-400" />
                  <span>Register MSME / Provider</span>
                </Link>
              </>
            )}
          </div>

          <p className="text-xs text-slate-500 pt-4">
            No long commitments &bull; DGFT &amp; CBIC compliance aligned &bull; Made in India
          </p>
        </div>
      </section>
    </div>
  );
}