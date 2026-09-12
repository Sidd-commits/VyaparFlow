import React from 'react';
import Link from 'next/link';
import { ShieldAlert, CheckCircle2, ArrowRight, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { ReadinessScoreResult } from '@/lib/services/readiness';

interface CriticalBlockersProps {
  readinessData: ReadinessScoreResult;
}

export default function CriticalBlockers({ readinessData }: CriticalBlockersProps) {
  const { blockers, nextActions } = readinessData;

  const pendingCount = blockers.filter((b) => b.isPendingVerification || b.status === 'under_review').length;
  const rejectedCount = blockers.filter((b) => b.isRejected || b.status === 'rejected').length;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              CRITICAL DISPATCH BLOCKERS
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Direct regulatory bottlenecks preventing cargo release from port customs (Uploaded &ne; Approved)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              {pendingCount} Pending Review
            </span>
          )}
          {rejectedCount > 0 && (
            <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-red-50 text-red-800 border border-red-300 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-red-600" />
              {rejectedCount} Rejected
            </span>
          )}
          <span
            className={`text-xs px-3 py-1 rounded-full font-bold border ${
              blockers.length === 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            {blockers.length} Total Blocker{blockers.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Blocker Cards List */}
      {blockers.length > 0 ? (
        <div className="space-y-3">
          {blockers.map((blocker) => {
            const isPending = blocker.isPendingVerification || blocker.status === 'under_review';
            const isRejected = blocker.isRejected || blocker.status === 'rejected';

            return (
              <div
                key={blocker.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isPending
                    ? 'bg-amber-50/60 border-amber-300 hover:bg-amber-50'
                    : isRejected
                    ? 'bg-red-50/60 border-red-300 hover:bg-red-50'
                    : 'bg-red-50/40 border-red-200/90 hover:bg-red-50/70'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {isPending ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        VERIFICATION PENDING
                      </span>
                    ) : isRejected ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        REJECTED — ACTION REQUIRED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white">
                        BLOCKS DISPATCH
                      </span>
                    )}

                    <strong className="text-sm text-slate-900">{blocker.title}</strong>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {isPending ? (
                      <span className="text-amber-900 font-medium">
                        Submitted successfully. Awaiting platform verification by authorized review partner.
                      </span>
                    ) : isRejected ? (
                      <span className="text-red-900 font-medium">
                        {blocker.reason || 'Document verification rejected. Please review feedback and replace document.'}
                      </span>
                    ) : (
                      blocker.reason || 'Mandatory foreign customs prerequisite must be satisfied prior to port gate-in.'
                    )}
                  </p>
                </div>

                <Link
                  href={blocker.actionUrl || '/documents'}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer ${
                    isPending
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : isRejected
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <span>
                    {isPending ? 'View Status' : isRejected ? 'Replace Document' : 'Resolve Now'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
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
      {nextActions && nextActions.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Prioritized Action Queue:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {nextActions.map((action) => {
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
  );
}
