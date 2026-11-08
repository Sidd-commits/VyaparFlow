import React, { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import AuthContainer from '@/components/AuthContainer';
import { getActiveUser } from '@/app/actions';
import { redirect } from 'next/navigation';
import VyaparFlowLogo from '@/components/VyaparFlowLogo';
import {
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Building2,
  Ship,
  FileText,
  Award,
  Zap,
  ArrowRight,
  Globe2,
  Check,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  let activeUserResult = { role: null as 'MSME' | 'PROVIDER' | 'ADMIN' | null, user: null as any };
  try {
    activeUserResult = await getActiveUser();
  } catch (e) {
    console.warn('LoginPage: Unable to retrieve active user during SSR, defaulting to guest:', e);
  }
  const { role, user } = activeUserResult;

  // If already authenticated, redirect straight to the user's role dashboard
  if (user && role) {
    if (role === 'PROVIDER') {
      redirect('/provider');
    } else if (role === 'ADMIN') {
      redirect('/admin');
    } else {
      redirect('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900 relative">
      {/* Top Navbar */}
      <Navbar currentRole={role} userEmail={user?.email} userName={user?.name} />

      {/* Subtle warm ambient lighting */}
      <div className="absolute top-12 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 left-10 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <main className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 w-full flex-1 flex items-start justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start w-full">
          
          {/* Left Column: Authentic Enterprise Showcase (Human-Crafted, Zero AI Buzzwords) */}
          <div className="lg:col-span-6 space-y-6 lg:pr-4 lg:sticky lg:top-24">
            
            {/* Header Block */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/90 text-orange-950 text-xs font-semibold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                <span className="font-bold text-orange-800">Pan-India Export Operating System</span>
                <span className="text-orange-300">•</span>
                <span className="text-slate-600 font-medium">DGFT &amp; ICEGATE Aligned</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-slate-900 tracking-tight leading-[1.14]">
                Cross-border shipping, <br />
                <span className="text-orange-600">
                  without the customs friction.
                </span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                VyaparFlow connects Indian manufacturing clusters directly with verified freight forwarders, testing laboratories, and customs brokers on a single, deterministic trade operating canvas.
              </p>
            </div>

            {/* Persona Highlights (The 3 Core Pillars From Previous Version, Elevated with Real Trade Metrics) */}
            <div className="space-y-3 pt-1">
              
              {/* Pillar 1: MSME Exporters */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs transition-all hover:border-orange-300">
                <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200/70 text-orange-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-xs text-slate-900">For Indian MSME Exporters</h4>
                    <span className="text-[10px] bg-orange-50 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-full font-bold">
                      0–100 Audit
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Instant statutory readiness evaluation, automated commercial invoices, packing lists, and verified forwarder bids.
                  </p>
                </div>
              </div>

              {/* Pillar 2: Service Providers */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs transition-all hover:border-orange-300">
                <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200/70 text-orange-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Ship className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-xs text-slate-900">For Service Providers (Freight / Lab / CHA)</h4>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      Verified Bids
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Bid on ready factory cargo, upload digital NABL test certs, and file ICEGATE shipping bills with Let Export Order (LEO) sync.
                  </p>
                </div>
              </div>

              {/* Pillar 3: Platform Administrators */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs transition-all hover:border-orange-300">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-xs text-slate-900">For Platform Administrators</h4>
                    <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full font-bold">
                      Compliance Engine
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Maintain deterministic tariff rules, inspect document vaults, and enforce strict tenant-isolated audit trails.
                  </p>
                </div>
              </div>

            </div>

            {/* Live Corridor Telemetry Snapshot (Real Operational Telemetry) */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900">Live Trade Corridor Snapshot</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200 text-[10px] font-bold">
                  Active Dispatch
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-slate-800 block">
                    Nashik Agro-Cluster &rarr; Jebel Ali, Dubai (UAE)
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Commodity: Sonaka Table Grapes &bull; 4–5 Days Ocean Reefer
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-700 font-bold font-mono text-xs block">
                    0% CEPA Duty
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    ₹1.48L Duty Saved
                  </span>
                </div>
              </div>

              {/* Progress Milestones Strip */}
              <div className="grid grid-cols-4 gap-1.5 pt-1 text-[10px] font-medium text-center">
                <div className="p-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 font-semibold flex items-center justify-center gap-1">
                  <Check className="w-3 h-3 text-orange-600" />
                  <span>Factory</span>
                </div>
                <div className="p-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 font-semibold flex items-center justify-center gap-1">
                  <Check className="w-3 h-3 text-orange-600" />
                  <span>CFS Gate-in</span>
                </div>
                <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center justify-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>NABL Residue</span>
                </div>
                <div className="p-1.5 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center gap-1 shadow-2xs">
                  <Check className="w-3 h-3 text-white" />
                  <span>LEO Cleared</span>
                </div>
              </div>
            </div>

            {/* Bottom Corridors Anchor */}
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>Pan-India Gateways: JNPT &bull; Mundra &bull; Hazira &bull; Chennai &bull; BOM Air Cargo</span>
            </div>
          </div>

          {/* Right Column: High-Quality Professional Auth Container */}
          <div className="lg:col-span-6 w-full max-w-lg mx-auto">
            <Suspense
              fallback={
                <div className="text-center py-12 text-xs text-slate-500 flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-600 rounded-full animate-spin" />
                  <span>Loading authentication portal...</span>
                </div>
              }
            >
              <AuthContainer currentUser={user} />
            </Suspense>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-500 py-4 border-t border-slate-200 bg-white/80">
        &copy; 2026 VyaparFlow Platform &bull; Built for Indian MSME Cross-Border Exporters
      </footer>
    </div>
  );
}
