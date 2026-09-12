import React from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, CheckCircle2, ShieldAlert, Clock, AlertCircle } from 'lucide-react';
import { ReadinessScoreResult } from '@/lib/services/readiness';

interface NextBestActionProps {
  readinessData: ReadinessScoreResult;
}

export default function NextBestAction({ readinessData }: NextBestActionProps) {
  const topBlocker = readinessData.blockers[0];
  const nextAction = readinessData.nextActions[0];

  if (!topBlocker && !nextAction) {
    return (
      <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded">
                COMPLIANCE CLEAR
              </span>
              <strong className="text-sm text-emerald-950 font-serif">
                Green Channel Active — No Urgent Action Required
              </strong>
            </div>
            <p className="text-xs text-emerald-800 mt-0.5">
              All statutory export requirements are certified. You are cleared to book carrier freight and generate customs invoices.
            </p>
          </div>
        </div>

        <Link
          href="/shipments"
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all shrink-0 flex items-center gap-1.5"
        >
          <span>Book Shipment →</span>
        </Link>
      </div>
    );
  }

  const isPending = topBlocker?.isPendingVerification || topBlocker?.status === 'under_review';
  const isRejected = topBlocker?.isRejected || topBlocker?.status === 'rejected';

  const actionItem = topBlocker || {
    id: nextAction.id,
    title: nextAction.title,
    reason: 'Statutory compliance checklist requirement for foreign port clearance.',
    actionUrl:
      nextAction.type === 'document'
        ? '/documents'
        : nextAction.type === 'certification'
        ? '/certifications'
        : nextAction.type === 'packaging' || nextAction.type === 'labelling'
        ? '/packaging'
        : '/shipments',
    priority: 'high',
  };

  return (
    <div
      className={`border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
        isPending
          ? 'bg-amber-50/70 border-amber-300'
          : isRejected
          ? 'bg-red-50/70 border-red-300'
          : 'bg-linear-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border-orange-200/90'
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span
            className={`w-6 h-6 rounded-lg text-white flex items-center justify-center shadow-xs ${
              isPending ? 'bg-amber-600' : isRejected ? 'bg-red-600' : 'bg-orange-600'
            }`}
          >
            {isPending ? (
              <Clock className="w-3.5 h-3.5" />
            ) : isRejected ? (
              <AlertCircle className="w-3.5 h-3.5" />
            ) : (
              <Zap className="w-3.5 h-3.5 fill-white" />
            )}
          </span>
          <span
            className={`text-[11px] font-black uppercase tracking-wider ${
              isPending ? 'text-amber-800' : isRejected ? 'text-red-800' : 'text-orange-700'
            }`}
          >
            NEXT BEST ACTION
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider text-white ${
              isPending ? 'bg-amber-500' : isRejected ? 'bg-red-600' : 'bg-red-600'
            }`}
          >
            {isPending
              ? 'VERIFICATION PENDING'
              : isRejected
              ? 'REJECTED — ACTION REQUIRED'
              : 'CRITICAL DISPATCH PRIORITY'}
          </span>
        </div>
        <h4 className="text-base font-bold text-slate-900 font-serif">
          {actionItem.title}
        </h4>
        <p className="text-xs text-slate-700 leading-relaxed max-w-2xl font-normal">
          <strong className="text-slate-900 font-semibold">Status:</strong>{' '}
          {isPending
            ? 'Document submitted. Awaiting platform verification by authorized review partner.'
            : isRejected
            ? `Verification rejected: ${actionItem.reason}`
            : actionItem.reason}
        </p>
      </div>

      <Link
        href={actionItem.actionUrl || '/documents'}
        className={`px-5 py-3 rounded-xl font-bold text-xs shadow-md transition-all shrink-0 flex items-center justify-center gap-2 group cursor-pointer ${
          isPending
            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
            : isRejected
            ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
            : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20'
        }`}
      >
        <span>
          {isPending ? 'View Document Status' : isRejected ? 'Replace Rejected Document' : 'Resolve Now'}
        </span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
