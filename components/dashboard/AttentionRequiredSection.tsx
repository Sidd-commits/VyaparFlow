'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  X,
  FileText,
  Award,
  Box,
  Truck,
  Building2,
} from 'lucide-react';
import { ReadinessScoreResult } from '@/lib/services/readiness';
import StatusBadge, { normalizeStatusVariant } from './StatusBadge';

interface AttentionRequiredSectionProps {
  readinessData: ReadinessScoreResult;
}

export default function AttentionRequiredSection({
  readinessData,
}: AttentionRequiredSectionProps) {
  const [isAllDrawerOpen, setIsAllDrawerOpen] = useState(false);
  const { blockers, nextActions } = readinessData;

  // Combine top items for attention (prioritize blockers, then fallback to nextActions if needed)
  const attentionItems = blockers.length > 0
    ? blockers
    : nextActions.map((na) => ({
        id: na.id,
        title: na.title,
        type: na.type,
        priority: 'standard',
        reason: na.actionText || 'Compliance checklist item',
        status: na.status || 'pending',
        actionUrl:
          na.type === 'document'
            ? '/documents'
            : na.type === 'certification'
            ? '/certifications'
            : na.type === 'packaging' || na.type === 'labelling'
            ? '/packaging'
            : '/shipments',
        isPendingVerification: false,
        isRejected: false,
      }));

  const visibleItems = attentionItems.slice(0, 3);
  const remainingCount = Math.max(0, attentionItems.length - 3);

  // Helper to determine action button text and style
  const getActionLabel = (item: {
    status: string;
    isPendingVerification?: boolean;
    isRejected?: boolean;
  }) => {
    if (item.isPendingVerification || item.status === 'under_review') {
      return 'View status';
    }
    if (item.isRejected || item.status === 'rejected') {
      return 'Replace document';
    }
    return 'Resolve';
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            What needs your attention
          </h2>
          {attentionItems.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {attentionItems.length}
            </span>
          )}
        </div>

        {attentionItems.length > 3 && (
          <button
            type="button"
            onClick={() => setIsAllDrawerOpen(true)}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View all ({attentionItems.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Actionable List / Empty State */}
      {attentionItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-900">You&apos;re all set</h3>
            <p className="text-xs text-slate-500 font-normal">
              No outstanding actions are blocking your export shipment.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {visibleItems.map((item, idx) => {
            const isPending = item.isPendingVerification || item.status === 'under_review';
            const isRejected = item.isRejected || item.status === 'rejected';

            const statusText = isPending
              ? 'Verification pending'
              : isRejected
              ? 'Rejected'
              : 'Action required';

            const statusVariant = isPending
              ? 'pending'
              : isRejected
              ? 'rejected'
              : 'blocked';

            const actionLabel = getActionLabel(item);

            return (
              <div
                key={item.id || idx}
                className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {item.title}
                    </span>
                    <StatusBadge status={statusText} variant={statusVariant} />
                  </div>
                  {item.reason && !isPending && (
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {item.reason}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  <Link
                    href={item.actionUrl || '/documents'}
                    prefetch={true}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold active:scale-[0.98] transition-all ${
                      idx === 0
                        ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <span>{actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}

          {remainingCount > 0 && (
            <div className="p-3 bg-slate-50/60 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAllDrawerOpen(true)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>+ {remainingCount} more requirements need attention</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* All Requirements Slide-Over Drawer */}
      {isAllDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="all-requirements-title"
        >
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsAllDrawerOpen(false)}
          />

          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 block">
                  Action Queue
                </span>
                <h2 id="all-requirements-title" className="text-lg font-bold text-slate-900">
                  All Requirements ({attentionItems.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Items requiring resolution or document verification.
                </p>
              </div>

              <button
                onClick={() => setIsAllDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3 text-xs">
              {attentionItems.map((item, idx) => {
                const isPending = item.isPendingVerification || item.status === 'under_review';
                const isRejected = item.isRejected || item.status === 'rejected';

                const statusText = isPending
                  ? 'Verification pending'
                  : isRejected
                  ? 'Rejected'
                  : 'Action required';

                const statusVariant = isPending
                  ? 'pending'
                  : isRejected
                  ? 'rejected'
                  : 'blocked';

                const actionLabel = getActionLabel(item);

                return (
                  <div
                    key={item.id || idx}
                    className="p-4 rounded-xl border border-slate-200 bg-white space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <strong className="text-slate-900 block font-semibold text-xs">
                          {item.title}
                        </strong>
                        <StatusBadge status={statusText} variant={statusVariant} />
                      </div>

                      <Link
                        href={item.actionUrl || '/documents'}
                        prefetch={true}
                        onClick={() => setIsAllDrawerOpen(false)}
                        className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs inline-flex items-center gap-1 shrink-0 active:scale-[0.98] transition-all"
                      >
                        <span>{actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {item.reason && (
                      <p className="text-[11px] text-slate-500 leading-normal">
                        {item.reason}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex justify-between items-center">
              <button
                onClick={() => setIsAllDrawerOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/60 font-semibold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
              <Link
                href="/readiness"
                prefetch={true}
                onClick={() => setIsAllDrawerOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all active:scale-[0.98] flex items-center gap-1.5"
              >
                <span>Open Full Readiness Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
