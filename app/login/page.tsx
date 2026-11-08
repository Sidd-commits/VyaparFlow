import React, { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import AuthContainer from '@/components/AuthContainer';
import { getActiveUser } from '@/app/actions';
import { redirect } from 'next/navigation';
import VyaparFlowLogo from '@/components/VyaparFlowLogo';

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
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 left-1/3 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content: Focused, High-Fidelity Standalone Auth Form */}
      <main className="max-w-2xl mx-auto py-10 sm:py-16 px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col items-center justify-center relative z-10">
        
        {/* Centered Brand Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex justify-center items-center">
            <VyaparFlowLogo size={46} showText={true} />
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Pan-India Export Logistics &amp; Regulatory Compliance Platform
          </p>
        </div>

        {/* Central Standalone Authentication Container */}
        <div className="w-full">
          <Suspense
            fallback={
              <div className="text-center py-16 text-xs text-slate-500 flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-600 rounded-full animate-spin" />
                <span>Loading authentication portal...</span>
              </div>
            }
          >
            <AuthContainer currentUser={user} />
          </Suspense>
        </div>

      </main>

      {/* Clean Minimal Footer */}
      <footer className="text-center text-xs text-slate-500 py-5 border-t border-slate-200 bg-white/80">
        &copy; 2026 VyaparFlow Platform &bull; Built for Indian MSME Cross-Border Exporters
      </footer>
    </div>
  );
}
