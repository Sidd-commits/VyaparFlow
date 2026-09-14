'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Ship, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('VyaparFlow Global Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto">
            <Ship className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Application Notice</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              An unexpected system condition occurred. Please reload the page to continue.
            </p>
          </div>

          {error.digest && (
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-500 truncate">
              Ref: {error.digest}
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
