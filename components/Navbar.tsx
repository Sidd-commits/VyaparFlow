'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logoutUserAction } from '@/app/actions';
import VyaparFlowLogo from '@/components/VyaparFlowLogo';
import { motion } from 'framer-motion';
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
  { id: 'overview', label: 'How It Works' },
  { id: 'regulatory', label: 'Tariffs & FTAs' },
  { id: 'readiness', label: 'Readiness Index' },
  { id: 'documents', label: 'Document Vault' },
  { id: 'ecosystem', label: 'Ecosystem' },
];

const MSME_NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/readiness', label: 'Readiness Score', icon: FileCheck2 },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/certifications', label: 'Certifications', icon: Award },
  { href: '/packaging', label: 'Packaging', icon: Box },
  { href: '/shipments', label: 'Shipments', icon: Truck },
];

const PROVIDER_NAV_ITEMS = [
  { href: '/provider', label: 'Command Deck', icon: Truck },
  { href: '/provider?tab=quotes', label: 'Freight RFQs', icon: TrendingUp },
  { href: '/shipments', label: 'Fleet Cargo', icon: Ship },
];

const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Operations Console', icon: ShieldCheck },
  { href: '/documents', label: 'Document Verification', icon: FileText },
];

export default function Navbar({ currentRole, userEmail, userName }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [hoveredAuthLink, setHoveredAuthLink] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // References for locking programmatic smooth scroll to prevent intermediate tab flicker
  const isProgrammaticScroll = useRef(false);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);

  // Scrollspy observer for active section on landing page
  useEffect(() => {
    if (pathname !== '/') return;

    // Reset to 'overview' if scrolled near top
    const handleScrollCheck = () => {
      if (isProgrammaticScroll.current) return;
      if (window.scrollY < 250) {
        setActiveSection('overview');
      }
    };
    window.addEventListener('scroll', handleScrollCheck, { passive: true });

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -55% 0px',
      threshold: [0, 0.25],
    };

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      // Critical AniMaster / Vengeance optimization:
      // Suppress intermediate section jumps during programmatic smooth scroll
      if (isProgrammaticScroll.current) return;

      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length > 0) {
        // Pick the visible section closest to the top of the reading viewport
        visible.sort((a, b) => {
          const aTop = Math.abs(a.boundingClientRect.top - 80);
          const bTop = Math.abs(b.boundingClientRect.top - 80);
          return aTop - bTop;
        });
        setActiveSection(visible[0].target.id);
      }
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    NAV_SECTIONS.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScrollCheck);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
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
    const targetElement = document.getElementById(id);
    if (!targetElement) return;

    // 1. Lock programmatic scroll flag so IntersectionObserver does not override active tab
    isProgrammaticScroll.current = true;
    if (scrollTimer.current) clearTimeout(scrollTimer.current);

    // 2. Set active section immediately so the sliding pill glides right to the destination tab
    setActiveSection(id);

    // 3. Smooth scroll with precision navbar offset (80px header height)
    const navOffset = 80;
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - navOffset;

    window.scrollTo({
      top: Math.max(0, offsetPosition),
      behavior: 'smooth',
    });

    // 4. Update URL hash cleanly and unlock observer after scroll finishes
    scrollTimer.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `#${id}`);
      }
    }, 650);
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
              <VyaparFlowLogo size={36} showText={true} subtitle="Export Logistics Platform" />
            </Link>
          </div>

          {/* Navigation Links — Role Specific or Landing Scrollspy */}
          {isLoggedIn ? (
            <nav className="hidden lg:inline-flex items-center p-1 rounded-full bg-slate-100/80 border border-slate-200/80 backdrop-blur-md shadow-2xs relative">
              {currentRole === 'MSME' &&
                MSME_NAV_ITEMS.map((item) => {
                  const isActive =
                    item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname.startsWith(item.href);
                  const isHovered = hoveredAuthLink === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      onMouseEnter={() => setHoveredAuthLink(item.href)}
                      onMouseLeave={() => setHoveredAuthLink(null)}
                      className="relative px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer select-none"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navbar-auth-pill"
                          className="absolute inset-0 bg-white rounded-full shadow-xs border border-orange-200/70"
                          transition={{
                            type: 'spring',
                            stiffness: 420,
                            damping: 32,
                          }}
                        />
                      )}
                      {!isActive && isHovered && (
                        <motion.div
                          layoutId="navbar-auth-hover-pill"
                          className="absolute inset-0 bg-slate-200/50 rounded-full"
                          transition={{
                            type: 'spring',
                            stiffness: 450,
                            damping: 35,
                          }}
                        />
                      )}
                      <Icon
                        className={`w-3.5 h-3.5 relative z-10 transition-colors ${
                          isActive ? 'text-orange-600' : 'text-slate-500'
                        }`}
                      />
                      <span
                        className={`relative z-10 transition-colors ${
                          isActive ? 'text-orange-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}

              {currentRole === 'PROVIDER' &&
                PROVIDER_NAV_ITEMS.map((item) => {
                  const isActive =
                    item.href === '/provider'
                      ? pathname === '/provider'
                      : pathname.startsWith(item.href);
                  const isHovered = hoveredAuthLink === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      onMouseEnter={() => setHoveredAuthLink(item.href)}
                      onMouseLeave={() => setHoveredAuthLink(null)}
                      className="relative px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer select-none"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navbar-auth-pill"
                          className="absolute inset-0 bg-white rounded-full shadow-xs border border-orange-200/70"
                          transition={{
                            type: 'spring',
                            stiffness: 420,
                            damping: 32,
                          }}
                        />
                      )}
                      {!isActive && isHovered && (
                        <motion.div
                          layoutId="navbar-auth-hover-pill"
                          className="absolute inset-0 bg-slate-200/50 rounded-full"
                          transition={{
                            type: 'spring',
                            stiffness: 450,
                            damping: 35,
                          }}
                        />
                      )}
                      <Icon
                        className={`w-3.5 h-3.5 relative z-10 transition-colors ${
                          isActive ? 'text-orange-600' : 'text-slate-500'
                        }`}
                      />
                      <span
                        className={`relative z-10 transition-colors ${
                          isActive ? 'text-orange-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}

              {currentRole === 'ADMIN' &&
                ADMIN_NAV_ITEMS.map((item) => {
                  const isActive =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(item.href);
                  const isHovered = hoveredAuthLink === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      onMouseEnter={() => setHoveredAuthLink(item.href)}
                      onMouseLeave={() => setHoveredAuthLink(null)}
                      className="relative px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer select-none"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navbar-auth-pill"
                          className="absolute inset-0 bg-white rounded-full shadow-xs border border-orange-200/70"
                          transition={{
                            type: 'spring',
                            stiffness: 420,
                            damping: 32,
                          }}
                        />
                      )}
                      {!isActive && isHovered && (
                        <motion.div
                          layoutId="navbar-auth-hover-pill"
                          className="absolute inset-0 bg-slate-200/50 rounded-full"
                          transition={{
                            type: 'spring',
                            stiffness: 450,
                            damping: 35,
                          }}
                        />
                      )}
                      <Icon
                        className={`w-3.5 h-3.5 relative z-10 transition-colors ${
                          isActive ? 'text-orange-600' : 'text-slate-500'
                        }`}
                      />
                      <span
                        className={`relative z-10 transition-colors ${
                          isActive ? 'text-orange-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
            </nav>
          ) : (
            <nav className="hidden md:inline-flex items-center p-1 rounded-full bg-slate-100/80 border border-slate-200/80 backdrop-blur-md shadow-2xs relative">
              {NAV_SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;
                const isHovered = hoveredSection === sec.id;
                return (
                  <Link
                    key={sec.id}
                    href={`/#${sec.id}`}
                    onClick={(e) => handleNavClick(e, sec.id)}
                    onMouseEnter={() => setHoveredSection(sec.id)}
                    onMouseLeave={() => setHoveredSection(null)}
                    className="relative px-3.5 py-1.5 text-xs font-semibold rounded-full select-none cursor-pointer flex items-center justify-center transition-colors"
                  >
                    {/* Active Floating Pill with spring animation (AniMaster / Skipper / Vengeance pattern) */}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active-pill"
                        className="absolute inset-0 bg-white rounded-full shadow-xs border border-orange-200/70"
                        transition={{
                          type: 'spring',
                          stiffness: 420,
                          damping: 32,
                        }}
                      />
                    )}

                    {/* Hover Ghost Pill */}
                    {!isActive && isHovered && (
                      <motion.div
                        layoutId="navbar-hover-pill"
                        className="absolute inset-0 bg-slate-200/50 rounded-full"
                        transition={{
                          type: 'spring',
                          stiffness: 450,
                          damping: 35,
                        }}
                      />
                    )}

                    <span
                      className={`relative z-10 transition-colors duration-150 ${
                        isActive ? 'text-orange-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {sec.label}
                    </span>
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
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-600" />
                  Sign In
                </Link>
                <Link
                  href="/login?tab=register"
                  prefetch={true}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-sm shadow-orange-600/20 transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
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
                  className="sm:hidden px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 text-white"
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
                {NAV_SECTIONS.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <Link
                      key={sec.id}
                      href={`/#${sec.id}`}
                      onClick={(e) => handleNavClick(e, sec.id)}
                      className={`block px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-orange-50 text-orange-600 font-bold border border-orange-200/80 shadow-2xs'
                          : 'text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      {sec.label}
                    </Link>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 text-center text-xs font-semibold hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?tab=register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-xl bg-orange-600 text-white text-center text-xs font-semibold hover:bg-orange-700 shadow-xs"
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
                className="block w-full py-2.5 px-3 rounded-xl bg-orange-600 text-white text-center text-xs font-semibold hover:bg-orange-700"
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

