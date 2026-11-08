'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

interface ScrollCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  formatIndian?: boolean;
  once?: boolean;
}

export default function ScrollCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 1.3,
  className = '',
  formatIndian = true,
  once = false, // Bidirectional by default: resets on scroll-out, recounts on scroll-in!
}: ScrollCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, amount: 0.2 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) {
      setDisplayValue(0);
      return;
    }

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // Smooth easeOutExpo for crisp modern SaaS counter feel
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(ease * value);
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [isInView, value, duration]);

  const formatted = formatIndian
    ? displayValue.toLocaleString('en-IN')
    : displayValue.toLocaleString();

  return (
    <span ref={ref} className={`tabular-nums font-mono ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
