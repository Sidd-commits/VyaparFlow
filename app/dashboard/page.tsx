import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
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
  Upload,
  ShieldAlert,
  MapPin,
  TrendingUp,
  AlertOctagon,
  FileCheck2,
  ExternalLink,
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

  // MSME Exporter Dashboard
  const business = user?.businesses[0];
  const product = business?.products[0];
  const destination = product?.destinations[0];

  let readinessData = null;
  if (destination) {
    readinessData = await calculateReadinessScore(destination.id);
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

  // Get recent documents needing attention
  const pendingDocs = await prisma.document.findMany({
    where: { businessId: business?.id, status: { in: ['missing', 'under_review', 'rejected', 'expired'] } },
    take: 4,
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 pb-16 font-sans">
      <Navbar currentRole={role} userEmail={user?.email} userName={user?.name} allUsers={allUsers} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              Location: {business?.location || 'Registered Industrial Hub'}, {business?.city || 'Mumbai'}, {business?.state || 'Maharashtra'}
            </div>
            <h1 className="text-3xl font-black text-slate-900 font-serif">
              {business?.displayName || `${user?.name || 'MSME'} Global Exporters`}
            </h1>
            <p className="text-xs text-slate-500">
              Legal Entity: {business?.legalName || `${user?.name || 'MSME'} Enterprises Pvt Ltd`} • GST: {business?.gstStatus || 'Active (27AAACP1234F1Z5)'} • IEC: {business?.iecStatus || 'Active (0301099882)'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 w-full md:w-auto">
            <div className="text-right">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Profile Completion
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {business?.profileCompletion || 85}%
              </span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-slate-200 flex items-center justify-center font-bold text-xs text-emerald-600">
              ✓
            </div>
          </div>
        </div>

        {/* Readiness Score Summary & Category Cards */}
        {readinessData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Score Widget */}
            <div className="lg:col-span-4 bg-slate-900 text-white rounded-2xl p-6 md:p-8 border border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-orange-400">
                    Export Readiness Index
                  </span>
                  <h3 className="text-xl font-bold mt-1 font-serif text-white">
                    {product?.name} → {destination?.country.name}
                  </h3>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md border border-slate-700 font-semibold">
                  Deterministic MVP Model
                </span>
              </div>

              {/* Big Score Display */}
              <div className="flex items-baseline gap-3 my-2">
                <span className="text-6xl font-black text-orange-500 font-serif">
                  {readinessData.totalScore}
                </span>
                <span className="text-2xl font-bold text-slate-400">/ 100</span>
              </div>

              {/* Status Pill */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {readinessData.readinessState.includes('Blockers') ? (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                      <AlertOctagon className="w-4 h-4 text-amber-400" />
                      {readinessData.readinessState}
                    </span>
                  ) : (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {readinessData.readinessState}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {readinessData.blockers.length > 0
                    ? `${readinessData.blockers.length} critical compliance items require your attention before dispatch can be authorized.`
                    : 'All critical prerequisites complete! Your business is export ready.'}
                </p>
              </div>

              <Link
                href="/readiness"
                className="w-full py-3 text-center bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2"
              >
                Inspect Full Readiness Audit <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 5 Category Breakdown Grid */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                  <span>Business & Registrations</span>
                  <span className="font-bold text-slate-900">{readinessData.categoryScores.business.score}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${readinessData.categoryScores.business.score}%` }} />
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> GST & IEC Verified
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                  <span>Export Documents</span>
                  <span className="font-bold text-slate-900">{readinessData.categoryScores.documents.score}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: `${readinessData.categoryScores.documents.score}%` }} />
                </div>
                <span className="text-[11px] text-orange-600 font-semibold flex items-center gap-1 pt-1">
                  <Clock className="w-3.5 h-3.5" /> 1 Under Review
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                  <span>Product Certifications</span>
                  <span className="font-bold text-slate-900">{readinessData.categoryScores.certifications.score}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${readinessData.categoryScores.certifications.score}%` }} />
                </div>
                <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1 pt-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Phytosanitary Missing
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                  <span>Packaging & Labelling</span>
                  <span className="font-bold text-slate-900">{readinessData.categoryScores.packaging.score}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${readinessData.categoryScores.packaging.score}%` }} />
                </div>
                <span className="text-[11px] text-slate-600 font-semibold flex items-center gap-1 pt-1">
                  <Box className="w-3.5 h-3.5" /> 2 / 3 Checklist Done
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                  <span>Shipment Prerequisites</span>
                  <span className="font-bold text-slate-900">{readinessData.categoryScores.shipment.score}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{ width: `${readinessData.categoryScores.shipment.score}%` }} />
                </div>
                <span className="text-[11px] text-slate-600 font-semibold flex items-center gap-1 pt-1">
                  <Truck className="w-3.5 h-3.5" /> Draft Ready
                </span>
              </div>

              <div className="bg-orange-50 p-5 rounded-2xl border border-orange-200 shadow-xs flex flex-col justify-center items-center text-center space-y-2">
                <FileCheck2 className="w-6 h-6 text-orange-600" />
                <span className="text-xs font-bold text-orange-900">Resolve Blockers Fast</span>
                <Link href="/readiness" className="text-xs font-bold text-orange-600 hover:underline">
                  Take Next Actions →
                </Link>
              </div>
            </div>
          </div>
        )}



        {/* Third Row: Active Shipment Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Active Shipment Workflow
              </span>
              <h3 className="text-2xl font-bold text-slate-900 font-serif">
                Shipment #{activeShipment?.shipmentNumber || 'SHP-2026-AE-001'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Status: {activeShipment?.status || 'Draft'}
              </span>
              <Link
                href={`/shipments/${activeShipment?.id || 'demo'}`}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                Manage Shipment Details <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 font-medium">Export Product</span>
              <span className="block font-bold text-slate-900 text-sm">
                {activeShipment?.product.name || 'Alphonso Mango Pulp (10 MT)'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-medium">Destination Market</span>
              <span className="block font-bold text-slate-900 text-sm">
                {activeShipment?.destinationCity}, {activeShipment?.destinationCountry.name}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-medium">Declared Invoice Value</span>
              <span className="block font-bold text-slate-900 text-sm">
                ₹{activeShipment?.value.toLocaleString('en-IN') || '1,500,000'} INR
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-medium">Logistics Quote Status</span>
              <span className="block font-bold text-orange-600 text-sm">
                {activeShipment?.quotes.some((q) => q.isSelected) ? 'Quote Selected' : '3 Quotes Available for Comparison'}
              </span>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`/shipments/${activeShipment?.id}/quotes`}
              className="px-4 py-2.5 rounded-xl bg-orange-50 text-orange-700 font-bold text-xs border border-orange-200 hover:bg-orange-100 transition-colors flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4" /> Compare Logistics Quotes
            </Link>

            <Link
              href={`/api/export-documents/invoice?shipmentId=${activeShipment?.id}`}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-slate-600" /> Download Commercial Invoice PDF
            </Link>

            <Link
              href={`/shipments/${activeShipment?.id}/tracking`}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4 text-orange-400" /> Live Tracking Timeline
            </Link>
          </div>
        </div>

        {/* Fourth Row: Cost & Timeline Indicative Estimate Summary */}
        <div className="bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 md:p-8 border border-slate-800 shadow-lg space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <h4 className="text-lg font-bold font-serif text-white">Indicative Cost & Timeline Estimate</h4>
            </div>
            <span className="text-[10px] bg-orange-500/20 text-orange-300 font-semibold px-2.5 py-1 rounded-full border border-orange-500/40">
              Indicative estimate label
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1">
              <span className="text-slate-400 text-xs font-medium">Estimated Preparation Days</span>
              <span className="block text-2xl font-bold text-white">4–6 Days</span>
              <span className="text-[11px] text-slate-400">Based on phytosanitary lab testing lead time</span>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1">
              <span className="text-slate-400 text-xs font-medium">Estimated Logistics Freight Cost</span>
              <span className="block text-2xl font-bold text-orange-400">₹125,000 – ₹155,000 INR</span>
              <span className="text-[11px] text-slate-400">Sea Freight FCL 20ft Reefer to Dubai</span>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1">
              <span className="text-slate-400 text-xs font-medium">Estimated Transit Time</span>
              <span className="block text-2xl font-bold text-white">12–15 Days</span>
              <span className="text-[11px] text-slate-400">{business?.city ? `${business.city} Origin Factory to Destination Port` : 'Factory Origin to Jebel Ali Port'}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
