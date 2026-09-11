import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getAppOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host;
  const forwardedProto = request.headers.get('x-forwarded-proto') || (forwardedHost.includes('localhost') ? 'http' : 'https');
  
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  return `${request.nextUrl.protocol}//${request.nextUrl.host}`;
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = getAppOrigin(request);
  const redirectUri = `${appUrl}/api/auth/google/callback`;
  const role = request.nextUrl.searchParams.get('role') || 'MSME';

  if (!clientId) {
    // If Google OAuth is not configured yet, redirect with an informative query param
    return NextResponse.redirect(new URL('/login?error=google_not_configured', request.url));
  }

  // Construct Google OAuth 2.0 Authorization URL
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'select_account');
  googleAuthUrl.searchParams.set('state', JSON.stringify({ role }));

  return NextResponse.redirect(googleAuthUrl.toString());
}
