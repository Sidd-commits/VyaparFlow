import React from 'react';
import AppShell from '@/components/AppShell';

export default function ShipmentsLoading() {
  return (
    <AppShell currentRole="MSME">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="h-3 w-40 bg-orange-200 rounded-md" />
            <div className="h-8 w-72 bg-slate-200 rounded-lg" />
            <div className="h-4 w-60 bg-slate-100 rounded-md" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="h-6 w-44 bg-slate-200 rounded" />
            <div className="space-y-3 pt-2">
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-11 bg-orange-200 rounded-xl" />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="h-6 w-40 bg-slate-200 rounded" />
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs h-48 space-y-3">
                <div className="h-5 w-48 bg-slate-300 rounded" />
                <div className="h-4 w-64 bg-slate-200 rounded" />
                <div className="h-12 bg-slate-50 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
