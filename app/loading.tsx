import React from 'react';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 animate-pulse">
      <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-4">
        <div className="w-6 h-6 rounded-lg bg-orange-600 animate-spin" />
      </div>
      <div className="h-4 w-40 bg-slate-200 rounded-full mb-2" />
      <div className="h-3 w-28 bg-slate-100 rounded-full" />
    </div>
  );
}
