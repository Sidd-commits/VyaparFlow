'use client';

import React, { useTransition } from 'react';
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
  ShieldCheck,
  UserPlus,
  LogOut,
  LogIn,
  Building2,
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

export default function Navbar({ currentRole, userEmail, userName }: NavbarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await logoutUserAction();
    });
  };

  const isLoggedIn = Boolean(currentRole && userEmail);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link
              href={
                isLoggedIn
                  ? currentRole === 'PROVIDER'
                    ? '/provider'
                    : currentRole === 'ADMIN'
                    ? '/admin'
                    : '/dashboard'
                  : '/'
              }
              className="flex items-center gap-2.5 group"
            >
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

          {/* Navigation Links — Strictly Tailored to Current Role */}
          {isLoggedIn ? (
            <nav className="hidden lg:flex items-center gap-1">
              {currentRole === 'MSME' && (
                <>
                  <Link
                    href="/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname === '/dashboard'
                        ? 'bg-orange-50 text-orange-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>

                  <Link
                    href="/readiness"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname === '/readiness'
                        ? 'bg-orange-50 text-orange-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <FileCheck2 className="w-4 h-4" />
                    Readiness Score
                  </Link>

                  <Link
                    href="/documents"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname === '/documents'
                        ? 'bg-orange-50 text-orange-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Documents
                  </Link>

                  <Link
                    href="/certifications"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname === '/certifications'
                        ? 'bg-orange-50 text-orange-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    Certifications
                  </Link>

                  <Link
                    href="/packaging"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname === '/packaging'
                        ? 'bg-orange-50 text-orange-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Box className="w-4 h-4" />
                    Packaging
                  </Link>

                  <Link
                    href="/shipments"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname.startsWith('/shipments')
                        ? 'bg-orange-50 text-orange-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
                      pathname === '/provider'
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    Task Queue Portal
                  </Link>

                  <Link
                    href="/shipments"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname.startsWith('/shipments')
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Ship className="w-4 h-4" />
                    Assigned Shipments
                  </Link>
                </>
              )}

              {currentRole === 'ADMIN' && (
                <>
                  <Link
                    href="/admin"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname === '/admin'
                        ? 'bg-orange-50 text-orange-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Operations Console
                  </Link>

                  <Link
                    href="/documents"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname === '/documents'
                        ? 'bg-orange-50 text-orange-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Document Verification
                  </Link>
                </>
              )}
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link href="/#overview" className="hover:text-orange-600 transition-colors">
                Overview
              </Link>
              <Link href="/readiness" className="hover:text-orange-600 transition-colors">
                Regulatory Engine
              </Link>
              <Link href="/#export-showcase" className="hover:text-orange-600 transition-colors">
                Export Intelligence
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
                {/* User Profile Badge */}
                <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {userName ? userName.charAt(0).toUpperCase() : currentRole ? currentRole.charAt(0) : 'U'}
                  </div>
                  <div className="hidden sm:block text-left text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 leading-tight">
                        {userName || userEmail?.split('@')[0]}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                          currentRole === 'MSME'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : currentRole === 'PROVIDER'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-900 text-orange-400 border-slate-700'
                        }`}
                      >
                        {currentRole === 'MSME'
                          ? 'MSME Exporter'
                          : currentRole === 'PROVIDER'
                          ? 'Service Provider'
                          : 'Platform Admin'}
                      </span>
                    </div>
                    <span className="block text-slate-500 text-[10px] truncate max-w-[170px]">
                      {userEmail}
                    </span>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  disabled={isPending}
                  title="Sign out of current account"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-md shadow-orange-600/20 transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register MSME
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
