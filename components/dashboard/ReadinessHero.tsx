import React from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Globe2 } from 'lucide-react';
import { ReadinessScoreResult } from '@/lib/services/readiness';

interface ReadinessHeroProps {
  readinessData: ReadinessScoreResult;
  productName?: string;
  originCity?: string;
  destinationCountryName?: string;
  destinationCountryIso?: string;
}

export default function ReadinessHero({
  readinessData,
  productName = 'Export Commodity',
  originCity = 'Mumbai',
  destinationCountryName = 'United Arab Emirates',
  destinationCountryIso = 'ARE',
}: ReadinessHeroProps) {
  const isHealthy = readinessData.totalScore >= 85 && readinessData.blockers.length === 0;

  return (
    <div className="bg-[#090D16] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-amber-400'} animate-ping`} />
          <span className="text-xs uppercase tracking-wider text-orange-400 font-bold">
            EXPORT READINESS SCORE
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
          {productName}
        </h3>
        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
          <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span>{originCity} (JNPT)</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <Globe2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>{destinationCountryName} ({destinationCountryIso})</span>
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
              isHealthy
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
              isHealthy
                ? 'bg-linear-to-r from-emerald-500 to-teal-400'
                : 'bg-linear-to-r from-orange-500 to-amber-400'
            }`}
            style={{ width: `${readinessData.totalScore}%` }}
          />
        </div>

        <p className="text-xs text-slate-400 leading-relaxed pt-1">
          {readinessData.blockers.length > 0
            ? `${readinessData.blockers.length} critical statutory requirement(s) blocking customs Let Export Order (LEO). Resolve below to authorize container dispatch.`
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
  );
}
