import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import HeroExportCockpit from '@/components/HeroExportCockpit';
import ScrollStorySections from '@/components/ScrollStorySections';
import { getActiveUser } from '@/app/actions';
import VyaparFlowLogo from '@/components/VyaparFlowLogo';
import {
  Ship,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Compass,
  LogIn,
  UserPlus,
} from 'lucide-react';

export default async function LandingPage() {
  const { role, user } = await getActiveUser();
  const isLoggedIn = Boolean(user && role);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Top Navigation */}
      <Navbar currentRole={role} userEmail={user?.email} userName={user?.name} />

      {/* ─────────────────────────────────────────────────────────────
          HERO SECTION — NARRATIVE & 3D INTERACTIVE CORRIDOR CONSOLE
      ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-3 sm:pt-5 pb-14 sm:pb-20 border-b border-slate-200 bg-linear-to-b from-white via-orange-50/15 to-[#FAF9F6]">
        {/* Subtle warm ambient lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mt-20" />
        <div className="absolute bottom-6 left-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Column: Direct, Human Headline & Actions (Aligned with Right Console) */}
            <div className="lg:col-span-6 space-y-6 text-left pt-1">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-950 text-xs font-semibold shadow-2xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600" />
                </span>
                <span className="font-bold text-orange-800">Pan-India Export Platform</span>
                <span className="text-orange-300">•</span>
                <span className="text-slate-700">JNPT, Mundra, Hazira &amp; Chennai &rarr; Global</span>
              </div>

              {/* Display Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-slate-900 tracking-tight leading-[1.12]">
                Stop guessing export paperwork. <br />
                <span className="text-orange-600">
                  Ship globally with total confidence.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
                VyaparFlow gives Indian exporters a live view of compliance requirements, statutory documents, freight quotes, and tracking — without the customs chaos.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {isLoggedIn ? (
                  <>
                    <Link
                      href={role === 'PROVIDER' ? '/provider' : role === 'ADMIN' ? '/admin' : '/dashboard'}
                      className="px-7 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm sm:text-base shadow-md shadow-orange-600/25 transition-all flex items-center gap-2 group cursor-pointer hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      <span>Go to Your Active Dashboard</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <Link
                      href="/readiness"
                      className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm sm:text-base border border-slate-300 transition-all flex items-center gap-2 cursor-pointer shadow-xs hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      <Compass className="w-4 h-4 text-orange-600" />
                      <span>Regulatory Engine</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-7 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm sm:text-base shadow-md shadow-orange-600/25 transition-all flex items-center gap-2 group cursor-pointer hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to Portal</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <Link
                      href="/login?tab=register"
                      className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm sm:text-base border border-slate-300 transition-all flex items-center gap-2 cursor-pointer shadow-xs hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      <UserPlus className="w-4 h-4 text-orange-600" />
                      <span>Register MSME / Provider</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: 3D Layered Interactive Trade Console */}
            <div id="export-showcase" className="lg:col-span-6">
              <HeroExportCockpit isLoggedIn={isLoggedIn} />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          MAIN SCROLL STORY SECTIONS (SECTIONS 01 TO 10)
      ───────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <ScrollStorySections isLoggedIn={isLoggedIn} />
      </main>

      {/* ─────────────────────────────────────────────────────────────
          GLOBAL FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="mt-auto bg-slate-950 text-slate-400 py-12 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-8">
            <VyaparFlowLogo
              size={36}
              showText={true}
              variant="dark"
              subtitle="Export Logistics Readiness Platform"
            />

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

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
            <p>© 2026 VyaparFlow. Built for Indian MSME Cross-Border Exporters.</p>
            <p>Pan-India Corridors: JNPT &bull; Mundra &bull; Hazira &bull; Chennai &bull; Cochin &bull; Kolkata</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
