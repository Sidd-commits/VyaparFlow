import React from 'react';
import AppShell from '@/components/AppShell';

export default function DashboardLoading() {
  return (
    <AppShell currentRole="MSME">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="h-3 w-28 bg-orange-200 rounded-md" />
            <div className="h-8 w-64 bg-slate-200 rounded-lg" />
            <div className="h-4 w-48 bg-slate-100 rounded-md" />
          </div>
          <div className="h-10 w-36 bg-slate-200 rounded-xl" />
        </div>

        {/* Readiness Card Skeleton */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-2">
              <div className="h-5 w-44 bg-slate-200 rounded-md" />
              <div className="h-3 w-60 bg-slate-100 rounded-md" />
            </div>
            <div className="h-12 w-32 bg-slate-200 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-slate-50 border border-slate-200/70 rounded-xl p-3 space-y-2">
                <div className="h-3 w-16 bg-slate-200 rounded" />
                <div className="h-6 w-12 bg-slate-300 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Attention Section Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs h-56" />
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs h-56" />
        </div>
      </div>
    </AppShell>
  );
}
