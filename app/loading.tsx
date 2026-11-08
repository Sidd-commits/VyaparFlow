import React from 'react';

/**
 * Non-destructive global loading fallback.
 * Prevents full-page white/cream flashes during Next.js route transitions
 * by maintaining viewport layout stability while TopProgressIndicator communicates progress.
 */
export default function GlobalLoading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9998] pointer-events-none">
      <div className="h-[2.5px] w-full bg-linear-to-r from-orange-500 via-amber-400 to-orange-600 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.6)]" />
    </div>
  );
}
