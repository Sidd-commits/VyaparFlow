'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileCheck2,
  FileText,
  Truck,
  TrendingUp,
  Users,
  Scale,
  Activity,
  Menu,
  Building2,
} from 'lucide-react';

interface MobileBottomNavProps {
  currentRole: 'MSME' | 'PROVIDER' | 'ADMIN';
  onOpenDrawer: () => void;
  pendingBadges?: {
    audits?: number;
    docs?: number;
    rfqs?: number;
  };
}

interface MobileNavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: number;
  isDrawerTrigger?: boolean;
}

export default function MobileBottomNav({
  currentRole,
  onOpenDrawer,
  pendingBadges = {},
}: MobileBottomNavProps) {
  const pathname = usePathname();

  const isItemActive = (href: string, exact: boolean = false) => {
    if (typeof window !== 'undefined' && href.includes('?')) {
      const currentUrl = window.location.pathname + window.location.search;
      if (currentUrl === href) return true;
      const urlParams = new URLSearchParams(window.location.search);
      const targetQuery = href.split('?')[1];
      const targetParams = new URLSearchParams(targetQuery);
      const targetTab = targetParams.get('tab');
      return pathname === href.split('?')[0] && urlParams.get('tab') === targetTab;
    }

    if (exact) {
      if (typeof window !== 'undefined' && window.location.search.includes('tab=')) {
        return false;
      }
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const msmeItems: MobileNavItem[] = [
    {
      label: 'Home',
      href: '/dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Readiness',
      href: '/readiness',
      icon: FileCheck2,
    },
    {
      label: 'Shipments',
      href: '/shipments',
      icon: Truck,
    },
    {
      label: 'Docs',
      href: '/documents',
      icon: FileText,
      badge: pendingBadges.docs,
    },
    {
      label: 'More',
      isDrawerTrigger: true,
      icon: Menu,
    },
  ];

  const providerItems: MobileNavItem[] = [
    {
      label: 'Hub',
      href: '/provider',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Audits',
      href: '/provider?tab=verification',
      icon: FileCheck2,
      badge: pendingBadges.audits,
    },
    {
      label: 'Quotes',
      href: '/provider?tab=quotes',
      icon: TrendingUp,
      badge: pendingBadges.rfqs,
    },
    {
      label: 'Fleet',
      href: '/provider?tab=milestones',
      icon: Truck,
    },
    {
      label: 'More',
      isDrawerTrigger: true,
      icon: Menu,
    },
  ];

  const adminItems: MobileNavItem[] = [
    {
      label: 'Overview',
      href: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Exporters',
      href: '/admin?tab=users',
      icon: Users,
    },
    {
      label: 'Queue',
      href: '/admin?tab=verifications',
      icon: FileCheck2,
      badge: pendingBadges.audits,
    },
    {
      label: 'Rules',
      href: '/admin?tab=rules',
      icon: Scale,
    },
    {
      label: 'Logs',
      href: '/admin?tab=logs',
      icon: Activity,
    },
  ];

  const items =
    currentRole === 'PROVIDER'
      ? providerItems
      : currentRole === 'ADMIN'
      ? adminItems
      : msmeItems;

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 h-16 px-1 flex items-center justify-around shadow-lg transition-transform pb-[env(safe-area-inset-bottom,0px)]"
    >
      {items.map((item, idx) => {
        const Icon = item.icon;

        if (item.isDrawerTrigger) {
          return (
            <button
              key="drawer-trigger"
              type="button"
              onClick={onOpenDrawer}
              className="flex-1 min-h-[48px] py-1 flex flex-col items-center justify-center text-slate-500 hover:text-slate-900 active:scale-95 transition-all cursor-pointer relative"
              aria-label="Open More Options Menu"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 text-slate-700">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold tracking-tight text-slate-600 mt-0.5">
                {item.label}
              </span>
            </button>
          );
        }

        const active = item.href ? isItemActive(item.href, item.exact) : false;

        return (
          <Link
            key={item.href || idx}
            href={item.href!}
            prefetch={true}
            className={`flex-1 min-h-[48px] py-1 flex flex-col items-center justify-center active:scale-95 transition-all relative ${
              active
                ? 'text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors relative ${
                active ? 'bg-blue-50 text-blue-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white font-extrabold text-[9px] flex items-center justify-center shadow-xs">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              ) : null}
            </div>
            <span
              className={`text-[10px] tracking-tight leading-none mt-0.5 truncate max-w-[60px] ${
                active ? 'text-blue-600 font-bold' : 'text-slate-600 font-medium'
              }`}
            >
              {item.label}
            </span>
            {active && (
              <span className="absolute bottom-1 w-4 h-0.5 rounded-full bg-blue-600" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

