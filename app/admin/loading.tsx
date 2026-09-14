import React from 'react';
import AppShell from '@/components/AppShell';

export default function AdminLoading() {
  return (
    <AppShell currentRole="ADMIN">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-pulse">
        {/* Header */}
        <div className="bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="h-3 w-44 bg-orange-500/40 rounded-md" />
            <div className="h-8 w-72 bg-slate-700 rounded-lg" />
            <div className="h-4 w-60 bg-slate-800 rounded-md" />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs h-28 space-y-2">
              <div className="h-3 w-28 bg-slate-200 rounded" />
              <div className="h-8 w-16 bg-slate-300 rounded" />
            </div>
          ))}
        </div>

        {/* Rules Table */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="h-6 w-48 bg-slate-200 rounded-md" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex justify-between items-center">
                <div className="h-4 w-52 bg-slate-300 rounded" />
                <div className="h-8 w-24 bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
