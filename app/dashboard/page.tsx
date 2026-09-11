import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import EditCompanyProfileModal from '@/components/EditCompanyProfileModal';
import { requireAuth, getAllUsers } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import { calculateReadinessScore } from '@/lib/services/readiness';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Award,
  Box,
  Truck,
  ArrowRight,
  ShieldAlert,
  MapPin,
  TrendingUp,
  AlertOctagon,
  FileCheck2,
  ExternalLink,
  ShieldCheck,
  Building2,
  Activity,
  Globe2,
  Download,
  ChevronRight,
  Sparkles,
  Zap,
  Plus,
} from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { role, user } = await requireAuth();

  // Enforce strict Role-Based Access Control
  if (role === 'PROVIDER') {
    redirect('/provider');
  }

  if (role === 'ADMIN') {
    redirect('/admin');
  }

  const allUsers = await getAllUsers();

  // MSME Exporter Dashboard Data Sources
  const business = user?.businesses[0];
  const product = business?.products[0];
  const destination = product?.destinations[0];

  let readinessData = null;
  if (destination) {
    try {
      readinessData = await calculateReadinessScore(destination.id);
    } catch (e) {
      console.error('Error calculating readiness score:', e);
    }
  }

  // Get active shipment for this business
  const activeShipment = await prisma.shipment.findFirst({
    where: { businessId: business?.id },
    include: {
      product: true,
      destinationCountry: true,
      quotes: { include: { provider: true } },
      trackingEvents: { orderBy: { timestamp: 'desc' } },
      providerTasks: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 pb-16 font-sans selection:bg-orange-100 selection:text-orange-900">
      <Navbar currentRole={role} userEmail={user?.email} userName={user?.name} allUsers={allUsers} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 space-y-8">
        {/* ─────────────────────────────────────────────────────────────
            1. EXPORTER PROFILE & OPERATING CONTEXT HEADER
        ───────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-700">
              <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>
                Active Exporter Node &bull; {business?.location || 'Registered Industrial Zone'}, {business?.city || 'Mumbai'}, {business?.state || 'Maharashtra'}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-serif tracking-tight">
                {business?.displayName || `${user?.name || 'MSME'} Global Exporters`}
              </h1>
              {business && (
                <EditCompanyProfileModal
                  business={business}
                  buttonText="Manage Company"
                  triggerClassName="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer"
                />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium pt-0.5">
              <span>Legal Entity: <strong className="text-slate-700 font-semibold">{business?.legalName || `${user?.name || 'MSME'} Enterprises Pvt Ltd`}</strong></span>
              <span>&bull;</span>
              <span>GSTIN: <strong className="text-emerald-700 font-semibold">{business?.gstStatus || 'Active (27AAACP1234F1Z5)'}</strong></span>
              <span>&bull;</span>
              <span>IEC: <strong className="text-emerald-700 font-semibold">{business?.iecStatus || 'Active (0301099882)'}</strong></span>
              {product && destination && (
                <>
                  <span>&bull;</span>
                  <span>Payload: <strong className="text-slate-800 font-semibold">{product.name} (HS {product.hsCode}) &rarr; {destination.country.name}</strong></span>
                </>
              )}
            </div>
          </div>

          {/* Profile Completion Circular Gauge */}
          <div className="flex items-center gap-4 bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 shrink-0 w-full md:w-auto justify-between md:justify-start">
            <div className="text-left md:text-right">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Profile Completion
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
                {business?.profileCompletion || 85}%
              </span>
              <span className="block text-[10px] text-emerald-600 font-semibold">
                KYC &amp; Registrations Active
              </span>
            </div>

            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${business?.profileCompletion || 85}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 absolute" />
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. EXPORT READINESS COMMAND CENTER (DUAL-PANE HERO)
        ───────────────────────────────────────────────────────────── */}
        {readinessData ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Pane: High-Impact 0–100 Readiness Score Cockpit */}
            <div className="lg:col-span-5 bg-[#090D16] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs uppercase tracking-wider text-orange-400 font-bold">
                    EXPORT READINESS COMMAND DECK
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
                  FTP 2023 Verified
                </span>
              </div>

              {/* Target Trade Route Header */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Active Trade Corridor
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-white mt-0.5">
                  {product?.name || 'Export Commodity'}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>{business?.city || 'Factory'} (JNPT)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <Globe2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{destination?.country.name} ({destination?.country.isoCode})</span>
                </p>
              </div>

              {/* Numerical Score Display & Progress */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-4xl sm:text-5xl font-black font-serif text-white font-mono">
                      {readinessData.totalScore}
                    </span>
                    <span className="text-lg font-bold text-slate-500"> / 100</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      readinessData.totalScore >= 85
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {readinessData.readinessState}
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      readinessData.totalScore >= 85
                        ? 'bg-linear-to-r from-emerald-500 to-teal-400'
                        : 'bg-linear-to-r from-orange-500 to-amber-400'
                    }`}
                    style={{ width: `${readinessData.totalScore}%` }}
                  />
                </div>

                <p className="text-xs text-slate-400 leading-relaxed pt-1">
                  {readinessData.blockers.length > 0
                    ? `${readinessData.blockers.length} critical requirement(s) blocking customs Let Export Order (LEO). Resolve below to authorize container dispatch.`
                    : 'Zero critical blockers detected. All regulatory and document pre-requisites are certified ready for port gate-in.'}
                </p>
              </div>

              {/* Primary CTA */}
              <Link
                href="/readiness"
                className="w-full py-3.5 text-center bg-linear-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Inspect Full Regulatory Audit</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right Pane: Critical Blockers & Action Queue */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      CRITICAL DISPATCH BLOCKERS
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Direct regulatory bottlenecks preventing cargo release from port customs
                  </p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold border ${
                    readinessData.blockers.length === 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {readinessData.blockers.length} Active Blocker{readinessData.blockers.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Blocker Cards List */}
              {readinessData.blockers.length > 0 ? (
                <div className="space-y-3">
                  {readinessData.blockers.map((blocker) => (
                    <div
                      key={blocker.id}
                      className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-amber-50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-600 text-white">
                            BLOCKS DISPATCH
                          </span>
                          <strong className="text-sm text-slate-900">{blocker.title}</strong>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-normal">
                          {blocker.reason || 'Mandatory foreign customs prerequisite must be satisfied prior to port gate-in.'}
                        </p>
                      </div>

                      <Link
                        href={blocker.actionUrl || '/readiness'}
                        className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Resolve Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 space-y-2 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-base font-serif text-emerald-950">
                    Green Channel Active — 0 Dispatch Blockers
                  </h4>
                  <p className="text-xs text-emerald-800 max-w-md mx-auto">
                    Your shipment dossier meets all statutory guidelines for customs Let Export Order (LEO) processing.
                  </p>
                </div>
              )}

              {/* Prioritized Next Action Queue */}
              {readinessData.nextActions && readinessData.nextActions.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Prioritized Action Queue:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {readinessData.nextActions.map((action) => {
                      let targetUrl = '/readiness';
                      let btnText = 'Execute →';
                      if (action.type === 'document') {
                        targetUrl = '/documents';
                        btnText = 'Upload Doc →';
                      } else if (action.type === 'certification') {
                        targetUrl = '/certifications';
                        btnText = 'Request Cert →';
                      } else if (action.type === 'packaging' || action.type === 'labelling') {
                        targetUrl = '/packaging';
                        btnText = 'Complete Item →';
                      } else if (action.type === 'shipment') {
                        targetUrl = '/shipments';
                        btnText = 'Book Cargo →';
                      }

                      return (
                        <div
                          key={action.id}
                          className="p-3 rounded-xl bg-[#FAF9F6] border border-slate-200 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5 truncate">
                            <strong className="block text-slate-900 truncate">{action.title}</strong>
                            <span className="text-[11px] text-slate-500 block">{action.actionText}</span>
                          </div>
                          <Link
                            href={targetUrl}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-[11px] hover:bg-slate-800 shrink-0"
                          >
                            {btnText}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Onboarding &amp; Trade Corridor Setup
              </span>
              <h3 className="text-2xl font-bold font-serif text-slate-900">
                Configure Export Product &amp; Target Destination
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Set up your export product catalog and target foreign country to activate real-time readiness scoring, blocker detection, and statutory document checklists.
              </p>
            </div>
            <Link
              href="/products"
              className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 shrink-0"
            >
              <span>Setup Export Product</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            3. READINESS BREAKDOWN (5 WEIGHTED PILLARS MATRIX)
        ───────────────────────────────────────────────────────────── */}
        {readinessData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-700 block">
                  AUDIT PILLARS BREAKDOWN
                </span>
                <h3 className="text-xl font-bold font-serif text-slate-900">
                  Export Readiness Weighted Contribution Matrix
                </h3>
              </div>
              <Link
                href="/readiness"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <span>View Full Audit</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* 1. Business & Registrations */}
              <Link
                href="/business"
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 hover:border-orange-300 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-semibold">1. Business Profile</span>
                  <span className="font-bold text-slate-900 font-mono">{readinessData.categoryScores.business.score}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${readinessData.categoryScores.business.score}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-emerald-700 font-semibold pt-1">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> GST &amp; IEC Verified</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              {/* 2. Export Documents */}
              <Link
                href="/documents"
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 hover:border-orange-300 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-semibold">2. Export Documents</span>
                  <span className="font-bold text-slate-900 font-mono">{readinessData.categoryScores.documents.score}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all"
                    style={{ width: `${readinessData.categoryScores.documents.score}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-orange-700 font-semibold pt-1">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Invoices &amp; COO Vault</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              {/* 3. Product Certifications */}
              <Link
                href="/certifications"
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 hover:border-orange-300 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-semibold">3. Certifications</span>
                  <span className="font-bold text-slate-900 font-mono">{readinessData.categoryScores.certifications.score}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${readinessData.categoryScores.certifications.score}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-amber-700 font-semibold pt-1">
                  <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Lab &amp; Phyto Certs</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              {/* 4. Packaging & Labelling */}
              <Link
                href="/packaging"
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 hover:border-orange-300 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-semibold">4. Packaging &amp; Labels</span>
                  <span className="font-bold text-slate-900 font-mono">{readinessData.categoryScores.packaging.score}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all"
                    style={{ width: `${readinessData.categoryScores.packaging.score}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-700 font-semibold pt-1">
                  <span className="flex items-center gap-1"><Box className="w-3.5 h-3.5 text-blue-600" /> ISPM-15 Wood Pallets</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              {/* 5. Shipment Prerequisites */}
              <Link
                href="/shipments"
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 hover:border-orange-300 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-semibold">5. Shipment Booking</span>
                  <span className="font-bold text-slate-900 font-mono">{readinessData.categoryScores.shipment.score}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-400 h-full rounded-full transition-all"
                    style={{ width: `${readinessData.categoryScores.shipment.score}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-700 font-semibold pt-1">
                  <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-orange-600" /> Carrier &amp; Port Slot</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            4. ACTIVE EXPORT SHIPMENT (CONNECTED OPERATIONAL OBJECT)
        ───────────────────────────────────────────────────────────── */}
        {activeShipment ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
            {/* Top Shipment Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-orange-700 uppercase tracking-wider block">
                  ACTIVE OPERATIONAL CARGO
                </span>
                <h3 className="text-2xl font-bold text-slate-900 font-serif mt-0.5">
                  Shipment #{activeShipment.shipmentNumber}
                </h3>
              </div>
              
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  Status: {activeShipment.status}
                </span>

                <Link
                  href={`/shipments/${activeShipment.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <span>Manage Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 4-Pillar Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider block">Export Product</span>
                <strong className="block text-slate-900 text-sm font-bold truncate">
                  {activeShipment.product.name}
                </strong>
                <span className="text-[11px] text-slate-500">
                  Quantity: {activeShipment.quantity} {activeShipment.product.unit || 'MT'} ({activeShipment.weight.toLocaleString('en-IN')} KG)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider block">Destination Port</span>
                <strong className="block text-slate-900 text-sm font-bold truncate">
                  {activeShipment.destinationCity}, {activeShipment.destinationCountry.name}
                </strong>
                <span className="text-[11px] text-slate-500">
                  Port of Loading: JNPT Nhava Sheva (INNSA1)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider block">Declared Invoice Value</span>
                <strong className="block text-slate-900 text-sm font-bold font-mono">
                  ₹{activeShipment.value.toLocaleString('en-IN')} {activeShipment.currency || 'INR'}
                </strong>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Duty Drawback / RoDTEP Eligible
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider block">Logistics Quote Status</span>
                <strong className="block text-orange-700 text-sm font-bold">
                  {activeShipment.quotes.some((q) => q.isSelected) ? '✓ Provider Quote Selected' : `${activeShipment.quotes.length} Quotes Available`}
                </strong>
                <span className="text-[11px] text-slate-500">
                  Mode: {activeShipment.mode || 'Ocean FCL Reefer'}
                </span>
              </div>
            </div>

            {/* Connected Action Buttons with Strict Hierarchy */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={`/shipments/${activeShipment.id}/tracking`}
                className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-white" />
                <span>Live Milestone Tracking</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href={`/shipments/${activeShipment.id}/quotes`}
                className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Truck className="w-4 h-4 text-orange-400" />
                <span>Compare Freight Quotes</span>
              </Link>

              <a
                href={`/api/export-documents/invoice?shipmentId=${activeShipment.id}`}
                download={`Commercial_Invoice_${activeShipment.shipmentNumber}.pdf`}
                className="px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Download Commercial Invoice PDF</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-orange-700 uppercase tracking-wider block">
                EXPORT CARGO DISPATCH PIPELINE
              </span>
              <h3 className="text-2xl font-bold text-slate-900 font-serif">
                No Active Export Cargo in Dispatch Pipeline
              </h3>
              <p className="text-xs text-slate-600 max-w-lg">
                Create a new export shipment to orchestrate container booking, compare multi-carrier freight quotes, file customs declarations, and track live milestones.
              </p>
            </div>

            <Link
              href="/shipments"
              className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Export Shipment</span>
            </Link>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            5. COST & TIMELINE INTELLIGENCE (ANALYTICAL ESTIMATE)
        ───────────────────────────────────────────────────────────── */}
        <div className="bg-[#090D16] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-lg font-bold font-serif text-white">
                  Cost &amp; Timeline Predictive Intelligence
                </h4>
                <p className="text-xs text-slate-400">
                  Calculated based on historical port clearance velocities and active carrier freight schedules
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-orange-500/15 text-orange-400 font-mono font-bold px-3 py-1 rounded-full border border-orange-500/30">
              INDICATIVE ESTIMATE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
                Estimated Preparation Lead Time
              </span>
              <span className="block text-2xl sm:text-3xl font-black font-serif text-white font-mono">
                4–6 Days
              </span>
              <span className="text-[11px] text-slate-400 block pt-1">
                Phytosanitary &amp; NABL lab test certification turnaround
              </span>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
                Estimated Freight Logistics Cost
              </span>
              <span className="block text-2xl sm:text-3xl font-black font-serif text-orange-400 font-mono">
                ₹125,000 – ₹155,000
              </span>
              <span className="text-[11px] text-slate-400 block pt-1">
                Sea Freight FCL 20ft Reefer to Jebel Ali Port (UAE)
              </span>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
                Estimated Ocean Transit Time
              </span>
              <span className="block text-2xl sm:text-3xl font-black font-serif text-white font-mono">
                12–15 Days
              </span>
              <span className="text-[11px] text-slate-400 block pt-1">
                {business?.city ? `${business.city} Origin Factory to Destination Port` : 'Factory Origin to Jebel Ali Port'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
