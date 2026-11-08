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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans relative">
      {/* Navbar with clean light mode styling */}
      <Navbar currentRole={role} userEmail={user?.email} userName={user?.name} />

      <main className="max-w-7xl mx-auto py-8 sm:py-14 px-4 sm:px-6 lg:px-8 w-full flex-1 flex items-start justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start w-full">
          
          {/* Left Column: Clear Value Proposition */}
          <div className="lg:col-span-6 space-y-6 lg:pr-6 lg:sticky lg:top-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Multi-Persona Export Platform</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-bold text-slate-900 tracking-tight leading-[1.15]">
              Cross-border trade, <br />
              <span className="text-blue-600">
                simplified for Indian exporters.
              </span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              VyaparFlow unites MSME manufacturers, freight forwarders, testing laboratories, and customs house agents on one clean, deterministic platform.
            </p>

            {/* Persona Highlights */}
            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-900">For Indian MSME Exporters</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    0–100 Readiness scores, automated commercial invoice/packing list PDFs, and carrier comparison quotes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-900">For Service Providers (Freight / Lab / CHA)</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Fulfill ocean/air bids, upload phytosanitary & quality test reports, and execute customs shipping bill clearances.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-900">For Platform Administrators</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Configure deterministic product-country compliance rules, inspect document vaults, and audit dispatch trails.
                  </p>
                </div>
              </div>
            </div>

            {/* Global Trade Corridor Pill */}
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Pan-India Exporter Hubs: <strong>JNPT, Mundra, Hazira &amp; Chennai</strong> → Global Markets</span>
            </div>
          </div>

          {/* Right Auth Card Column */}
          <div className="lg:col-span-6 w-full max-w-lg mx-auto">
            <Suspense fallback={<div className="text-center py-12 text-sm text-slate-400">Loading authentication interface...</div>}>
              <AuthContainer currentUser={user} />
            </Suspense>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-200 bg-white">
        © 2026 VyaparFlow Platform — Indian MSME Export Logistics Operating System
      </footer>
    </div>
  );
}
