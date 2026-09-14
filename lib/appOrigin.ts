import { NextRequest } from 'next/server';

/**
 * Deterministically resolves the base origin URL of the running application.
 * Handles reverse proxies, Vercel deployments, custom domains, and local development.
 */
export function getAppOrigin(request: NextRequest): string {
  // 1. Check x-forwarded headers from reverse proxies / Vercel Edge
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');

  if (forwardedHost) {
    const host = forwardedHost.split(',')[0].trim();
    const proto = forwardedProto
      ? forwardedProto.split(',')[0].trim()
      : host.includes('localhost') ? 'http' : 'https';
    return `${proto}://${host}`;
  }

  // 2. Check host header if present and not localhost
  const host = request.headers.get('host') || request.nextUrl.host;
  if (host && !host.includes('localhost')) {
    const proto = request.nextUrl.protocol
      ? request.nextUrl.protocol.replace(':', '')
      : 'https';
    return `${proto}://${host.split(',')[0].trim()}`;
  }

  // 3. If explicit NEXT_PUBLIC_APP_URL is provided, valid, and not localhost override on production
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.startsWith('http')) {
    const configuredUrl = process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/$/, '');
    // If request came from a real domain but env var says localhost, prefer request host
    if (configuredUrl.includes('localhost') && host && !host.includes('localhost')) {
      const proto = request.nextUrl.protocol ? request.nextUrl.protocol.replace(':', '') : 'https';
      return `${proto}://${host.split(',')[0].trim()}`;
    }
    return configuredUrl;
  }

  // 4. Check Vercel deployment URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 5. Fallback to request.nextUrl.origin or localhost
  return request.nextUrl.origin || 'http://localhost:3000';
}
