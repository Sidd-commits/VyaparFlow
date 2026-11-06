import assert from 'assert';
import { prisma } from '../../lib/prisma';
import { hashPassword } from '../../lib/crypto';
import { getPlatformAdminEmail } from '../../lib/authGuards';
import { PERSONA_COOKIE, USER_ID_COOKIE, USER_EMAIL_COOKIE, SESSION_COOKIE } from '../../lib/authCookies';
import { createSessionToken } from '../../lib/session';

export async function runHttpRouteProtectionTests() {
  console.log('================================================================');
  console.log('🌐 RUNNING HTTP ROUTE PROTECTION & INTEGRATION TESTS');
  console.log('================================================================');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const ts = Date.now();
  const adminEmail = getPlatformAdminEmail();

  // Ensure test users exist in DB
  const msmeUser = await prisma.user.create({
    data: {
      email: `http_test_msme_${ts}@vyaparflow.app`,
      name: 'HTTP Test MSME',
      passwordHash: hashPassword('password123'),
      role: 'MSME',
    },
  });

  const providerUser = await prisma.user.create({
    data: {
      email: `http_test_provider_${ts}@vyaparflow.app`,
      name: 'HTTP Test Provider',
      passwordHash: hashPassword('password123'),
      role: 'PROVIDER',
    },
  });

  const legitimateAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      email: adminEmail,
      name: 'Platform Operator Admin',
      passwordHash: hashPassword('AdminPass2026!'),
      role: 'ADMIN',
    },
  });

  const msmeToken = createSessionToken({
    userId: msmeUser.id,
    email: msmeUser.email,
    role: 'MSME',
    name: msmeUser.name,
  });

  const providerToken = createSessionToken({
    userId: providerUser.id,
    email: providerUser.email,
    role: 'PROVIDER',
    name: providerUser.name,
  });

  const adminToken = createSessionToken({
    userId: legitimateAdmin.id,
    email: legitimateAdmin.email,
    role: 'ADMIN',
    name: legitimateAdmin.name,
  });

  try {
    // 1. Test GET /login content
    console.log('\n--- 1. Testing GET /login ---');
    const loginRes = await fetch(`${baseUrl}/login`);
    assert.strictEqual(loginRes.status, 200);
    const loginHtml = await loginRes.text();

    assert.ok(!loginHtml.includes('Platform Admin Operator'), 'Public login must not offer Platform Admin registration');
    assert.ok(!loginHtml.includes('admin@vyaparflow.com'), 'Public login must not expose demo admin credentials');
    console.log('✓ Public /login page does not expose admin role registration or credentials');

    // 2. Test GET /admin unauthenticated
    console.log('\n--- 2. Testing GET /admin Unauthenticated ---');
    const unauthAdminRes = await fetch(`${baseUrl}/admin`, { redirect: 'manual' });
    assert.ok(
      [307, 308, 302, 303].includes(unauthAdminRes.status),
      `Unauthenticated /admin must redirect, got status: ${unauthAdminRes.status}`
    );
    const redirectLocation = unauthAdminRes.headers.get('location') || '';
    assert.ok(
      redirectLocation.includes('/dashboard') || redirectLocation.includes('/login') || redirectLocation.includes('/onboarding'),
      `Redirect target should be safe dashboard/login, got: ${redirectLocation}`
    );
    console.log(`✓ Unauthenticated request to /admin safely redirected to: ${redirectLocation}`);

    // 3. Test GET /admin as Exporter (MSME)
    console.log('\n--- 3. Testing GET /admin as Exporter (MSME) ---');
    const msmeAdminRes = await fetch(`${baseUrl}/admin`, {
      headers: {
        Cookie: `${SESSION_COOKIE}=${msmeToken}; ${USER_ID_COOKIE}=${msmeUser.id}; ${PERSONA_COOKIE}=MSME; ${USER_EMAIL_COOKIE}=${msmeUser.email}`,
      },
      redirect: 'manual',
    });
    assert.ok(
      [307, 308, 302, 303].includes(msmeAdminRes.status),
      `Exporter accessing /admin must redirect, got status: ${msmeAdminRes.status}`
    );
    const msmeRedirect = msmeAdminRes.headers.get('location') || '';
    assert.ok(
      msmeRedirect.includes('/dashboard') || msmeRedirect.includes('/onboarding'),
      `Exporter should be redirected to dashboard/onboarding, got: ${msmeRedirect}`
    );
    console.log(`✓ Exporter forbidden from /admin, redirected to: ${msmeRedirect}`);

    // 4. Test GET /admin as Provider
    console.log('\n--- 4. Testing GET /admin as Service Provider ---');
    const providerAdminRes = await fetch(`${baseUrl}/admin`, {
      headers: {
        Cookie: `${SESSION_COOKIE}=${providerToken}; ${USER_ID_COOKIE}=${providerUser.id}; ${PERSONA_COOKIE}=PROVIDER; ${USER_EMAIL_COOKIE}=${providerUser.email}`,
      },
      redirect: 'manual',
    });
    assert.ok(
      [307, 308, 302, 303].includes(providerAdminRes.status),
      `Provider accessing /admin must redirect, got status: ${providerAdminRes.status}`
    );
    const providerRedirect = providerAdminRes.headers.get('location') || '';
    assert.ok(
      providerRedirect.includes('/provider'),
      `Provider should be redirected to /provider, got: ${providerRedirect}`
    );
    console.log(`✓ Provider forbidden from /admin, redirected to: ${providerRedirect}`);

    // 5. Test GET /admin as Legitimate Admin
    console.log('\n--- 5. Testing GET /admin as Platform Admin ---');
    const adminRes = await fetch(`${baseUrl}/admin`, {
      headers: {
        Cookie: `${SESSION_COOKIE}=${adminToken}; ${USER_ID_COOKIE}=${legitimateAdmin.id}; ${PERSONA_COOKIE}=ADMIN; ${USER_EMAIL_COOKIE}=${legitimateAdmin.email}`,
      },
    });
    assert.strictEqual(adminRes.status, 200, `Authorized admin must get 200 OK for /admin, got: ${adminRes.status}`);
    const adminHtml = await adminRes.text();
    assert.ok(
      adminHtml.includes('Admin Operations Command Center') || adminHtml.includes('Platform Administrator') || adminHtml.includes('Compliance Rules') || adminHtml.includes('Audit Logs'),
      'Admin console HTML must be rendered for authorized Platform Admin'
    );
    console.log('✓ Authorized Platform Admin successfully accessed /admin operations console');

    // 6. Test Authentication Bypass Prevention: Unsigned Admin Cookie without Session
    console.log('\n--- 6. Testing Unsigned Admin Cookie Bypass Prevention ---');
    const spoofedRes = await fetch(`${baseUrl}/admin`, {
      headers: {
        Cookie: `${USER_ID_COOKIE}=${legitimateAdmin.id}; ${PERSONA_COOKIE}=ADMIN; ${USER_EMAIL_COOKIE}=${legitimateAdmin.email}`,
      },
      redirect: 'manual',
    });
    assert.ok(
      [307, 308, 302, 303].includes(spoofedRes.status),
      `Unsigned spoofed cookie without valid session must be redirected, got: ${spoofedRes.status}`
    );
    console.log('✓ Unsigned cookie impersonation attempt successfully blocked and redirected');

    console.log('\n================================================================');
    console.log('🎉 ALL HTTP ROUTE PROTECTION INTEGRATION TESTS PASSED 100%!');
    console.log('================================================================\n');
  } finally {
    // Cleanup temporary test users
    await prisma.user.deleteMany({
      where: { id: { in: [msmeUser.id, providerUser.id] } },
    });
  }
}

if (require.main === module) {
  runHttpRouteProtectionTests().catch((err) => {
    console.error('❌ HTTP ROUTE PROTECTION TESTS FAILED:', err);
    process.exit(1);
  });
}
