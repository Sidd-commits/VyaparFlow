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
