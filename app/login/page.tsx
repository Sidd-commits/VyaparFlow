import React, { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import AuthContainer from '@/components/AuthContainer';
import { getActiveUser } from '@/app/actions';
import { redirect } from 'next/navigation';
import { Ship, ShieldCheck, CheckCircle2, TrendingUp, Globe2, Sparkles, Building2, MapPin } from 'lucide-react';

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
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none -mt-20" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navbar with dark-mode compatibility */}
      <Navbar currentRole={role} userEmail={user?.email} userName={user?.name} />

      <main className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 w-full flex-1 flex items-start justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start w-full">
          
          {/* Left Hero & Value Proposition Column (Locked in place, zero layout shift) */}
          <div className="lg:col-span-6 space-y-6 lg:pr-6 lg:sticky lg:top-24">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MULTI-PERSONA EXPORT OPERATING SYSTEM</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] font-serif">
              Connected Cross-Border Trade <br />
              <span className="bg-linear-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                For Exporters & Logistics Partners.
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              VyaparFlow unites MSME manufacturers, freight forwarders, testing laboratories, customs house agents, and compliance operators on one deterministic platform.
            </p>

            {/* Persona Highlights */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">For Indian MSME Exporters</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    0–100 Readiness scores, automated commercial invoice/packing list PDFs, and carrier comparison quotes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">For Service Providers (Freight / Lab / CHA)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Fulfill ocean/air bids, upload phytosanitary & quality test reports, and execute customs shipping bill clearances.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">For Platform Administrators</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Configure deterministic product-country compliance rules, inspect document vaults, and audit dispatch trails.
                  </p>
                </div>
              </div>
            </div>

            {/* Global Trade Corridor Pill */}
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Global Trade Corridors: <strong>Pan-India Exporter Hubs</strong> → USA, EU, UAE & Global Markets</span>
            </div>
          </div>

          {/* Right Auth Card Column */}
          <div className="lg:col-span-6 w-full max-w-lg mx-auto">
            {/* Suspense wrapper for Next.js searchParams */}
            <Suspense fallback={<div className="text-center py-12 text-sm text-slate-400">Loading authentication interface...</div>}>
              <AuthContainer currentUser={user} />
            </Suspense>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-800/80">
        © 2026 VyaparFlow Platform — Indian MSME Export Logistics Operating System
      </footer>
    </div>
  );
}
