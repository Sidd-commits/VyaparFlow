import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

const PERSONA_COOKIE = 'vyaparflow_active_role';
const USER_ID_COOKIE = 'vyaparflow_active_user_id';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
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

    // Parse state parameter if present for preferred role
    const stateParam = searchParams.get('state');
    let preferredRole: 'MSME' | 'PROVIDER' | 'ADMIN' = 'MSME';
    if (stateParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(stateParam));
        if (parsed.role && ['MSME', 'PROVIDER', 'ADMIN'].includes(parsed.role)) {
          preferredRole = parsed.role;
        }
      } catch {
        // Fallback to default
      }
    }

    if (!user) {
      // Determine role from preferred role or email hint
      const role = email.includes('admin')
        ? 'ADMIN'
        : email.includes('provider') || email.includes('freight') || email.includes('lab') || email.includes('cha')
        ? 'PROVIDER'
        : preferredRole;

      user = await prisma.user.create({
        data: {
          email,
          name,
          role,
          avatar: picture,
          passwordHash: 'oauth_google',
          ...(role === 'MSME'
            ? {
                businesses: {
                  create: {
                    legalName: `${name} Exports Pvt Ltd`,
                    displayName: `${name} Agro & Industrial Exports`,
                    businessType: 'MANUFACTURER_EXPORTER',
                    location: 'Pan-India Export Corridor',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    gstStatus: 'Active',
                    iecStatus: 'Active',
                    profileCompletion: 65,
                  },
                },
              }
            : role === 'PROVIDER'
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

    // 4. Set Session Cookies
    const cookieStore = await cookies();
    cookieStore.set(USER_ID_COOKIE, user.id, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    cookieStore.set(PERSONA_COOKIE, user.role, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    // 5. Redirect to role dashboard
    const targetUrl =
      user.role === 'PROVIDER'
        ? '/provider'
        : user.role === 'ADMIN'
        ? '/admin'
        : '/dashboard';

    return NextResponse.redirect(new URL(targetUrl, request.url));
  } catch (err: any) {
    console.error('Google OAuth callback unexpected error:', err);
    return NextResponse.redirect(new URL('/login?error=google_unexpected_error', request.url));
  }
}
