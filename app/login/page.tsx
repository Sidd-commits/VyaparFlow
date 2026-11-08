import React, { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import AuthContainer from '@/components/AuthContainer';
import ExportRoadmapVisual from '@/components/ExportRoadmapVisual';
import { getActiveUser } from '@/app/actions';
import { redirect } from 'next/navigation';

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
          
          {/* Left Column: Visual Export Operations Console (Zero Small Text Clutter) */}
          <div className="lg:col-span-6 space-y-4 lg:pr-4 lg:sticky lg:top-24">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                The operating canvas <br />
                <span className="text-orange-600">for Indian export logistics.</span>
              </h1>
            </div>

            {/* High-Contrast Interactive Console */}
            <ExportRoadmapVisual />
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
      <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-200 bg-white/80">
        &copy; 2026 VyaparFlow Platform &bull; Built for Indian MSME Cross-Border Exporters
      </footer>
    </div>
  );
}
