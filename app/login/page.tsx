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
      <div className="absolute top-16 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 right-1/4 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content: Split Layout (Export Roadmap on Left, Clean Auth Container on Right) */}
      <main className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 w-full flex-1 flex items-center justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center w-full">
          
          {/* Left Column: Visual Export Clearance Roadmap (Matches Image 1 Exactly - No Text Clutter) */}
          <div className="lg:col-span-6 w-full flex flex-col justify-center">
            <ExportRoadmapVisual />
          </div>

          {/* Right Column: High-Quality Professional Auth Container */}
          <div className="lg:col-span-6 w-full max-w-lg mx-auto">
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

        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-200 bg-white/80">
        &copy; 2026 VyaparFlow Platform &bull; Built for Indian MSME Cross-Border Exporters
      </footer>
    </div>
  );
}
