import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAppOrigin } from '@/lib/appOrigin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = getAppOrigin(request);
  const redirectUri = `${appUrl}/api/auth/google/callback`;
  const role = request.nextUrl.searchParams.get('role') || 'MSME';

  if (!clientId) {
    // If Google OAuth is not configured yet, redirect with an informative query param
    return NextResponse.redirect(new URL('/login?error=google_not_configured', request.url));
  }

  // Generate cryptographically secure random CSRF nonce (Mitigate OAuth CSRF / CWE-352)
  const csrfNonce = crypto.randomBytes(32).toString('hex');
  const statePayload = {
    csrf: csrfNonce,
    role: role === 'PROVIDER' ? 'PROVIDER' : 'MSME',
    timestamp: Date.now(),
  };
  const stateEncoded = Buffer.from(JSON.stringify(statePayload)).toString('base64url');

  // Construct Google OAuth 2.0 Authorization URL
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'select_account');
  googleAuthUrl.searchParams.set('state', stateEncoded);

  const response = NextResponse.redirect(googleAuthUrl.toString());

  // Store CSRF nonce in short-lived, httpOnly, sameSite cookie
  response.cookies.set('google_oauth_state', csrfNonce, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600, // 10 minutes
  });

  return response;
}
