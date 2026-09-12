'use client';

import React from 'react';
import {
  ShieldAlert,
  HelpCircle,
  FileCheck,
  TrendingDown,
  Info,
  ExternalLink,
  Percent,
  Compass,
} from 'lucide-react';
import { type TariffIntelligenceData } from '@/lib/services/applicability';

interface TariffIntelligenceCardProps {
  data: TariffIntelligenceData;
}

export default function TariffIntelligenceCard({ data }: TariffIntelligenceCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 font-serif">
                Tariff & Trade Agreement Intelligence
              </h3>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                Indicative Analysis
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Corridor duty arbitrage & preferential tariff eligibility.
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] font-semibold text-slate-500 block">
            HS Code Classification
          </span>
          <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
            {data.hsCode}
          </span>
        </div>
      </div>

      {/* Corridor & Agreement Hero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Standard MFN Tariff */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Standard MFN Tariff
          </span>
          <div className="text-lg font-black text-slate-700">{data.standardMfnTariff}</div>
          <p className="text-[10px] text-slate-500">Standard WTO import duty rate</p>
        </div>

        {/* Preferential Tariff */}
        <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-1">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            Preferential Duty (FTA/CEPA)
          </span>
          <div className="text-lg font-black text-emerald-700">{data.preferentialTariff}</div>
          <p className="text-[10px] text-emerald-800 font-medium">{data.dutySavings}</p>
        </div>

        {/* Trade Framework */}
        <div className="p-3.5 bg-sky-50/70 rounded-xl border border-sky-200/80 space-y-1">
          <span className="text-[11px] font-semibold text-sky-800 uppercase tracking-wide">
            Applicable Agreement
          </span>
          <div className="text-xs font-bold text-sky-950 line-clamp-2">{data.tradeAgreement}</div>
          <p className="text-[10px] text-sky-800">Bilateral preferential trade pact</p>
        </div>
      </div>

      {/* Trade Route & Rules of Origin */}
      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
          <span className="text-slate-500 font-medium">Export Trade Corridor:</span>
          <span className="font-semibold text-slate-800">{data.corridorName}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
          <span className="text-slate-500 font-medium">Rules of Origin Criterion:</span>
          <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
            {data.rulesOfOriginRule}
          </span>
        </div>
      </div>

      {/* Authority Source & Regulatory Transparency Disclaimer */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/50 border border-amber-200/70 text-[11px] text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="leading-relaxed">
            <span className="font-semibold">Source Authority:</span> {data.sourceAuthority} &bull;{' '}
            <span className="font-semibold">Last Audited:</span> {data.lastVerifiedDate}
          </p>
          <p className="text-amber-800/90 text-[10px] leading-normal">
            {data.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
