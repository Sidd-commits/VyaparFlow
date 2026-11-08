import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE } from './lib/authCookies';

function getSessionRole(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const json = atob(base64);
    const parsed = JSON.parse(json);
    return parsed.role || null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const tokenRole = getSessionRole(sessionToken);

  // Protected Dashboard Routes: /dashboard and nested paths
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    if (!sessionToken || !tokenRole) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (tokenRole === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (tokenRole === 'PROVIDER') {
      return NextResponse.redirect(new URL('/provider', request.url));
    }
  }

  // Protected Admin Routes: /admin and nested paths
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!sessionToken || !tokenRole) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Strict Role Enforcement: Block non-admin roles even if client attempts cookie tampering
    if (tokenRole === 'MSME') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (tokenRole === 'PROVIDER') {
      return NextResponse.redirect(new URL('/provider', request.url));
    }
  }

  // Protected Provider Routes: /provider and nested paths
  if (pathname === '/provider' || pathname.startsWith('/provider/')) {
    if (!sessionToken || !tokenRole) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (tokenRole === 'MSME') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Redirect Provider accessing MSME-specific routes to appropriate provider workspace
  if (sessionToken && tokenRole === 'PROVIDER') {
    if (pathname === '/documents') {
      return NextResponse.redirect(new URL('/provider?tab=verification', request.url));
    }
    if (pathname === '/business') {
      return NextResponse.redirect(new URL('/provider?tab=profile', request.url));
    }
    if (['/certifications', '/packaging', '/products', '/readiness'].includes(pathname)) {
      return NextResponse.redirect(new URL('/provider', request.url));
    }
  }

  // Redirect Admin accessing MSME-specific routes to appropriate admin operations view
  if (sessionToken && tokenRole === 'ADMIN') {
    if (pathname === '/documents') {
      return NextResponse.redirect(new URL('/admin?tab=verifications', request.url));
    }
    if (['/business', '/certifications', '/packaging', '/products', '/readiness', '/shipments'].includes(pathname)) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/admin',
    '/admin/:path*',
    '/provider',
    '/provider/:path*',
    '/documents',
    '/business',
    '/certifications',
    '/packaging',
    '/products',
    '/readiness',
    '/shipments',
  ],
};
