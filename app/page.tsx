import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import HeroExportCockpit from '@/components/HeroExportCockpit';
import ScrollStorySections from '@/components/ScrollStorySections';
import { getActiveUser, getAllUsers } from '@/app/actions';
import {
  Ship,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Compass,
  MapPin,
  LogIn,
  UserPlus,
  Sparkles,
  Building2,
  Globe2,
  TrendingUp,
} from 'lucide-react';

export default async function LandingPage() {
  const { role, user } = await getActiveUser();
  const allUsers = await getAllUsers();
  const isLoggedIn = Boolean(user && role);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Top Navigation */}
      <Navbar currentRole={role} userEmail={user?.email} userName={user?.name} allUsers={allUsers} />

      {/* ─────────────────────────────────────────────────────────────
          HERO SECTION — EDITORIAL NARRATIVE & EXPORT COMMAND CENTER
      ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-6 sm:pt-10 pb-12 sm:pb-16 border-b border-slate-200 bg-linear-to-b from-white via-orange-50/20 to-[#FAF9F6] bg-trade-grid-light">
        {/* Ambient background light gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mt-20" />
        <div className="absolute bottom-6 left-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-6 space-y-5 text-left pt-1">
              {/* Live Status & Region Badge Group */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-600 text-white text-xs font-bold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pan-India Export OS</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-900 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>JNPT, Mundra, Hazira &amp; Chennai &rarr; Global Markets</span>
                </div>
              </div>

              {/* Display Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.08] font-serif">
                Tell us what you make. <br />
                <span className="bg-linear-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  We guide your export journey.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base text-slate-700 max-w-xl font-normal leading-relaxed">
                VyaparFlow converts complex multi-agency Indian export regulations (DGFT, CBIC, FSSAI, APEDA) into one clear, deterministic, and trackable digital operating system for Tier-2 &amp; Tier-3 MSMEs.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {isLoggedIn ? (
                  <>
                    <Link
                      href={role === 'PROVIDER' ? '/provider' : role === 'ADMIN' ? '/admin' : '/dashboard'}
                      className="px-7 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-base shadow-lg shadow-orange-600/30 transition-all flex items-center gap-2 group cursor-pointer hover:-translate-y-0.5"
                    >
                      <span>Go to Your Active Dashboard</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/readiness"
                      className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-300 transition-all flex items-center gap-2 cursor-pointer shadow-xs hover:-translate-y-0.5"
                    >
                      <Compass className="w-5 h-5 text-orange-600" />
                      <span>Regulatory Engine</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-7 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-base shadow-lg shadow-orange-600/30 transition-all flex items-center gap-2 group cursor-pointer hover:-translate-y-0.5"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Sign In to Portal</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      href="/login?tab=register"
                      className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-300 transition-all flex items-center gap-2 cursor-pointer shadow-xs hover:-translate-y-0.5"
                    >
                      <UserPlus className="w-5 h-5 text-orange-600" />
                      <span>Register MSME / Provider</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700 font-semibold pt-1">
                <div className="flex items-center gap-2 bg-white/90 p-2.5 rounded-xl border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Deterministic Rules</span>
                </div>
                <div className="flex items-center gap-2 bg-white/90 p-2.5 rounded-xl border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>0–100 Score Audits</span>
                </div>
                <div className="flex items-center gap-2 bg-white/90 p-2.5 rounded-xl border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Integrated CHA & Carrier</span>
                </div>
              </div>

              {/* Exporter Trust & Metrics Micro-Bar */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-500 font-mono border-t border-slate-200/80">
                <span>₹14.2 Cr+ Cargo Processed</span>
                <span>&bull;</span>
                <span>0 Customs Detentions</span>
                <span>&bull;</span>
                <span>100% FTP 2023 Compliant</span>
              </div>
            </div>

            {/* Right Column: High-Fidelity Export Command Center Cockpit */}
            <div id="export-showcase" className="lg:col-span-6">
              <HeroExportCockpit isLoggedIn={isLoggedIn} />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          MAIN SCROLL STORY SECTIONS (SECTIONS 01 TO 10)
      ───────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollStorySections isLoggedIn={isLoggedIn} />
      </main>

      {/* ─────────────────────────────────────────────────────────────
          GLOBAL ENTERPRISE FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="mt-auto bg-[#070B14] text-slate-400 py-14 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-8">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-600/20">
                <Ship className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-wide uppercase font-serif">
                  VYAPARFLOW
                </span>
                <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  Export Logistics Readiness Operating System
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-slate-400 text-xs">
              <Link href="/readiness" className="hover:text-orange-400 transition-colors">
                Regulatory Engine
              </Link>
              <Link href="/dashboard" className="hover:text-orange-400 transition-colors">
                Exporter Dashboard
              </Link>
              <Link href="/documents" className="hover:text-orange-400 transition-colors">
                Document Vault
              </Link>
              <Link href="/provider" className="hover:text-orange-400 transition-colors">
                Provider Console
              </Link>
              <Link href="/admin" className="hover:text-orange-400 transition-colors">
                Admin Console
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-mono">
            <p>© 2026 VyaparFlow. Built for Indian MSME Cross-Border Exporters.</p>
            <p>Pan-India Corridors: JNPT &bull; Mundra &bull; Hazira &bull; Chennai &bull; Cochin &bull; Kolkata</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

