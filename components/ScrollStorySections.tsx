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

export default function ScrollStorySections({ isLoggedIn }: ScrollStoryProps) {
  // State for interactive HS / FTA engine demo
  const [selectedHSSample, setSelectedHSSample] = useState<number>(0);
  const [activeDocPreview, setActiveDocPreview] = useState<'invoice' | 'packing' | 'coo' | 'shippingBill'>('invoice');
  const [activePersona, setActivePersona] = useState<'msme' | 'forwarder' | 'lab' | 'cha'>('msme');
  const [activeCorridorTab, setActiveCorridorTab] = useState<'west' | 'south' | 'north' | 'east'>('west');

  const HS_SAMPLES = [
    {
      hs: '0806.10.00',
      title: 'Fresh Table Grapes',
      corridor: 'Nashik (MH) → Jebel Ali (UAE)',
      fta: 'India-UAE CEPA',
      standardDuty: '5.0%',
      prefDuty: '0.0%',
      dutySaving: '₹1,48,000 / 40ft Reefer',
      keyCert: 'APEDA Phytosanitary & NABL Pesticide MRL Pass',
      leadTime: '4–5 Days via JNPT',
    },
    {
      hs: '5407.52.00',
      title: 'Woven Synthetic Fabrics',
      corridor: 'Surat (GJ) → Rotterdam (EU)',
      fta: 'EU REX Self-Cert',
      standardDuty: '8.0%',
      prefDuty: '4.8%',
      dutySaving: '₹2,24,000 / 40ft Container',
      keyCert: 'OEKO-TEX Standard 100 & REACH Non-Azo',
      leadTime: '21–23 Days via Hazira',
    },
    {
      hs: '6907.21.00',
      title: 'Vitrified Porcelain Tiles',
      corridor: 'Morbi (GJ) → Long Beach (USA)',
      fta: 'US CBP Section 301 Exemption',
      standardDuty: '28.5%',
      prefDuty: '3.2%',
      dutySaving: '₹8,90,000 / 2x40ft Containers',
      keyCert: 'ISPM-15 Heat-Treated Pallet Fumigation',
      leadTime: '28–30 Days via Mundra',
    },
    {
      hs: '8708.40.00',
      title: 'CNC Aluminum Auto Parts',
      corridor: 'Pune (MH) → Frankfurt (DE)',
      fta: 'GSP / IATF 16949',
      standardDuty: '4.5%',
      prefDuty: '0.0%',
      dutySaving: '₹3,15,000 / Air Cargo Pallet',
      keyCert: 'IATA Non-DG Quality & PPAP Inspection',
      leadTime: '16 Hours via BOM Cargo',
    },
  ];

  return (
    <div className="space-y-24 md:space-y-36">
      {/* ─────────────────────────────────────────────────────────────
          STORY 01 — THE EXPORT CRISIS VS THE OPERATING SYSTEM
      ───────────────────────────────────────────────────────────── */}
      <section id="overview" className="scroll-mt-24 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100 text-orange-900 border border-orange-300 text-xs font-mono font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-orange-600" />
            <span>01 — Problem & Transformation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-serif tracking-tight leading-tight">
            The $350B Export Barrier: <br className="hidden sm:inline" />
            Fragmented Chaos vs. One Clear Operating System.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Indian MSMEs produce world-class goods. But cross-border logistics is crippled by isolated government portals, manual document re-typing, and unexpected customs detentions.
          </p>
        </div>

        {/* Side-by-Side Comparison Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left: The Broken Reality */}
          <div className="rounded-3xl bg-white border border-red-200/80 p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-red-100 border-b border-l border-red-200 text-red-800 text-[11px] font-bold font-mono uppercase tracking-wider rounded-bl-xl">
              Traditional Fragmented Reality
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono uppercase tracking-wider text-red-600 font-bold">
                Manual & Disconnected
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
                14 Isolated Portals & WhatsApp Groups
              </h3>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-700">
              <li className="flex items-start gap-3 p-3 rounded-2xl bg-red-50/50 border border-red-100">
                <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">Multi-Agency Bureaucracy</strong>
                  <span className="text-slate-600">
                    Separate logins for DGFT, ICEGATE, FSSAI, APEDA, EPC, and AD-Code Bank filings.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-2xl bg-red-50/50 border border-red-100">
                <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">Surprise Port Detention Demurrage</strong>
                  <span className="text-slate-600">
                    Missing lab test or misspelled HS code triggers $1,200/day container demurrage at JNPT/Mundra.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-2xl bg-red-50/50 border border-red-100">
                <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">Lost FTA Duty Savings</strong>
                  <span className="text-slate-600">
                    MSMEs miss 5%–28% preferential tariff benefits (CEPA, ECTA) due to complex Rules-of-Origin math.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-2xl bg-red-50/50 border border-red-100">
                <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">42 PDF Emails with CHA & Carriers</strong>
                  <span className="text-slate-600">
                    Constant document version collisions between factory, freight forwarder, and customs broker.
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Right: The VyaparFlow Operating System */}
          <div className="rounded-3xl bg-[#0B132B] border border-slate-800 text-white p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-orange-600/30 border-b border-l border-orange-500/40 text-orange-300 text-[11px] font-bold font-mono uppercase tracking-wider rounded-bl-xl">
              VyaparFlow Operating Engine
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-bold">
                Deterministic & Unified
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
                One Single Source of Truth for Global Trade
              </h3>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-200">
              <li className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Deterministic Compliance Engine</strong>
                  <span className="text-slate-400">
                    Enter product once. VyaparFlow automatically maps HS code, destination rules, and required tests.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">0–100 Real-Time Readiness Score</strong>
                  <span className="text-slate-400">
                    Detect and resolve every compliance blocker before cargo leaves your factory floor.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Automated 1-Click Document Vault</strong>
                  <span className="text-slate-400">
                    Generate export-compliant Commercial Invoices, Packing Lists, and CEPA COO with zero data re-entry.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Synchronous 4-Pillar Workspace</strong>
                  <span className="text-slate-400">
                    MSME, Freight Forwarder, NABL Lab, and Customs CHA work together on one live shipment record.
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          STORY 02 — DETERMINISTIC REGULATORY & TARIFF ENGINE
      ───────────────────────────────────────────────────────────── */}
      <section id="regulatory" className="scroll-mt-24 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-mono font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-orange-600" />
            <span>02 — Deterministic Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-serif tracking-tight leading-tight">
            100% Deterministic Rules. <br className="hidden sm:inline" />
            Zero AI Hallucinations in Customs Compliance.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            International customs does not tolerate probabilistic guessing. VyaparFlow executes deterministic logic verified against CBIC tariff schedules, DGFT Foreign Trade Policy (FTP 2023), and bilateral Free Trade Agreements.
          </p>
        </div>

        {/* Interactive HS & FTA Engine Showcase */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 block">
                Live Tariff & Agreement Simulator
              </span>
              <h3 className="text-xl font-bold font-serif text-slate-900 mt-0.5">
                Select an Indian Export Product to Inspect Duty Arbitrage
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-slate-600">FTP 2023 & CEPA Rules Live</span>
            </div>
          </div>

          {/* Product Pill Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {HS_SAMPLES.map((sample, idx) => (
              <button
                key={sample.hs}
                type="button"
                onClick={() => setSelectedHSSample(idx)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedHSSample === idx
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-[1.02]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-[10px] font-mono font-bold block opacity-75">
                  HS {sample.hs}
                </span>
                <strong className="text-xs block mt-0.5 truncate">{sample.title}</strong>
                <span className="text-[10px] opacity-80 block truncate mt-1">{sample.corridor.split('→')[1]}</span>
              </button>
            ))}
          </div>

          {/* Selected Product Intelligence Card */}
          {(() => {
            const current = HS_SAMPLES[selectedHSSample];
            return (
              <div className="bg-[#FAF9F6] rounded-2xl border border-slate-300 p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-orange-600 uppercase tracking-wider">
                      Trade Corridor: {current.corridor}
                    </span>
                    <h4 className="text-2xl font-bold font-serif text-slate-900 mt-1">
                      {current.title} (HS Code: {current.hs})
                    </h4>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800 shadow-xs">
                    Agreement: <strong className="text-orange-600">{current.fta}</strong>
                  </div>
                </div>

                {/* Duty Arbitrage Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-mono text-[10px] uppercase font-bold block">
                      Standard MFN Tariff
                    </span>
                    <span className="text-lg font-black text-slate-800 font-mono">{current.standardDuty}</span>
                    <span className="text-[11px] text-red-600 block">Default without VyaparFlow COO</span>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <span className="text-emerald-800 font-mono text-[10px] uppercase font-bold block">
                      Preferential FTA Tariff
                    </span>
                    <span className="text-lg font-black text-emerald-700 font-mono">{current.prefDuty}</span>
                    <span className="text-[11px] text-emerald-800 font-bold block">Unlocked via CEPA / REX</span>
                  </div>

                  <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 space-y-1">
                    <span className="text-orange-900 font-mono text-[10px] uppercase font-bold block">
                      Net Cost Arbitrage Saved
                    </span>
                    <span className="text-lg font-black text-orange-700 font-mono">{current.dutySaving}</span>
                    <span className="text-[11px] text-orange-800 block">Direct bottom-line savings</span>
                  </div>
                </div>

                {/* Mandatory Cert Pre-requisite */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="block text-slate-900">Mandatory Foreign Customs Pre-Requisite:</strong>
                      <span className="text-slate-600">{current.keyCert}</span>
                    </div>
                  </div>
                  <span className="font-mono text-slate-500 text-[11px] shrink-0">
                    Lead Time: {current.leadTime}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          STORY 03 — THE 0–100 READINESS SCORE AUDIT MATRIX
      ───────────────────────────────────────────────────────────── */}
      <section id="readiness" className="scroll-mt-24 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100 text-orange-900 border border-orange-300 text-xs font-mono font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
            <span>03 — Weighted Scoring Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-serif tracking-tight leading-tight">
            The 0–100 Export Readiness Index. <br className="hidden sm:inline" />
            Explainable Audits Across 4 Core Pillars.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Every export shipment is evaluated across four 25-point weighted pillars before dispatch. If a single critical requirement fails, the system locks dispatch and provides an exact resolution path.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Pillar 1 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md hover:border-orange-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center font-mono font-bold text-orange-600 text-sm">
                01
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">25 Points Max</span>
            </div>
            <h3 className="text-lg font-bold font-serif text-slate-900">
              Enterprise & Bank Registrations
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Validation of GSTIN active status, 10-digit Import Export Code (IEC), Authorised Dealer (AD) Code registered with port customs, and Export Promotion Council (RCMC) membership.
            </p>
            <div className="pt-2 space-y-1.5 text-[11px] text-slate-700 font-medium">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>GSTIN & IEC Automated Lookup</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>ICEGATE AD-Code Binding Check</span>
              </div>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md hover:border-orange-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center font-mono font-bold text-orange-600 text-sm">
                02
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">25 Points Max</span>
            </div>
            <h3 className="text-lg font-bold font-serif text-slate-900">
              Product & Standards Compliance
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              HS 8-digit verification, NABL lab test certificates, phytosanitary requirements, chemical safety (EU REACH/RoHS), and destination market non-tariff barrier clearance.
            </p>
            <div className="pt-2 space-y-1.5 text-[11px] text-slate-700 font-medium">
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
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md hover:border-orange-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center font-mono font-bold text-orange-600 text-sm">
                03
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">25 Points Max</span>
            </div>
            <h3 className="text-lg font-bold font-serif text-slate-900">
              Document Vault Completeness
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generation and validation of export Commercial Invoices (Incoterms 2020), Detailed Packing Lists (Net/Gross Weights, CBM), Certificates of Origin, and Shipping Bills.
            </p>
            <div className="pt-2 space-y-1.5 text-[11px] text-slate-700 font-medium">
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
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md hover:border-orange-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center font-mono font-bold text-orange-600 text-sm">
                04
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">25 Points Max</span>
            </div>
            <h3 className="text-lg font-bold font-serif text-slate-900">
              Carrier & Port Handoff
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Container booking confirmation with shipping lines (Maersk, MSC, Hapag), Port CFS gate-in pass, customs CHA allocation, and Let Export Order (LEO) milestone tracking.
            </p>
            <div className="pt-2 space-y-1.5 text-[11px] text-slate-700 font-medium">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Multi-Carrier Quote Comparison</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Port Gate-In & LEO Tracking</span>
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-mono font-bold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-orange-600" />
            <span>04 — Document Generation Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-serif tracking-tight leading-tight">
            1-Click Verified Document Generation. <br className="hidden sm:inline" />
            ICEGATE, CEPA, and e-Sanchit Ready.
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
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeDocPreview === 'invoice'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                1. Commercial Invoice
              </button>
              <button
                type="button"
                onClick={() => setActiveDocPreview('packing')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeDocPreview === 'packing'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                2. Packing List
              </button>
              <button
                type="button"
                onClick={() => setActiveDocPreview('coo')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeDocPreview === 'coo'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                3. Certificate of Origin
              </button>
              <button
                type="button"
                onClick={() => setActiveDocPreview('shippingBill')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeDocPreview === 'shippingBill'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                4. ICEGATE Shipping Bill
              </button>
            </div>

            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Auto-Validation Passed
            </span>
          </div>

          {/* Interactive Document Layout */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 font-mono text-xs">
            {activeDocPreview === 'invoice' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-orange-400 font-bold block">COMMERCIAL INVOICE #EXP-2026-0941</span>
                    <span className="text-slate-400 text-[11px]">Incoterms 2020: CIF Jebel Ali Port, Dubai (UAE)</span>
                  </div>
                  <div className="text-right text-slate-400 text-[11px]">
                    <span>Date: 11-SEP-2026</span>
                    <span className="block text-emerald-400">Currency: USD ($)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 uppercase font-bold block">Exporter / Consignor</span>
                    <strong className="text-white block">Apex Agro & Industrial Exports Ltd.</strong>
                    <span className="text-slate-400 block">GSTIN: 27AABCA1234F1Z8 | IEC: 0312345678</span>
                    <span className="text-slate-400 block">Nashik Hub, Maharashtra, India</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 uppercase font-bold block">Buyer / Consignee</span>
                    <strong className="text-white block">Emirates Global Fresh Produce FZ-LLC</strong>
                    <span className="text-slate-400 block">TRN: 100234981200003</span>
                    <span className="text-slate-400 block">Al Aweer Fruit Market, Dubai, UAE</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
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
                        <td className="py-2 text-orange-400">0806.10.00</td>
                        <td className="py-2">Sonaka Fresh Table Grapes (5kg Boxes)</td>
                        <td className="py-2">4,800 Boxes</td>
                        <td className="py-2">$8.50</td>
                        <td className="py-2 text-right font-bold text-white">$40,800.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center pt-2 text-[11px] text-slate-400 border-t border-slate-800">
                  <span>CEPA Preferential Tariff: <strong>0% Duty</strong> applied</span>
                  <span className="text-white font-bold text-sm font-sans">Total CIF Value: $40,800.00</span>
                </div>
              </div>
            )}

            {activeDocPreview === 'packing' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-orange-400 font-bold block">STANDARDIZED EXPORT PACKING LIST #PL-9812</span>
                    <span className="text-slate-400 text-[11px]">Container: 1x40ft HC Reefer | Pallet Count: 20 Euro Pallets</span>
                  </div>
                  <div className="text-right text-slate-400 text-[11px]">
                    <span>Total Packages: 4,800 Cartons</span>
                    <span className="block text-emerald-400">Net: 24,000 KG | Gross: 26,400 KG</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-[11px]">
                  <div className="flex justify-between text-slate-400 border-b border-slate-800/60 pb-1">
                    <span>Pallet Range: #PAL-01 to #PAL-20</span>
                    <span>240 Boxes per Pallet (5kg Corrugated Food-Grade)</span>
                  </div>
                  <p className="text-slate-300">
                    Pre-Cooling Specification: +0.5°C to +1.0°C Core Fruit Temperature Maintained. Humidity: 90–95% RH.
                  </p>
                  <p className="text-emerald-400">
                    ✓ ISPM-15 Heat-Treated Pallet Stamps Verified. Zero Wooden Pest Infestation.
                  </p>
                </div>
              </div>
            )}

            {activeDocPreview === 'coo' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-orange-400 font-bold block">PREFERENTIAL CERTIFICATE OF ORIGIN (CEPA FORM 1)</span>
                    <span className="text-slate-400 text-[11px]">Issuing Authority: Directorate General of Foreign Trade (DGFT)</span>
                  </div>
                  <div className="text-right text-emerald-400 text-[11px]">
                    <span>Status: Digitally Signed & QR Encoded</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-[11px]">
                  <p className="text-slate-200">
                    Rule of Origin Criteria: <strong>Wholly Obtained (WO)</strong> in India under Article 3.3 of India-UAE Comprehensive Economic Partnership Agreement (CEPA).
                  </p>
                  <p className="text-slate-400">
                    Verification Hash: <code>7f9a88c42b109e89d123bfce9a08</code> (Directly verifiable on UAE Customs portal).
                  </p>
                </div>
              </div>
            )}

            {activeDocPreview === 'shippingBill' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-orange-400 font-bold block">ICEGATE SHIPPING BILL #SB-98214-JNPT</span>
                    <span className="text-slate-400 text-[11px]">Customs Station: INNSA1 (Nhava Sheva, JNPT Port)</span>
                  </div>
                  <div className="text-right text-emerald-400 text-[11px]">
                    <span>Let Export Order (LEO) Status: GRANTED</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-[11px]">
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>FOB Value: ₹33,86,400.00</div>
                    <div>RoDTEP Incentive: 1.4% (₹47,409.60)</div>
                    <div>Port of Loading: INNSA1</div>
                    <div>Port of Discharge: AEJEA (Jebel Ali)</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          STORY 05 — END-TO-END SHIPMENT MILESTONE TELEMETRY
      ───────────────────────────────────────────────────────────── */}
      <section id="shipments" className="scroll-mt-24 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100 text-orange-900 border border-orange-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5 text-orange-600" />
            <span>05 — Connected Telemetry</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-serif tracking-tight leading-tight">
            Factory Gate to Global Destination. <br className="hidden sm:inline" />
            Real-Time Cross-Border Milestone Tracking.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Eliminate blind spots. VyaparFlow persists and syncs every logistics milestone from factory truck dispatch to port gate-in, customs LEO, ocean voyage, and destination clearance.
          </p>
        </div>

        {/* 6-Stage Timeline Component */}
        <div className="max-w-6xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            {/* Stage 1 */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-800">
                <span>01. FACTORY</span>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <strong className="block text-xs text-slate-900">Cargo Picked Up</strong>
              <p className="text-[11px] text-slate-600">Nashik packhouse weighment verified</p>
            </div>

            {/* Stage 2 */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-800">
                <span>02. INLAND ICD</span>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <strong className="block text-xs text-slate-900">Rail Corridor</strong>
              <p className="text-[11px] text-slate-600">Transit to JNPT Port Nhava Sheva</p>
            </div>

            {/* Stage 3 */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-800">
                <span>03. PORT GATE-IN</span>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <strong className="block text-xs text-slate-900">CFS Scanned</strong>
              <p className="text-[11px] text-slate-600">Container gated-in at Nhava Sheva</p>
            </div>

            {/* Stage 4 */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-800">
                <span>04. CUSTOMS LEO</span>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <strong className="block text-xs text-slate-900">Let Export Order</strong>
              <p className="text-[11px] text-slate-600">ICEGATE e-Sanchit clear</p>
            </div>

            {/* Stage 5 */}
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-2 animate-pulse-subtle">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-orange-800">
                <span>05. OCEAN FREIGHT</span>
                <Ship className="w-3.5 h-3.5 text-orange-600" />
              </div>
              <strong className="block text-xs text-slate-900">Vessel In-Transit</strong>
              <p className="text-[11px] text-slate-600">Arabian Sea Corridor (ETA 48h)</p>
            </div>

            {/* Stage 6 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 opacity-75">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500">
                <span>06. BERTH & OUT</span>
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-mono font-bold uppercase tracking-wider">
            <Workflow className="w-3.5 h-3.5 text-orange-600" />
            <span>06 — Collaborative Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-serif tracking-tight leading-tight">
            One Single Operating Canvas. <br className="hidden sm:inline" />
            Synchronous Handoff for All Trade Partners.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Eliminate disconnected silos. MSME manufacturers, licensed freight forwarders, NABL-accredited test laboratories, and customs CHA agents all interact with the same verified shipment dossier.
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
                  ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
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
              <span>4. Customs Broker (CHA)</span>
            </button>
          </div>

          {/* Persona Detail Cards */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xl">
            {activePersona === 'msme' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold font-mono">
                    ROLE: MSME EXPORTER
                  </span>
                  <h3 className="text-2xl font-bold font-serif text-slate-900">
                    Factory Readiness & Instant Export Documentation
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Input your product specifications once. The engine immediately checks HS chapters, validates compliance requirements against foreign customs mandates, calculates FTA duty advantages, and auto-generates Commercial Invoices and Packing Lists.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Explainable 0–100 Readiness Score with zero hidden traps</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Compare transparent ocean and air freight quotes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>End-to-end GPS and EDI milestone telemetry</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                    <span>LIVE WORKSPACE WIDGET</span>
                    <span className="text-emerald-400">STATUS: 92% PASS</span>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold block">Organic Alphonso Mango Pulp → Rotterdam (EU)</span>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[92%]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">HS Code</span>
                      <strong className="text-white">2008.99.11</strong>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">EU Preferential</span>
                      <strong className="text-emerald-400">0% REX Preferential</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePersona === 'forwarder' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono">
                    ROLE: FREIGHT FORWARDER & CARRIER
                  </span>
                  <h3 className="text-2xl font-bold font-serif text-slate-900">
                    Pre-Verified Cargo Bookings & Zero Detention Risk
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Bid transparently on pre-cleared MSME export bookings with verified weights, dimensions, and HS classifications. Fulfill shipping line container bookings, gate-in, and vessel tracking.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Direct access to verified MSME export demand across Indian clusters</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Zero cargo detention risk with pre-vetted compliance checks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Live milestone telemetry updates synced with shipping lines</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                    <span>PROVIDER CONSOLE</span>
                    <span className="text-blue-400">SwiftGlobe Logistics</span>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <strong className="block text-white">40ft HC Reefer Container</strong>
                      <span className="text-slate-400 text-[11px]">JNPT Port → Jebel Ali (UAE)</span>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 font-mono font-bold border border-blue-500/30">
                      ₹1,24,000
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 font-mono">
                    ✓ Booking Confirmed | Container Dispatched from Nashik Packhouse
                  </div>
                </div>
              </div>
            )}

            {activePersona === 'lab' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold font-mono">
                    ROLE: NABL & APEDA QUALITY LAB
                  </span>
                  <h3 className="text-2xl font-bold font-serif text-slate-900">
                    Digital Lab Certificates & Tamper-Proof Test Reports
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Receive sample testing requests directly from MSME manufacturers. Upload digital test certificates, chemical safety reports (EU REACH/RoHS), and pesticide residue analysis straight to the shipment audit vault.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>NABL-accredited digital report uploads with tamper-proof IDs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Automatic readiness score unlock upon test certification</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Instant integration with customs e-Sanchit vault</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                    <span>QUALITY TESTING PORTAL</span>
                    <span className="text-emerald-400">CertifyLab India (NABL)</span>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold">
                      <span>Phytosanitary & Pesticide Residue</span>
                      <span className="text-emerald-400 font-mono">PASSED ✓</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      MRL compliance verified under EU Regulation 396/2005
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between font-mono">
                    <span>Cert #NABL-2026-8941</span>
                    <span className="text-emerald-400 font-bold">Vault Synced ✓</span>
                  </div>
                </div>
              </div>
            )}

            {activePersona === 'cha' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold font-mono">
                    ROLE: CUSTOMS HOUSE AGENT (CHA)
                  </span>
                  <h3 className="text-2xl font-bold font-serif text-slate-900">
                    ICEGATE Shipping Bill Filing & Port Customs Clearance
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Execute ICEGATE Shipping Bill filings, claim duty drawback / RoDTEP rebates, and coordinate port customs clearance with zero manual document reconstruction.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>ICEGATE Shipping Bill generation with pre-validated data</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Automated RoDTEP & Duty Drawback incentive calculation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Let Export Order (LEO) timestamp audit trail</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                    <span>CUSTOMS CLEARANCE DESK</span>
                    <span className="text-orange-400">Apex CHA Associates</span>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold">
                      <span>Shipping Bill #SB-98214-JNPT</span>
                      <span className="text-emerald-400 font-mono">LEO ISSUED ✓</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Port of Loading: Jawaharlal Nehru Port (JNPT), Nhava Sheva
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between font-mono">
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
          <span className="px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-mono font-bold uppercase tracking-wider inline-block">
            National Impact Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight">
            Built for India&apos;s $1 Trillion Export Mission
          </h2>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed">
            Empowering manufacturing clusters across Maharashtra, Gujarat, Tamil Nadu, Punjab, and national industrial trade corridors.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <span className="text-3xl sm:text-5xl font-black font-serif font-mono block">100%</span>
            <span className="text-xs uppercase tracking-wider font-bold opacity-90 mt-2 block font-mono">
              Deterministic Rules
            </span>
            <span className="text-[11px] opacity-75 mt-0.5 block">Zero AI Hallucinations</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <span className="text-3xl sm:text-5xl font-black font-serif font-mono block">&lt; 3 Min</span>
            <span className="text-xs uppercase tracking-wider font-bold opacity-90 mt-2 block font-mono">
              Readiness Audit
            </span>
            <span className="text-[11px] opacity-75 mt-0.5 block">Instant HS & Duty Lookup</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <span className="text-3xl sm:text-5xl font-black font-serif font-mono block">0–100</span>
            <span className="text-xs uppercase tracking-wider font-bold opacity-90 mt-2 block font-mono">
              Weighted Scoring
            </span>
            <span className="text-[11px] opacity-75 mt-0.5 block">Explainable Blockers</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <span className="text-3xl sm:text-5xl font-black font-serif font-mono block">1-Click</span>
            <span className="text-xs uppercase tracking-wider font-bold opacity-90 mt-2 block font-mono">
              Document Vault
            </span>
            <span className="text-[11px] opacity-75 mt-0.5 block">Invoices, Pack Lists & COO</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          STORY 08 — FINAL ENTERPRISE COMMAND CENTER CTA
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#090D16] rounded-3xl border border-slate-800 p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden text-center space-y-8">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5" />
            <span>Launch Your Export Readiness Audit</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif text-white tracking-tight leading-tight">
            Ready to Take Your MSME Products to Global Markets?
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Run an instant 0–100 export readiness check. Discover bilateral FTA duty savings, identify mandatory lab tests, and generate compliant documentation today.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-8 py-4 rounded-2xl bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-base shadow-xl shadow-orange-600/30 transition-all flex items-center gap-2.5 group cursor-pointer"
              >
                <span>Go to Your Active Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-8 py-4 rounded-2xl bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-base shadow-xl shadow-orange-600/30 transition-all flex items-center gap-2.5 group cursor-pointer"
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

          <p className="text-xs text-slate-500 font-mono pt-4">
            Zero commitment &bull; 100% Deterministic DGFT & CBIC compliance &bull; Trusted by Pan-India exporters
          </p>
        </div>
      </section>
    </div>
  );
}
