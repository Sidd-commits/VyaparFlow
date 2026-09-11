import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
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
} from 'lucide-react';

export default async function LandingPage() {
  const { role, user } = await getActiveUser();
  const allUsers = await getAllUsers();
  const isLoggedIn = Boolean(user && role);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col font-sans">
      <Navbar currentRole={role} userEmail={user?.email} userName={user?.name} allUsers={allUsers} />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 border-b border-slate-200 bg-linear-to-b from-white to-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                Pan-India Export Operating System → Global Trade Corridors
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] font-serif">
                Tell us what you make. <br />
                <span className="text-orange-600">We guide your export journey.</span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
                VyaparFlow converts complex multi-agency export regulations into one clear, explainable, and trackable digital operating system for Tier-2/Tier-3 Indian MSMEs.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {isLoggedIn ? (
                  <>
                    <Link
                      href={role === 'PROVIDER' ? '/provider' : role === 'ADMIN' ? '/admin' : '/dashboard'}
                      className="px-6 py-3.5 rounded-xl bg-orange-600 text-white font-bold text-base shadow-lg shadow-orange-600/30 hover:bg-orange-700 transition-all flex items-center gap-2 group cursor-pointer"
                    >
                      Go to Your Dashboard
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/readiness"
                      className="px-6 py-3.5 rounded-xl bg-white text-slate-800 font-semibold text-base border border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Compass className="w-5 h-5 text-slate-600" />
                      View Readiness Engine
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-6 py-3.5 rounded-xl bg-orange-600 text-white font-bold text-base shadow-lg shadow-orange-600/30 hover:bg-orange-700 transition-all flex items-center gap-2 group cursor-pointer"
                    >
                      <LogIn className="w-5 h-5" />
                      Sign In to Portal
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      href="/login?tab=register"
                      className="px-6 py-3.5 rounded-xl bg-white text-slate-800 font-semibold text-base border border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <UserPlus className="w-5 h-5 text-orange-600" />
                      Register New MSME
                    </Link>
                  </>
                )}
              </div>

              {/* Feature Checklist */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Deterministic Rules Engine</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>0-100 Score & Blocker Audits</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>End-to-End Shipment Tracking</span>
                </div>
              </div>
            </div>

            {/* Right Card / Visual Banner */}
            <div id="export-showcase" className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-900 text-white p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-orange-400 font-bold">
                    National MSME Operating Showcase
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                    62% Initial Readiness
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white font-serif">
                    Apex Agro & Manufacturing Exports
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Exporting: Premium Processed Goods → Dubai (UAE) & Rotterdam (EU)
                  </p>
                </div>

                {/* Score Ring / Bar */}
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Readiness Score</span>
                    <span className="font-bold text-orange-400">62 / 100</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full w-[62%]" />
                  </div>
                  <p className="text-[11px] text-amber-400 flex items-center gap-1">
                    <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                    4 Critical Dispatch Blockers Active
                  </p>
                </div>

                {/* CTA inside card */}
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="block w-full py-3 text-center bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md"
                  >
                    Open MSME Dashboard →
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="block w-full py-3 text-center bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md"
                  >
                    Sign In to Resolve Blockers & Ship →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Flow Cards */}
      <section id="overview" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 font-serif">
              The 5-Stage Connected Export Operating Journey
            </h2>
            <p className="text-slate-600 text-sm">
              From registration & rule matching to quote selection and customs clearance tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-slate-200 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="font-bold text-base text-slate-900">Profile Setup</h4>
              <p className="text-xs text-slate-600">
                Enter business registrations (GST, IEC), product HS codes, and destination market.
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-slate-200 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="font-bold text-base text-slate-900">Rule Engine</h4>
              <p className="text-xs text-slate-600">
                Deterministic compliance engine generates product-country document & lab requirements.
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-slate-200 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="font-bold text-base text-slate-900">Readiness Score</h4>
              <p className="text-xs text-slate-600">
                0–100 weighted scoring with explainable blockers and prioritized action queue.
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-slate-200 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h4 className="font-bold text-base text-slate-900">Quotes & Tasking</h4>
              <p className="text-xs text-slate-600">
                Compare logistics quotes, select provider, and initiate CHA/Customs & Insurance tasks.
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-slate-200 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                5
              </div>
              <h4 className="font-bold text-base text-slate-900">Live Timeline</h4>
              <p className="text-xs text-slate-600">
                Persisted tracking updates from pickup to customs clearance and final delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Ship className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-white text-sm uppercase">VYAPARFLOW</span>
            <span>— Export Logistics Readiness Platform</span>
          </div>
          <p>© 2026 VyaparFlow Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
