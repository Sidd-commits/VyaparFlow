import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
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
