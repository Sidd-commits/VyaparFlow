import assert from 'assert';
import { prisma } from '../../lib/prisma';
import { hashPassword } from '../../lib/crypto';
import { getPlatformAdminEmail } from '../../lib/authGuards';
import { PERSONA_COOKIE, USER_ID_COOKIE, USER_EMAIL_COOKIE } from '../../lib/authCookies';

export async function runAdminNavigationAudit() {
  console.log('================================================================');
  console.log('🛡️ VYAPARFLOW — ADMIN PORTAL & TAB NAVIGATION INTEGRATION AUDIT');
  console.log('================================================================');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const adminEmail = getPlatformAdminEmail();

  const legitimateAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      email: adminEmail,
      name: 'Platform Operator Admin',
      passwordHash: hashPassword('password123'),
      role: 'ADMIN',
    },
  });

  const adminHeaders = {
    Cookie: `${USER_ID_COOKIE}=${legitimateAdmin.id}; ${PERSONA_COOKIE}=ADMIN; ${USER_EMAIL_COOKIE}=${legitimateAdmin.email}`,
  };

  console.log('\n--- 1. Testing GET /admin as Platform Admin ---');
  const adminRes = await fetch(`${baseUrl}/admin`, { headers: adminHeaders });
  assert.strictEqual(adminRes.status, 200, `Expected HTTP 200 for /admin, got ${adminRes.status}`);
  const adminHtml = await adminRes.text();
  assert.ok(adminHtml.includes('Admin Operations Command Center'), 'Must render Admin Operations Command Center');
  assert.ok(adminHtml.includes('Verification Queue'), 'Must include Verification Queue tab');
  assert.ok(adminHtml.includes('Exporters &amp; Users') || adminHtml.includes('Exporters & Users'), 'Must include Exporters tab');
  assert.ok(adminHtml.includes('Regulatory Rules'), 'Must include Regulatory Rules tab');
  assert.ok(adminHtml.includes('Audit Trail'), 'Must include Audit Trail tab');
  assert.ok(!adminHtml.includes('Statutory Export Dossier'), 'Admin must not render MSME Statutory Export Dossier');
  console.log('✅ Admin Operations Command Center renders correctly without MSME elements.');

  console.log('\n--- 2. Testing GET /documents as Platform Admin (Should Redirect to /admin?tab=verifications) ---');
  const docRedirectRes = await fetch(`${baseUrl}/documents`, {
    headers: adminHeaders,
    redirect: 'manual',
  });
  console.log('GET /documents status:', docRedirectRes.status, 'Location header:', docRedirectRes.headers.get('location'));
  if (docRedirectRes.status === 200) {
    const text = await docRedirectRes.text();
    console.log('Response preview:', text.slice(0, 300));
  }
  const docRedirectLocation = docRedirectRes.headers.get('location') || '';
  assert.ok(
    docRedirectLocation.includes('/admin?tab=verifications'),
    `Admin accessing /documents must redirect to /admin?tab=verifications, got: ${docRedirectLocation}`
  );
  console.log(`✅ Admin accessing /documents cleanly redirected to: ${docRedirectLocation}`);

  console.log('\n--- 3. Testing MSME Page Access Protection for Platform Admin ---');
  const msmeRoutes = ['/business', '/certifications', '/packaging', '/products'];
  for (const route of msmeRoutes) {
    const res = await fetch(`${baseUrl}${route}`, {
      headers: adminHeaders,
      redirect: 'manual',
    });
    assert.ok(
      [307, 308, 302, 303].includes(res.status),
      `Admin accessing ${route} must be redirected, got HTTP ${res.status}`
    );
    const loc = res.headers.get('location') || '';
    assert.ok(loc.includes('/admin'), `Admin accessing ${route} must redirect to /admin, got: ${loc}`);
    console.log(`✅ Admin accessing ${route} safely redirected to /admin`);
  }

  console.log('\n================================================================');
  console.log('🎉 ALL ADMIN PORTAL NAVIGATION AUDITS PASSED WITH 100% SUCCESS!');
  console.log('================================================================\n');
}

if (require.main === module) {
  runAdminNavigationAudit().catch((err) => {
    console.error('❌ ADMIN NAVIGATION AUDIT FAILED:', err);
    process.exit(1);
  });
}
