'use client';

import React, { useState } from 'react';
import {
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Percent,
  Info,
  ExternalLink,
} from 'lucide-react';
import { type TariffIntelligenceData } from '@/lib/services/applicability';

interface TariffIntelligenceCardProps {
  data: TariffIntelligenceData;
}

export default function TariffIntelligenceCard({ data }: TariffIntelligenceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Summary Row */}
      <div className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs">
                Tariff &amp; Trade Agreement
              </span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {data.dutySavings || 'Duty arbitrage active'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              HS {data.hsCode} &bull; {data.corridorName} &bull; Preferential: <strong className="text-emerald-700 font-semibold">{data.preferentialTariff}</strong> (vs {data.standardMfnTariff} MFN)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 self-start sm:self-auto cursor-pointer transition-colors"
        >
          <span>{isExpanded ? 'Hide details' : 'View tariff breakdown'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Progressive Disclosure Details */}
      {isExpanded && (
        <div className="p-4 sm:px-5 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block">
                Standard MFN Tariff
              </span>
              <div className="text-base font-bold text-slate-800 font-mono">
                {data.standardMfnTariff}
              </div>
              <p className="text-[10px] text-slate-400">Standard WTO import duty</p>
            </div>

            <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-1">
              <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-emerald-600" />
                Preferential Tariff
              </span>
              <div className="text-base font-bold text-emerald-800 font-mono">
                {data.preferentialTariff}
              </div>
              <p className="text-[10px] text-emerald-700">{data.dutySavings}</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block">
                Applicable Agreement
              </span>
              <div className="text-xs font-bold text-slate-900 line-clamp-2">
                {data.tradeAgreement}
              </div>
              <p className="text-[10px] text-slate-400">Rules: {data.rulesOfOriginRule}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-normal">
              <span className="font-semibold">Source:</span> {data.sourceAuthority} &bull;{' '}
              <span className="font-semibold">Audited:</span> {data.lastVerifiedDate} &bull;{' '}
              {data.disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
