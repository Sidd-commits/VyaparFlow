import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import LandingInteractiveShowcase from '@/components/LandingInteractiveShowcase';
import { getActiveUser, getAllUsers } from '@/app/actions';
import {
  Ship,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Award,
  Truck,
  FileText,
  Boxes,
  Compass,
  MapPin,
  LogIn,
  UserPlus,
  Sparkles,
  Layers,
  FileCheck2,
  TrendingUp,
} from 'lucide-react';

export default async function LandingPage() {
  const { role, user } = await getActiveUser();
  const allUsers = await getAllUsers();
  const isLoggedIn = Boolean(user && role);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900">
      <Navbar currentRole={role} userEmail={user?.email} userName={user?.name} allUsers={allUsers} />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 border-b border-slate-200 bg-linear-to-b from-white via-orange-50/20 to-[#FAF9F6]">
        {/* Subtle decorative background gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mt-20" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-300 text-orange-900 text-xs font-bold shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span>Pan-India MSME Export Operating System → Global Corridors</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] font-serif">
                Tell us what you make. <br />
                <span className="bg-linear-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  We guide your export journey.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-700 max-w-2xl font-normal leading-relaxed">
                VyaparFlow converts complex multi-agency export regulations into one clear, explainable, and trackable digital operating system for Tier-2 and Tier-3 Indian MSMEs.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {isLoggedIn ? (
                  <>
                    <Link
                      href={role === 'PROVIDER' ? '/provider' : role === 'ADMIN' ? '/admin' : '/dashboard'}
                      className="px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-base shadow-lg shadow-orange-600/30 transition-all flex items-center gap-2 group cursor-pointer hover:-translate-y-0.5"
                    >
                      <span>Go to Your Active Dashboard</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/readiness"
                      className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-300 transition-all flex items-center gap-2 cursor-pointer shadow-xs hover:-translate-y-0.5"
                    >
                      <Compass className="w-5 h-5 text-orange-600" />
                      <span>Readiness Engine</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-base shadow-lg shadow-orange-600/30 transition-all flex items-center gap-2 group cursor-pointer hover:-translate-y-0.5"
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
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 font-semibold">
                <div className="flex items-center gap-2 bg-white/90 p-3 rounded-xl border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Deterministic Rules</span>
                </div>
                <div className="flex items-center gap-2 bg-white/90 p-3 rounded-xl border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>0–100 Score Audits</span>
                </div>
                <div className="flex items-center gap-2 bg-white/90 p-3 rounded-xl border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Carrier & CHA Network</span>
                </div>
              </div>
            </div>

            {/* Right Card / Interactive Showcase Teaser */}
            <div id="export-showcase" className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 text-white p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-orange-400 font-extrabold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Active Exporter Blueprint
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                    Live Demo Ready
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white font-serif">
                    Apex Agro & Industrial Exports
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Route: Palghar Hub & JNPT Port → Jebel Ali (UAE) & Rotterdam (EU)
                  </p>
                </div>

                {/* Score Ring / Bar */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Readiness Score</span>
                    <span className="font-bold text-orange-400">85 / 100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full w-[85%]" />
                  </div>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    Commercial Invoice & Packing List Pre-Generated
                  </p>
                </div>

                {/* CTA inside card */}
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="block w-full py-3.5 text-center bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
                  >
                    Open MSME Exporter Dashboard →
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="block w-full py-3.5 text-center bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
                  >
                    Sign In to Inspect Live Readiness →
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* 2. LIVE INTERACTIVE SHOWCASE (SIMULATOR + ECOSYSTEM + METRICS) */}
          <LandingInteractiveShowcase isLoggedIn={isLoggedIn} />
        </div>
      </section>

      {/* Process Flow: The 5-Stage Connected Export Journey */}
      <section id="overview" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold uppercase tracking-wider">
              <span>Standard Operating Procedure</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-serif">
              The 5-Stage Connected Export Operating Journey
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              From business registration & rule matching to quote selection, document generation, and customs clearance tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-slate-200 space-y-3 relative hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                1
              </div>
              <h4 className="font-bold text-base text-slate-900">Profile & Product</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter business registrations (GST, IEC), product HS codes, and target destination market.
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-slate-200 space-y-3 relative hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                2
              </div>
              <h4 className="font-bold text-base text-slate-900">Rule Matching</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deterministic compliance engine generates product-country document & lab test requirements.
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-slate-200 space-y-3 relative hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                3
              </div>
              <h4 className="font-bold text-base text-slate-900">Readiness Score</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                0–100 weighted scoring with explainable blockers and prioritized action queue.
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-slate-200 space-y-3 relative hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                4
              </div>
              <h4 className="font-bold text-base text-slate-900">Carrier Quotes</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compare ocean/air freight quotes, select provider, and initiate CHA & Insurance tasks.
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-slate-200 space-y-3 relative hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                5
              </div>
              <h4 className="font-bold text-base text-slate-900">Dispatch & Port</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Persisted milestone tracking updates from factory pickup to customs clearance and ocean vessel gate-in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-950 text-slate-400 py-12 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-sm uppercase tracking-wide">VYAPARFLOW</span>
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest">
                Export Logistics Readiness Operating System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-400 text-xs">
            <Link href="/readiness" className="hover:text-white transition-colors">Regulatory Engine</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Exporter Dashboard</Link>
            <Link href="/provider" className="hover:text-white transition-colors">Provider Console</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Admin Console</Link>
          </div>

          <p className="text-slate-500">© 2026 VyaparFlow. Built for Indian MSME Cross-Border Exporters.</p>
        </div>
      </footer>
    </div>
  );
}
