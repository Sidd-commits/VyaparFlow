import React from 'react';
import AppShell from '@/components/AppShell';

export default function BusinessLoading() {
  return (
    <AppShell currentRole="MSME">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="h-3 w-40 bg-orange-200 rounded-md" />
            <div className="h-8 w-80 bg-slate-200 rounded-lg" />
            <div className="h-4 w-48 bg-slate-100 rounded-md" />
          </div>
          <div className="h-12 w-36 bg-slate-100 rounded-xl" />
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs h-96 space-y-4">
            <div className="h-6 w-48 bg-slate-300 rounded" />
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-40 bg-slate-50 rounded-xl" />
          </div>
          <div className="lg:col-span-6 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs h-96 space-y-4">
            <div className="h-6 w-52 bg-slate-300 rounded" />
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-40 bg-slate-50 rounded-xl" />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
