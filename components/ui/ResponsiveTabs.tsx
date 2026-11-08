'use client';

import React from 'react';

export interface TabOption<T extends string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string | null;
  badgeVariant?: 'alert' | 'neutral' | 'success';
}

interface ResponsiveTabsProps<T extends string> {
  tabs: TabOption<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export default function ResponsiveTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  size = 'md',
}: ResponsiveTabsProps<T>) {
  return (
    <div
      className={`bg-white/80 backdrop-blur-xs p-1.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-nowrap overflow-x-auto no-scrollbar touch-scroll gap-1.5 ${className}`}
      role="tablist"
      aria-label="Responsive Navigation Tabs"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex-1 shrink-0 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
              size === 'sm' ? 'text-xs' : 'text-xs sm:text-sm'
            } ${
              isActive
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            {Icon && (
              <Icon
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                  isActive ? 'text-blue-400' : 'text-slate-400'
                }`}
              />
            )}
            <span className="whitespace-nowrap">{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && (
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full font-mono ${
                  tab.badgeVariant === 'alert'
                    ? 'bg-amber-400 text-slate-900'
                    : tab.badgeVariant === 'success'
                    ? 'bg-emerald-400 text-slate-900'
                    : isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

