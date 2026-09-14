'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Ship, RefreshCw, LogIn, LayoutDashboard, AlertTriangle, ArrowLeft } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('VyaparFlow App Router Exception:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 relative z-10 text-center">
        {/* Logo / Header */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/30 text-orange-400 flex items-center justify-center">
            <Ship className="w-6 h-6" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Service Notice</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight font-serif">
            Unable to Complete Operation
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            An unexpected error was encountered. Your session and data remain safe. Try reloading or return to the sign in portal.
          </p>
        </div>

        {/* Digest / Debug Info */}
        {error.digest && (
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-500 truncate">
            Digest Ref: <span className="text-orange-400">{error.digest}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload &amp; Retry</span>
          </button>

          <Link
            href="/login"
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
          >
            <LogIn className="w-4 h-4 text-orange-400" />
            <span>Sign In Portal</span>
          </Link>
        </div>

        <div className="pt-2 border-t border-slate-800/80">
          <Link
            href="/"
            className="text-[11px] text-slate-500 hover:text-slate-300 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to VyaparFlow Home
          </Link>
        </div>
      </div>
    </div>
  );
}
