'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutUserAction } from '@/app/actions';
import {
  Ship,
  LayoutDashboard,
  FileCheck2,
  FileText,
  Award,
  Box,
  Truck,
  Building2,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  currentRole?: 'MSME' | 'PROVIDER' | 'ADMIN' | null;
  userEmail?: string | null;
  userName?: string | null;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export default function AppShell({
  children,
  currentRole = 'MSME',
  userEmail,
  userName,
}: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await logoutUserAction();
    });
  };

  const msmeNavGroups: NavGroup[] = [
    {
      label: 'OVERVIEW',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
      ],
    },
    {
      label: 'EXPORT READINESS',
      items: [
        { name: 'Readiness Score', href: '/readiness', icon: FileCheck2 },
        { name: 'Documents', href: '/documents', icon: FileText },
        { name: 'Certifications', href: '/certifications', icon: Award },
        { name: 'Packaging', href: '/packaging', icon: Box },
      ],
    },
    {
      label: 'EXPORT OPERATIONS',
      items: [
        { name: 'Shipments', href: '/shipments', icon: Truck },
      ],
    },
    {
      label: 'ACCOUNT',
      items: [
        { name: 'Company Profile', href: '/business', icon: Building2 },
      ],
    },
  ];

  const providerNavGroups: NavGroup[] = [
    {
      label: 'OPERATIONS',
      items: [
        { name: 'Task Queue', href: '/provider', icon: Truck, exact: true },
        { name: 'Assigned Shipments', href: '/shipments', icon: Ship },
      ],
    },
  ];

  const adminNavGroups: NavGroup[] = [
    {
      label: 'ADMINISTRATION',
      items: [
        { name: 'Operations Console', href: '/admin', icon: ShieldCheck, exact: true },
        { name: 'Document Verification', href: '/documents', icon: FileText },
      ],
    },
  ];

  const navGroups =
    currentRole === 'PROVIDER'
      ? providerNavGroups
      : currentRole === 'ADMIN'
      ? adminNavGroups
      : msmeNavGroups;

  const isLinkActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const initialLetter = userName
    ? userName.charAt(0).toUpperCase()
    : userEmail
    ? userEmail.charAt(0).toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col lg:flex-row font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* ─────────────────────────────────────────────────────────────
          1. DESKTOP SIDEBAR (FIXED / STICKY ON THE LEFT)
      ───────────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-slate-200/90 shrink-0 sticky top-0 h-screen z-40 justify-between">
        {/* Top Header & Navigation */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-100">
            <Link
              href={
                currentRole === 'PROVIDER'
                  ? '/provider'
                  : currentRole === 'ADMIN'
                  ? '/admin'
                  : '/dashboard'
              }
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black shadow-md shadow-orange-600/20 group-hover:scale-105 transition-transform shrink-0">
                <Ship className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <span className="font-black text-lg tracking-tight text-slate-900 font-serif uppercase block leading-tight">
                  VYAPARFLOW
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold truncate">
                  Export Logistics Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Groups */}
          <nav className="p-4 space-y-6 flex-1">
            {navGroups.map((group) => (
              <div key={group.label} className="space-y-1.5">
                <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {group.label}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isLinkActive(item);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                          active
                            ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200/70 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              active ? 'text-orange-600' : 'text-slate-400'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>
                        {active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom User Profile Card & Sign Out */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {initialLetter}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-slate-900 text-xs truncate">
                  {userName || userEmail?.split('@')[0] || 'Exporter'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-orange-600 font-semibold truncate">
                  {currentRole === 'MSME'
                    ? 'MSME Exporter'
                    : currentRole === 'PROVIDER'
                    ? 'Logistics Provider'
                    : 'Platform Admin'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 truncate block">
                {userEmail}
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            disabled={isPending}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            title="Sign out of your account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. MOBILE TOP BAR & RESPONSIVE DRAWER (< lg screens)
      ───────────────────────────────────────────────────────────── */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-slate-200/90 px-4 py-3 flex items-center justify-between">
        <Link
          href={
            currentRole === 'PROVIDER'
              ? '/provider'
              : currentRole === 'ADMIN'
              ? '/admin'
              : '/dashboard'
          }
          className="flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black shadow-xs">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black text-base tracking-tight text-slate-900 font-serif uppercase block leading-tight">
              VYAPARFLOW
            </span>
            <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
              Export Operations
            </span>
          </div>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="relative w-4/5 max-w-xs bg-white h-full flex flex-col justify-between shadow-2xl z-10">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black">
                  <Ship className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 font-serif">
                  VYAPARFLOW
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="p-4 overflow-y-auto flex-1 space-y-6">
              {navGroups.map((group) => (
                <div key={group.label} className="space-y-1.5">
                  <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {group.label}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const active = isLinkActive(item);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            active
                              ? 'bg-orange-50 text-orange-600 font-bold border border-orange-200'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon
                              className={`w-4 h-4 ${
                                active ? 'text-orange-600' : 'text-slate-400'
                              }`}
                            />
                            <span>{item.name}</span>
                          </div>
                          {active && (
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Bottom Profile */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {initialLetter}
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <span className="font-bold text-slate-900 block truncate">
                    {userName || userEmail?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {userEmail}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                disabled={isPending}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN CONTENT CONTAINER
      ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 bg-[#FAF9F6] min-h-screen">
        {children}
      </main>
    </div>
  );
}
