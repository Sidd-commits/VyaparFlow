'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Truck,
  CircleDot,
} from 'lucide-react';

export type StatusVariant =
  | 'approved'
  | 'verified'
  | 'pending'
  | 'needs_action'
  | 'rejected'
  | 'expired'
  | 'blocked'
  | 'in_transit'
  | 'delivered'
  | 'draft'
  | 'preparation'
  | 'neutral';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
  showIcon?: boolean;
}

export function normalizeStatusVariant(rawStatus: string): {
  label: string;
  variant: StatusVariant;
} {
  const s = rawStatus.toLowerCase().trim();

  if (s.includes('verified') || s.includes('approved') || s.includes('clear') || s.includes('green channel')) {
    return { label: 'Verified', variant: 'verified' };
  }
  if (s.includes('delivered') || s.includes('completed')) {
    return { label: 'Delivered', variant: 'delivered' };
  }
  if (s.includes('under_review') || s.includes('pending') || s.includes('review')) {
    return { label: 'Verification pending', variant: 'pending' };
  }
  if (s.includes('rejected') || s.includes('failed')) {
    return { label: 'Rejected', variant: 'rejected' };
  }
  if (s.includes('block') || s.includes('critical')) {
    return { label: 'Action required', variant: 'blocked' };
  }
  if (s.includes('transit') || s.includes('dispatched') || s.includes('picked up')) {
    return { label: 'In transit', variant: 'in_transit' };
  }
  if (s.includes('prep') || s.includes('customs')) {
    return { label: 'In preparation', variant: 'preparation' };
  }
  if (s.includes('draft') || s.includes('order confirmed')) {
    return { label: 'Draft', variant: 'draft' };
  }
  if (s.includes('missing') || s.includes('incomplete') || s.includes('not started')) {
    return { label: 'Action required', variant: 'needs_action' };
  }

  return { label: rawStatus, variant: 'neutral' };
}

export default function StatusBadge({
  status,
  variant: explicitVariant,
  className = '',
  showIcon = true,
}: StatusBadgeProps) {
  const { label, variant } = explicitVariant
    ? { label: status, variant: explicitVariant }
    : normalizeStatusVariant(status);

  const config: Record<
    StatusVariant,
    {
      bg: string;
      icon: React.ComponentType<{ className?: string }>;
    }
  > = {
    approved: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      icon: CheckCircle2,
    },
    verified: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      icon: CheckCircle2,
    },
    delivered: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      icon: CheckCircle2,
    },
    pending: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
      icon: Clock,
    },
    needs_action: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
      icon: AlertTriangle,
    },
    blocked: {
      bg: 'bg-red-50 text-red-800 border-red-200/80',
      icon: AlertCircle,
    },
    rejected: {
      bg: 'bg-red-50 text-red-800 border-red-200/80',
      icon: AlertCircle,
    },
    expired: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Clock,
    },
    in_transit: {
      bg: 'bg-blue-50 text-blue-800 border-blue-200/80',
      icon: Truck,
    },
    preparation: {
      bg: 'bg-sky-50 text-sky-800 border-sky-200/80',
      icon: CircleDot,
    },
    draft: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: CircleDot,
    },
    neutral: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: CircleDot,
    },
  };

  const current = config[variant] || config.neutral;
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${current.bg} ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />}
      <span>{label}</span>
    </span>
  );
}
