import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Box,
  Truck,
  ChevronRight,
} from 'lucide-react';
import { ReadinessScoreResult } from '@/lib/services/readiness';

interface ReadinessBreakdownProps {
  categoryScores: ReadinessScoreResult['categoryScores'];
}

export default function ReadinessBreakdown({ categoryScores }: ReadinessBreakdownProps) {
  return (
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
            <span className="font-bold text-slate-900 font-mono">{categoryScores.business.score}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${categoryScores.business.score}%` }}
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
            <span className="font-bold text-slate-900 font-mono">{categoryScores.documents.score}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-orange-500 h-full rounded-full transition-all"
              style={{ width: `${categoryScores.documents.score}%` }}
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
            <span className="font-bold text-slate-900 font-mono">{categoryScores.certifications.score}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{ width: `${categoryScores.certifications.score}%` }}
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
            <span className="font-bold text-slate-900 font-mono">{categoryScores.packaging.score}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${categoryScores.packaging.score}%` }}
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
            <span className="font-bold text-slate-900 font-mono">{categoryScores.shipment.score}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-slate-400 h-full rounded-full transition-all"
              style={{ width: `${categoryScores.shipment.score}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-700 font-semibold pt-1">
            <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-orange-600" /> Carrier &amp; Port Slot</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
