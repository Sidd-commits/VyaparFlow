import React from 'react';
import AppShell from '@/components/AppShell';

export default function PackagingLoading() {
  return (
    <AppShell currentRole="MSME">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="h-3 w-44 bg-orange-200 rounded-md" />
            <div className="h-8 w-80 bg-slate-200 rounded-lg" />
            <div className="h-4 w-64 bg-slate-100 rounded-md" />
          </div>
        </div>

        {/* Checklist Skeleton */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="h-6 w-56 bg-slate-200 rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-slate-300 rounded" />
                  <div className="h-3 w-72 bg-slate-200 rounded" />
                </div>
                <div className="h-8 w-28 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
