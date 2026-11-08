import React, { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import AuthContainer from '@/components/AuthContainer';
import { getActiveUser } from '@/app/actions';
import { redirect } from 'next/navigation';
import VyaparFlowLogo from '@/components/VyaparFlowLogo';
import { ShieldCheck } from 'lucide-react';

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
      {/* Navbar */}
      <Navbar currentRole={role} userEmail={user?.email} userName={user?.name} />

      {/* Subtle ambient lighting */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <main className="max-w-2xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col items-center justify-center relative z-10">
        {/* Top Focused Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex justify-center items-center">
            <VyaparFlowLogo size={42} showText={true} />
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
            Pan-India Export Logistics &amp; Regulatory Compliance Platform
          </p>
        </div>

        {/* Central Authentication Container */}
        <div className="w-full">
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

        {/* Trust & Security Badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 mt-8 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>256-bit TLS Encryption &bull; DGFT &amp; ICEGATE Compliant</span>
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="text-center text-[11px] text-slate-500 py-4 border-t border-slate-200 bg-white/80">
        &copy; 2026 VyaparFlow. Built for Indian MSME Cross-Border Exporters.
      </footer>
    </div>
  );
}
