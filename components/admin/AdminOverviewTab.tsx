'use client';

import React from 'react';
import {
  Building2,
  Ship,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  ArrowUpRight,
  Globe2,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  Clock,
} from 'lucide-react';

interface AdminOverviewTabProps {
  metrics: {
    totalMsmes: number;
    totalShipments: number;
    activeBlockersCount: number;
    pendingDocsCount: number;
    totalRulesCount: number;
    totalAuditLogsCount: number;
    totalPipelineValueINR: number;
    averageReadinessScore: number;
    verifiedMsmesCount: number;
  };
  corridorDistribution: Array<{
    country: string;
    isoCode: string;
    count: number;
    sharePercent: number;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    actorName: string;
    createdAt: string;
  }>;
  onSelectTab: (tab: 'overview' | 'users' | 'verifications' | 'rules' | 'logs') => void;
}

export default function AdminOverviewTab({
  metrics,
  corridorDistribution,
  recentActivity,
  onSelectTab,
}: AdminOverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* 4 Primary System KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Registered MSMEs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative overflow-hidden group hover:border-orange-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              MSME Exporter Network
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-serif">
              {metrics.totalMsmes}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              {metrics.verifiedMsmesCount} verified
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Profile Readiness Avg:</span>
            <strong className="text-slate-900 font-mono font-bold">
              {metrics.averageReadinessScore}%
            </strong>
          </div>
        </div>

        {/* Metric 2: Active Pipeline & Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative overflow-hidden group hover:border-orange-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Export Logistics Pipeline
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Ship className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-orange-600 font-serif">
              {metrics.totalShipments}
            </span>
            <span className="text-xs font-semibold text-slate-500">active consignments</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Pipeline Valuation:</span>
            <strong className="text-slate-900 font-mono font-bold">
              ₹{(metrics.totalPipelineValueINR / 10000000).toFixed(2)} Cr
            </strong>
          </div>
        </div>

        {/* Metric 3: Verification Queue Throughput */}
        <div
          onClick={() => onSelectTab('verifications')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative overflow-hidden group hover:border-orange-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Pending Document Review
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 font-serif">
              {metrics.pendingDocsCount}
            </span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              Action Required
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Review Queue:</span>
            <span className="text-orange-600 font-bold group-hover:underline flex items-center gap-0.5">
              Open Desk →
            </span>
          </div>
        </div>

        {/* Metric 4: Regulatory Rule Matrix */}
        <div
          onClick={() => onSelectTab('rules')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative overflow-hidden group hover:border-orange-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Active Regulatory Rules
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-serif">
              {metrics.totalRulesCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">scoring rules</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Deterministic Engine:</span>
            <span className="text-orange-600 font-bold group-hover:underline flex items-center gap-0.5">
              Manage Rules →
            </span>
          </div>
        </div>
      </div>

      {/* Corridor Distribution & Platform Architecture Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Top International Corridors */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-orange-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Target Export Corridors Distribution
                </h3>
                <p className="text-xs text-slate-500">
                  Live trade corridors mapped to MSME commodities and import rules.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {corridorDistribution.map((corridor) => (
              <div key={corridor.isoCode} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between font-semibold">
                  <div className="flex items-center gap-2 text-slate-900">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-800">
                      {corridor.isoCode}
                    </span>
                    <span>{corridor.country}</span>
                  </div>
                  <span className="text-slate-600 font-mono">
                    {corridor.count} exporter mapping(s) &bull; {corridor.sharePercent}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-600 rounded-full transition-all duration-500"
                    style={{ width: `${corridor.sharePercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 cols: Live Platform Audit Feed */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Real-Time Audit Telemetry
                </h3>
                <p className="text-xs text-slate-500">
                  Latest compliance actions &amp; state mutations.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectTab('logs')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700"
            >
              View All →
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {recentActivity.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-center">
                No recent system logs recorded.
              </div>
            ) : (
              recentActivity.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-slate-100 bg-[#FAF9F6] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs font-mono">
                      {log.action}
                    </span>
                    <span suppressHydrationWarning className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Actor: <strong className="text-slate-700">{log.actorName}</strong></span>
                    <span className="text-slate-400">Entity: {log.entityType}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
