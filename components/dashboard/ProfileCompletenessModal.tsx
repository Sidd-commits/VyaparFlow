'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building2,
  MapPin,
  FileText,
  Package,
  Globe2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { ProfileCompletenessResult, calculateProfileCompletenessFromData } from '@/lib/services/profileCompleteness';

interface ProfileCompletenessModalProps {
  business: {
    id: string;
    displayName: string;
    legalName: string;
    businessType: string;
    location: string;
    city: string;
    state: string;
    gstStatus: string;
    iecStatus: string;
    profileCompletion?: number | null;
    products?: any[];
    documents?: any[];
  };
  triggerClassName?: string;
  triggerElement?: React.ReactNode;
}

export default function ProfileCompletenessModal({
  business,
  triggerClassName,
  triggerElement,
}: ProfileCompletenessModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const profileData: ProfileCompletenessResult = calculateProfileCompletenessFromData(business);
  const { totalScore, tier, categoryScores, checklist, nextRecommendedAction } = profileData;

  const getPillarIcon = (category: string) => {
    switch (category) {
      case 'identity':
        return <Building2 className="w-4 h-4 text-orange-600" />;
      case 'address':
        return <MapPin className="w-4 h-4 text-blue-600" />;
      case 'tax_registration':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'catalog':
        return <Package className="w-4 h-4 text-purple-600" />;
      case 'corridor':
        return <Globe2 className="w-4 h-4 text-amber-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <>
      {triggerElement ? (
        <div onClick={() => setIsOpen(true)} className="cursor-pointer">
          {triggerElement}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={
            triggerClassName ||
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs'
          }
          title="View profile completeness breakdown"
        >
          <CheckCircle2
            className={`w-3.5 h-3.5 ${
              totalScore >= 80 ? 'text-emerald-600' : totalScore >= 50 ? 'text-amber-500' : 'text-orange-500'
            }`}
          />
          <span>Profile {totalScore}%</span>
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 font-serif">
                      MSME Profile Completeness Index
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        totalScore >= 80
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : totalScore >= 50
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-orange-100 text-orange-800 border border-orange-300'
                      }`}
                    >
                      {tier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Deterministic compliance engine verification across 5 mandatory dimensions.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Overall Score Summary */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Overall Profile Health
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                        {totalScore}
                      </span>
                      <span className="text-sm font-semibold text-slate-400">/ 100</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-600 block">Status Level:</span>
                    <span className="text-xs font-bold text-slate-900">{tier}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      totalScore >= 80
                        ? 'bg-emerald-500'
                        : totalScore >= 50
                        ? 'bg-amber-500'
                        : 'bg-orange-600'
                    }`}
                    style={{ width: `${totalScore}%` }}
                  />
                </div>

                {nextRecommendedAction && (
                  <div className="p-3 bg-white rounded-xl border border-orange-200 flex items-center justify-between gap-3 mt-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                        Top Recommendation (+{nextRecommendedAction.pointsToGain} pts)
                      </span>
                      <p className="text-xs font-semibold text-slate-800">
                        {nextRecommendedAction.label}
                      </p>
                    </div>
                    <Link
                      href={nextRecommendedAction.actionUrl}
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1 shadow-2xs"
                    >
                      <span>{nextRecommendedAction.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {/* 5 Pillars Summary Grid */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Weighted Pillar Contribution
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(categoryScores).map(([catKey, cat]) => {
                    const isPassed = cat.score === cat.maxPoints;
                    return (
                      <div
                        key={catKey}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-semibold text-slate-800">
                            {getPillarIcon(catKey)}
                            <span>{cat.label}</span>
                          </div>
                          <span className="font-mono font-bold text-slate-900">
                            {cat.score} / {cat.maxPoints} pts
                          </span>
                        </div>

                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isPassed ? 'bg-emerald-500' : cat.score > 0 ? 'bg-amber-500' : 'bg-slate-300'
                            }`}
                            style={{ width: `${(cat.score / cat.maxPoints) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Itemized Checklist */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Itemized Verification Checklist
                </span>

                <div className="space-y-2">
                  {checklist.map((item) => {
                    const isDone = item.status === 'completed';
                    const isPending = item.status === 'pending';

                    return (
                      <div
                        key={item.key}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          isDone
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : isPending
                            ? 'bg-amber-50/40 border-amber-200'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : isPending ? (
                            <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                          )}

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{item.label}</span>
                              <span className="font-mono text-[11px] text-slate-500 font-semibold">
                                ({item.points}/{item.maxPoints} pts)
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600">{item.reason}</p>
                          </div>
                        </div>

                        {!isDone && (
                          <Link
                            href={item.actionUrl}
                            onClick={() => setIsOpen(false)}
                            className="text-[11px] font-bold text-orange-600 hover:text-orange-700 shrink-0 flex items-center gap-1 hover:underline"
                          >
                            <span>{item.actionText}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                100% profile completeness enables instant green-channel compliance clearance.
              </span>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
