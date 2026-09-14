'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * TopProgressIndicator provides instant 0ms visual acknowledgment on any link click
 * or route transition across the VyaparFlow application.
 */
export default function TopProgressIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Whenever pathname or searchParams change, route transition is complete
    setLoading(false);
    setProgress(100);
    const timer = setTimeout(() => {
      setProgress(0);
    }, 200);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleStart = (e: MouseEvent | PointerEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target || !target.href) return;

      const currentOrigin = window.location.origin;
      try {
        const targetUrl = new URL(target.href, window.location.href);

        // Only animate for internal navigation to different pages
        if (
          targetUrl.origin === currentOrigin &&
          !target.hasAttribute('download') &&
          target.target !== '_blank' &&
          (targetUrl.pathname !== window.location.pathname || targetUrl.search !== window.location.search)
        ) {
          setLoading(true);
          setProgress(25);

          const interval = setInterval(() => {
            setProgress((prev) => {
              if (prev >= 85) {
                clearInterval(interval);
                return 85;
              }
              return prev + Math.random() * 15;
            });
          }, 80);

          setTimeout(() => clearInterval(interval), 3000);
        }
      } catch {}
    };

    document.addEventListener('pointerdown', handleStart, { capture: true });
    document.addEventListener('click', handleStart, { capture: true });
    return () => {
      document.removeEventListener('pointerdown', handleStart, { capture: true });
      document.removeEventListener('click', handleStart, { capture: true });
    };
  }, []);

  if (progress === 0 && !loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[2.5px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-linear-to-r from-orange-500 via-amber-400 to-orange-600 shadow-[0_0_8px_rgba(249,115,22,0.6)] transition-all duration-150 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transitionProperty: 'width, opacity',
        }}
      />
    </div>
  );
}
