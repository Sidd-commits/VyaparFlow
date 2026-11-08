import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'orange';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-900 text-white border-transparent hover:bg-slate-800',
    secondary: 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200',
    destructive: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    outline: 'text-slate-800 border-slate-300 hover:bg-slate-50',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] sm:text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };

