import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  PERSONA_COOKIE,
  USER_ID_COOKIE,
  USER_EMAIL_COOKIE,
  USER_NAME_COOKIE,
} from '@/lib/authCookies';
import { isPlatformAdmin, getPlatformAdminEmail } from '@/lib/authGuards';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getAppOrigin(request: NextRequest): string {
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.startsWith('http')) {
    return process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/$/, '');
  }
  const forwardedHost = (request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host)
    .split(',')[0]
    .trim();
  const forwardedProto = (request.headers.get('x-forwarded-proto') || (forwardedHost.includes('localhost') ? 'http' : 'https'))
    .split(',')[0]
    .trim();
  
  return `${forwardedProto}://${forwardedHost}`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const appUrl = getAppOrigin(request);
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  if (error || !code) {
    console.error('Google OAuth error or code missing:', error);
    return NextResponse.redirect(new URL('/login?error=google_auth_failed', request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/login?error=google_not_configured', request.url));
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error('Failed to exchange Google OAuth code:', tokenError);
      return NextResponse.redirect(new URL('/login?error=google_token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch User Profile from Google
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userinfoResponse.ok) {
      console.error('Failed to fetch user info from Google');
      return NextResponse.redirect(new URL('/login?error=google_profile_failed', request.url));
    }

    const profile = await userinfoResponse.json();
    const email = (profile.email as string).toLowerCase().trim();
    const name = profile.name || email.split('@')[0];
    const picture = profile.picture || null;

    // 3. Find or Create User in Prisma
    let user = await prisma.user.findFirst({
      where: {
        email,
      },
      include: {
        businesses: true,
        providers: true,
      },
    });

    // Parse state parameter if present for preferred role (never allow ADMIN via state)
    const stateParam = searchParams.get('state');
    let preferredRole: 'MSME' | 'PROVIDER' = 'MSME';
    if (stateParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(stateParam));
        if (parsed.role && (parsed.role === 'MSME' || parsed.role === 'PROVIDER')) {
          preferredRole = parsed.role;
        }
      } catch {
        // Fallback to default
      }
    }

    if (!user) {
      // Determine role: Only the server-configured ADMIN_EMAIL can ever be created as ADMIN
      const isAdminEmail = email === getPlatformAdminEmail();
      const isProviderEmail = email.includes('provider') || email.includes('freight') || email.includes('lab') || email.includes('cha');
      
      const role = isAdminEmail
        ? 'ADMIN'
        : isProviderEmail || preferredRole === 'PROVIDER'
        ? 'PROVIDER'
        : 'MSME';

      user = await prisma.user.create({
        data: {
          email,
          name,
          role,
          avatar: picture,
          passwordHash: 'oauth_google',
          ...(role === 'PROVIDER'
            ? {
                providers: {
                  create: {
                    name: `${name} Freight Logistics & Services`,
                    type: 'FREIGHT',
                    serviceArea: 'Pan-India & Global Corridors',
                    contactEmail: email,
                  },
                },
              }
            : {}),
        },
        include: {
          businesses: true,
          providers: true,
        },
      });
    } else {
      // Update avatar if not present
      if (picture && !user.avatar) {
        await prisma.user.update({
          where: { id: user.id },
          data: { avatar: picture },
        });
      }
    }

    // Determine authorized persona safely
    const isAuthorizedAdmin = isPlatformAdmin(user);
    const effectiveRole = isAuthorizedAdmin ? 'ADMIN' : (user.role === 'PROVIDER' ? 'PROVIDER' : 'MSME');

    // 4. Set Session Cookies & Redirect
    const targetUrl =
      isAuthorizedAdmin
        ? '/admin'
        : effectiveRole === 'PROVIDER'
        ? '/provider'
        : (user.businesses && user.businesses.length > 0)
        ? '/dashboard'
        : '/onboarding';

    const response = NextResponse.redirect(new URL(targetUrl, request.url));
    response.cookies.set(USER_ID_COOKIE, user.id, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    response.cookies.set(PERSONA_COOKIE, effectiveRole, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set(USER_EMAIL_COOKIE, user.email, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set(USER_NAME_COOKIE, encodeURIComponent(user.name), {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err: any) {
    console.error('Google OAuth callback unexpected error:', err);
    return NextResponse.redirect(new URL('/login?error=google_unexpected_error', request.url));
  }
}
