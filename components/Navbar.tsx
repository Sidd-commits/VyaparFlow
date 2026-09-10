'use client';

import React, { useTransition, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { switchUserRoleAction, switchUserAccountAction, logoutUserAction } from '@/app/actions';
import { saveRecentAccount } from '@/lib/recentAccounts';
import {
  Ship,
  LayoutDashboard,
  Building2,
  Package,
  FileCheck2,
  FileText,
  Award,
  Box,
  Truck,
  ShieldCheck,
  Bell,
  Sparkles,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  UserPlus,
  LogOut,
  LogIn,
} from 'lucide-react';

interface NavbarProps {
  currentRole?: 'MSME' | 'PROVIDER' | 'ADMIN' | null;
  userEmail?: string | null;
  userName?: string | null;
  allUsers?: Array<{
    id: string;
    name: string;
    email: string;
    role: 'MSME' | 'PROVIDER' | 'ADMIN';
    displayName: string;
  }>;
}

export default function Navbar({ currentRole, userEmail, userName, allUsers = [] }: NavbarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Auto-record active account to recent accounts in localStorage
  useEffect(() => {
    if (userEmail && currentRole) {
      const activeUserData = allUsers.find((u) => u.email === userEmail);
      saveRecentAccount({
        email: userEmail,
        name: userName || activeUserData?.name || userEmail.split('@')[0],
        role: currentRole,
        companyName: activeUserData?.displayName,
      });
    }
  }, [userEmail, userName, currentRole, allUsers]);

  const handleRoleSwitch = (role: 'MSME' | 'PROVIDER' | 'ADMIN') => {
    startTransition(async () => {
      await switchUserRoleAction(role);
    });
  };

  const handleAccountSelect = (userId: string) => {
    const selected = allUsers.find((u) => u.id === userId);
    if (selected) {
      saveRecentAccount({
        email: selected.email,
        name: selected.name,
        role: selected.role,
        companyName: selected.displayName,
      });
    }
    startTransition(async () => {
      await switchUserAccountAction(userId);
    });
  };

  const handleSignOut = () => {
    startTransition(async () => {
      await logoutUserAction();
    });
  };

  const isLoggedIn = Boolean(currentRole && userEmail);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Quick-Switcher Bar (Only for Authenticated Users) */}
      {isLoggedIn && (
        <div className="bg-slate-900 text-white text-xs py-2 px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="font-semibold tracking-wide text-slate-200 hidden sm:inline">
              ACCOUNT SWITCHER:
            </span>

            {/* User Account Dropdown Selector */}
            <div className="relative inline-block">
              <select
                value={allUsers.find((u) => u.email === userEmail)?.id || ''}
                onChange={(e) => handleAccountSelect(e.target.value)}
                disabled={isPending}
                className="bg-slate-800 text-orange-300 font-bold px-3 py-1 rounded-lg border border-slate-700 text-xs focus:ring-2 focus:ring-orange-500 cursor-pointer pr-6"
              >
                <option value="" disabled>-- Select User Account --</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.role === 'MSME' ? '🏢' : u.role === 'PROVIDER' ? '🚢' : '🛡️'} {u.displayName} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Persona Quick Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleRoleSwitch('MSME')}
              disabled={isPending}
              className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 cursor-pointer ${
                currentRole === 'MSME'
                  ? 'bg-orange-600 text-white shadow-xs font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Building2 className="w-3 h-3" />
              Palghar MSME
            </button>

            <button
              onClick={() => handleRoleSwitch('PROVIDER')}
              disabled={isPending}
              className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 cursor-pointer ${
                currentRole === 'PROVIDER'
                  ? 'bg-orange-600 text-white shadow-xs font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Truck className="w-3 h-3" />
              Service Provider
            </button>

            <button
              onClick={() => handleRoleSwitch('ADMIN')}
              disabled={isPending}
              className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 cursor-pointer ${
                currentRole === 'ADMIN'
                  ? 'bg-orange-600 text-white shadow-xs font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-orange-400" />
              Admin Operator
            </button>

            <Link
              href="/login?tab=register"
              className="px-2.5 py-1 rounded-md bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 font-semibold flex items-center gap-1 text-[11px] border border-orange-500/40"
            >
              <UserPlus className="w-3 h-3" /> Register New Account
            </Link>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black shadow-md shadow-orange-600/20 group-hover:scale-105 transition-transform">
                <Ship className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-serif uppercase">
                  VYAPARFLOW
                </span>
                <span className="block text-[10px] uppercase tracking-widest text-slate-500 font-semibold -mt-1">
                  Export Logistics Readiness Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          {isLoggedIn ? (
            <nav className="hidden lg:flex items-center gap-1">
              {currentRole === 'MSME' && (
                <>
                  <Link
                    href="/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname === '/dashboard' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>

                  <Link
                    href="/readiness"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname === '/readiness' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <FileCheck2 className="w-4 h-4" />
                    Readiness Score
                  </Link>

                  <Link
                    href="/documents"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname === '/documents' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Documents
                  </Link>

                  <Link
                    href="/certifications"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname === '/certifications' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    Certifications
                  </Link>

                  <Link
                    href="/packaging"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname === '/packaging' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Box className="w-4 h-4" />
                    Packaging
                  </Link>

                  <Link
                    href="/shipments"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname.startsWith('/shipments') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    Shipments
                  </Link>
                </>
              )}

              {currentRole === 'PROVIDER' && (
                <>
                  <Link
                    href="/provider"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname === '/provider' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    Task Queue Portal
                  </Link>

                  <Link
                    href="/shipments"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname.startsWith('/shipments') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Ship className="w-4 h-4" />
                    All Shipments
                  </Link>
                </>
              )}

              {currentRole === 'ADMIN' && (
                <>
                  <Link
                    href="/admin"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname === '/admin' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Overview
                  </Link>

                  <Link
                    href="/documents"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname === '/documents' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Doc Verification
                  </Link>
                </>
              )}
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link href="/" className="hover:text-orange-600 transition-colors">
                Overview
              </Link>
              <Link href="/login" className="hover:text-orange-600 transition-colors">
                Interactive Golden Demo
              </Link>
              <Link href="/login?tab=register" className="hover:text-orange-600 transition-colors">
                MSME Onboarding
              </Link>
            </nav>
          )}

          {/* User Profile / Auth Action Buttons */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    {userName ? userName.charAt(0) : currentRole ? currentRole.charAt(0) : 'U'}
                  </div>
                  <div className="text-left text-xs">
                    <span className="block font-semibold text-slate-900 leading-tight">
                      {userName || (currentRole === 'MSME' ? 'Palghar Quality Agro' : currentRole === 'PROVIDER' ? 'SwiftGlobe Logistics' : 'Admin Operator')}
                    </span>
                    <span className="block text-slate-500 text-[10px]">
                      {userEmail || `${currentRole?.toLowerCase()}@vyaparflow.com`}
                    </span>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  disabled={isPending}
                  title="Sign out of current account"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-600" />
                  Sign In
                </Link>
                <Link
                  href="/login?tab=register"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20 transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
