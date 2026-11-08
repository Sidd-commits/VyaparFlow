import React, { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import AuthContainer from '@/components/AuthContainer';
import ExportRoadmapVisual from '@/components/ExportRoadmapVisual';
import { getActiveUser } from '@/app/actions';
import { redirect } from 'next/navigation';
import { MapPin } from 'lucide-react';

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
          
          {/* Left Column: Visual Export Roadmap & Pathway (No Walls of Text) */}
          <div className="lg:col-span-6 space-y-5 lg:pr-4 lg:sticky lg:top-24">
            
            {/* Direct, Punchy Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/90 text-orange-950 text-xs font-semibold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                <span className="font-bold text-orange-800">Export Clearance Roadmap</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-slate-900 tracking-tight leading-[1.15]">
                From factory floor <br />
                <span className="text-orange-600">
                  to customs Let Export Order (LEO).
                </span>
              </h1>
            </div>

            {/* Visual Interactive Export Pathway Component */}
            <ExportRoadmapVisual />

            {/* Clean Port Gateways Strip */}
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>Direct Gateways: JNPT &bull; Mundra &bull; Hazira &bull; Chennai &bull; BOM Air Cargo</span>
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
