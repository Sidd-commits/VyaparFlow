'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  TrendingUp,
  UserPlus,
  LogOut,
  LogIn,
  Menu,
  X,
  Compass,
} from 'lucide-react';

interface NavbarProps {
  currentRole?: 'MSME' | 'PROVIDER' | 'ADMIN' | null;
  userEmail?: string | null;
  userName?: string | null;
}

const NAV_SECTIONS = [
  { id: 'overview', label: 'Architecture' },
  { id: 'regulatory', label: 'Regulatory Engine' },
  { id: 'readiness', label: 'Readiness Index' },
  { id: 'documents', label: 'Document Vault' },
  { id: 'ecosystem', label: 'Trade Ecosystem' },
];

export default function Navbar({ currentRole, userEmail, userName }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeSection, setActiveSection] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Scrollspy observer for active section on the landing page
  useEffect(() => {
    if (pathname !== '/') return;

    const observerOptions = {
      root: null,
      rootMargin: '-15% 0px -65% 0px',
      threshold: 0,
    };

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    NAV_SECTIONS.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pathname]);

  // Handle direct hash navigation on initial load or back/forward
  useEffect(() => {
    if (pathname === '/' && typeof window !== 'undefined' && window.location.hash) {
      const hashId = window.location.hash.replace('#', '');
      if (hashId) {
        setTimeout(() => {
          scrollToElementId(hashId);
        }, 150);
      }
    }
  }, [pathname]);

  const scrollToElementId = (id: string) => {
    setActiveSection(id);
    const targetElement = document.getElementById(id);
    if (targetElement) {
      const navOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (pathname === '/') {
      e.preventDefault();
      scrollToElementId(id);
      setMobileMenuOpen(false);
    } else {
      setMobileMenuOpen(false);
    }
  };

  const handleSignOut = () => {
    startTransition(async () => {
      await logoutUserAction();
    });
  };

  const isLoggedIn = Boolean(currentRole && userEmail);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
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
              prefetch={true}
              onClick={() => {
                if (pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  window.history.replaceState(null, '', '/');
                }
              }}
              className="flex items-center gap-2.5 group active:scale-[0.98] transition-transform"
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

          {/* Navigation Links — Role Specific or Landing Scrollspy */}
          {isLoggedIn ? (
            <nav className="hidden lg:flex items-center gap-1">
              {currentRole === 'MSME' && (
                <>
                  <Link
                    href="/dashboard"
                    prefetch={true}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] flex items-center gap-1.5 ${
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
                    prefetch={true}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] flex items-center gap-1.5 ${
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
                    prefetch={true}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] flex items-center gap-1.5 ${
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
                    prefetch={true}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] flex items-center gap-1.5 ${
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
                    prefetch={true}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] flex items-center gap-1.5 ${
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
                    prefetch={true}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] flex items-center gap-1.5 ${
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
                    prefetch={true}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] flex items-center gap-1.5 ${
                      pathname === '/provider'
                        ? 'bg-orange-50 text-orange-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    Command Deck
                  </Link>

                  <Link
                    href="/provider?tab=quotes"
                    prefetch={true}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Freight RFQs
                  </Link>

                  <Link
                    href="/shipments"
                    prefetch={true}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] flex items-center gap-1.5 ${
                      pathname.startsWith('/shipments')
                        ? 'bg-orange-50 text-orange-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Ship className="w-4 h-4" />
                    Fleet Cargo
                  </Link>
                </>
              )}

              {currentRole === 'ADMIN' && (
                <>
                  <Link
                    href="/admin"
                    prefetch={true}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] flex items-center gap-1.5 ${
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
                    prefetch={true}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] flex items-center gap-1.5 ${
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
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              {NAV_SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <Link
                    key={sec.id}
                    href={`/#${sec.id}`}
                    onClick={(e) => handleNavClick(e, sec.id)}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-[0.98] ${
                      isActive
                        ? 'bg-orange-50 text-orange-600 font-bold border border-orange-200/80 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    {sec.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User Profile / Auth Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                {/* User Profile Badge */}
                <Link
                  href={currentRole === 'MSME' ? '/business' : currentRole === 'PROVIDER' ? '/provider' : '/admin'}
                  prefetch={true}
                  className="flex items-center gap-2.5 pl-3 border-l border-slate-200 hover:opacity-85 transition-opacity active:scale-[0.98] group"
                  title="View & manage company profile and registrations"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:bg-orange-600 transition-colors">
                    {userName ? userName.charAt(0).toUpperCase() : currentRole ? currentRole.charAt(0) : 'U'}
                  </div>
                  <div className="hidden sm:block text-left text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 leading-tight group-hover:text-orange-600 transition-colors">
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
                </Link>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  disabled={isPending}
                  title="Sign out of current account"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  prefetch={true}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-600" />
                  Sign In
                </Link>
                <Link
                  href="/login?tab=register"
                  prefetch={true}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-md shadow-orange-600/20 transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register MSME
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <div className="flex md:hidden items-center gap-2">
              {!isLoggedIn && (
                <Link
                  href="/login"
                  className="sm:hidden px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-600 text-white"
                >
                  Sign In
                </Link>
              )}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {!isLoggedIn ? (
            <>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 block">
                  Platform Sections
                </span>
                {NAV_SECTIONS.map((sec) => (
                  <Link
                    key={sec.id}
                    href={`/#${sec.id}`}
                    onClick={(e) => handleNavClick(e, sec.id)}
                    className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    {sec.label}
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 text-center text-xs font-bold hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?tab=register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-xl bg-orange-600 text-white text-center text-xs font-bold hover:bg-orange-700 shadow-xs"
                >
                  Register MSME
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Link
                href={currentRole === 'PROVIDER' ? '/provider' : currentRole === 'ADMIN' ? '/admin' : '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 px-3 rounded-xl bg-orange-600 text-white text-center text-xs font-bold"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                disabled={isPending}
                className="block w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 text-center text-xs font-semibold cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

