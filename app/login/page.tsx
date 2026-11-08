import React, { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import AuthContainer from '@/components/AuthContainer';
import { getActiveUser } from '@/app/actions';
import { redirect } from 'next/navigation';
import VyaparFlowLogo from '@/components/VyaparFlowLogo';
import { ShieldCheck, CheckCircle2, TrendingUp, Sparkles, Building2 } from 'lucide-react';

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

      <main className="max-w-7xl mx-auto py-8 sm:py-16 px-4 sm:px-6 lg:px-8 w-full flex-1 flex items-start justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center w-full">
          
          {/* Left Column: Clean, Elegant Brand Showcase (Zero AI Clutter, Calming & Professional) */}
          <div className="lg:col-span-6 space-y-8 lg:pr-6">
            
            {/* Brand Intro & Confident Headline */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-orange-900 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                <span>Pan-India Export Operating System</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Cross-border shipping, <br />
                <span className="text-orange-600">simplified.</span>
              </h1>

              <p className="text-base text-slate-600 max-w-lg leading-relaxed">
                India&apos;s trade operating platform uniting MSME manufacturers, freight forwarders, testing laboratories, and customs brokers.
              </p>
            </div>

            {/* Elegant Minimalist Showcase Card (AniMaster Style Glassmorphism) */}
            <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/90 shadow-sm p-7 space-y-6">
              
              {/* Human Testimonial Quote */}
              <div className="space-y-3">
                <p className="text-slate-700 text-sm sm:text-base font-medium leading-relaxed italic">
                  &ldquo;VyaparFlow eliminated the guesswork from our export paperwork. Every shipment is verified against statutory compliance before our containers reach port gate-in.&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-200 text-orange-700 font-bold flex items-center justify-center text-sm">
                    AP
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Rajesh Patil</h4>
                    <p className="text-xs text-slate-500">Managing Director, Apex Agro Exports Pvt Ltd</p>
                  </div>
                </div>
              </div>

              {/* Minimalist 3-Stat Metric Row */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-2xl font-black font-mono text-orange-600 block">
                    100%
                  </span>
                  <span className="text-xs text-slate-500 font-medium block">
                    Statutory LEO Sync
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-2xl font-black font-mono text-emerald-600 block">
                    ₹1.48L+
                  </span>
                  <span className="text-xs text-slate-500 font-medium block">
                    Avg. FTA Duty Saved
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-2xl font-black font-mono text-slate-900 block">
                    48 hrs
                  </span>
                  <span className="text-xs text-slate-500 font-medium block">
                    Faster Port Gate-in
                  </span>
                </div>
              </div>

            </div>

            {/* Subtle Trust Strip */}
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ICEGATE Aligned</span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>DGFT Validated</span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>NABL Accredited</span>
              </span>
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
      <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-200 bg-white/80">
        &copy; 2026 VyaparFlow Platform &bull; Built for Indian MSME Cross-Border Exporters
      </footer>
    </div>
  );
}
