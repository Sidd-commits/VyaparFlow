'use client';

import React, { useState } from 'react';
import { ArrowRight, ChevronRight, Info } from 'lucide-react';
import { ReadinessScoreResult } from '@/lib/services/readiness';
import StatusBadge from './StatusBadge';
import ReadinessDrawer from './ReadinessDrawer';

interface ExportReadinessSummaryProps {
  readinessData: ReadinessScoreResult;
  productName?: string;
  destinationCountryName?: string;
  destinationCountryIso?: string;
}

export default function ExportReadinessSummary({
  readinessData,
  productName = 'Export Commodity',
  destinationCountryName = 'Target Destination',
  destinationCountryIso = '--',
}: ExportReadinessSummaryProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { totalScore, blockers, readinessState } = readinessData;
  const isHealthy = totalScore >= 85 && blockers.length === 0;

  // Plain-language single sentence summary
  const summarySentence = isHealthy
    ? 'All statutory requirements are verified. Your shipment is cleared for dispatch.'
    : blockers.length === 1
    ? '1 action is required before your shipment can be released.'
    : `${blockers.length} actions are required before your shipment can be released.`;

  return (
    <>
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Metric + Status */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Export Readiness
              </span>
              <StatusBadge
                status={isHealthy ? 'Cleared for dispatch' : readinessState}
                variant={isHealthy ? 'approved' : 'blocked'}
              />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
                {totalScore}
              </span>
              <span className="text-base font-semibold text-slate-400">/ 100</span>
            </div>

            <p className="text-xs text-slate-600 font-normal leading-normal max-w-xl">
              {summarySentence}
            </p>
          </div>

          {/* Right: Drawer Button */}
          <div className="shrink-0 flex sm:flex-col items-start sm:items-end justify-between gap-2 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 transition-colors cursor-pointer group"
            >
              <span>View score breakdown</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <span className="text-[11px] text-slate-400">
              {productName} &rarr; {destinationCountryName}
            </span>
          </div>
        </div>

        {/* Subtle Progress Track */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-4">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isHealthy
                ? 'bg-emerald-500'
                : totalScore >= 60
                ? 'bg-amber-500'
                : 'bg-orange-600'
            }`}
            style={{ width: `${totalScore}%` }}
          />
        </div>
      </div>

      <ReadinessDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        readinessData={readinessData}
        productName={productName}
        destinationCountryName={destinationCountryName}
      />
    </>
  );
}
