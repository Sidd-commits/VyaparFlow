'use client';

import React from 'react';
import {
  ShieldCheck,
  Truck,
  FileCheck2,
  Clock,
  Award,
  AlertTriangle,
  TrendingUp,
  Building2,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface ProviderStatsHeaderProps {
  providerName: string;
  providerType: string;
  serviceArea: string;
  totalTasks: number;
  pendingTasksCount: number;
  openRfqsCount: number;
  activeShipmentsCount: number;
  completedTasksCount: number;
  currentTypeFilter?: string;
  onTypeFilterChange?: (type: string) => void;
}

export default function ProviderStatsHeader({
  providerName,
  providerType,
  serviceArea,
  totalTasks,
  pendingTasksCount,
  openRfqsCount,
  activeShipmentsCount,
  completedTasksCount,
  currentTypeFilter = 'ALL',
  onTypeFilterChange,
}: ProviderStatsHeaderProps) {
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'CERTIFICATION':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CUSTOMS_CHA':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'FREIGHT':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'INSURANCE':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-12 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-400 flex items-center gap-1.5 bg-orange-950/60 px-3 py-1 rounded-full border border-orange-800/60">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400" /> Accredited Trade Partner &amp; CHA Command Hub
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getBadgeColor(providerType)}`}>
                {providerType} PARTNER
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-serif tracking-tight">
              {providerName || 'Trade Partner Operations Center'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Orchestrate MSME freight rate bids, execute NABL laboratory test audits, file ICEGATE Let Export Orders (LEO), and broadcast real-time cargo milestone telemetry.
            </p>
          </div>

          {/* Quick Partner Trust Badge */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shrink-0">
            <div className="text-left lg:text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Partner Trust SLA
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-serif">
                99.4% Verified
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-300">
              <Clock className="w-3.5 h-3.5 text-orange-400" /> Avg Turnaround: <strong>3.8h</strong>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Pending Audits</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 font-serif">{pendingTasksCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">requiring review</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Inbound RFQs</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-orange-600 font-serif">{openRfqsCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">active quote requests</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active Cargo</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">{activeShipmentsCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">consignments in transit</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Cleared</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-serif">{completedTasksCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">tasks finalized</span>
          </div>
        </div>
      </div>
    </div>
  );
}
