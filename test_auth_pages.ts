import { PrismaClient } from '@prisma/client';
import {
  USER_ID_COOKIE,
  PERSONA_COOKIE,
  USER_EMAIL_COOKIE,
  USER_NAME_COOKIE,
} from './lib/authCookies';

const prisma = new PrismaClient();

async function testAuthenticatedPageRendering() {
  console.log('Testing Authenticated Server-Side Rendering across Roles with Exact Cookies...\n');

  // Fetch MSME user
  const msmeUser = await prisma.user.findFirst({ where: { role: 'MSME' } });
  // Fetch Provider user
  const providerUser = await prisma.user.findFirst({ where: { role: 'PROVIDER' } });
  // Fetch Admin user
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  const testCases = [
    { name: 'MSME -> /dashboard', user: msmeUser, route: '/dashboard', expectedStatus: 200 },
    { name: 'MSME -> /documents', user: msmeUser, route: '/documents', expectedStatus: 200 },
    { name: 'MSME -> /readiness', user: msmeUser, route: '/readiness', expectedStatus: 200 },
    { name: 'MSME -> /packaging', user: msmeUser, route: '/packaging', expectedStatus: 200 },
    { name: 'MSME -> /certifications', user: msmeUser, route: '/certifications', expectedStatus: 200 },
    { name: 'MSME -> /shipments', user: msmeUser, route: '/shipments', expectedStatus: 200 },
    { name: 'MSME -> /business', user: msmeUser, route: '/business', expectedStatus: 200 },
    { name: 'Provider -> /provider', user: providerUser, route: '/provider', expectedStatus: 200 },
    { name: 'Admin -> /admin', user: adminUser, route: '/admin', expectedStatus: 200 },
  ];

  let passed = 0;
  let total = 0;

  for (const tc of testCases) {
    if (!tc.user) {
      console.log(`⚠️ Skipping ${tc.name}: No user found with that role.`);
      continue;
    }

    total++;
    const cookieHeader = `${USER_ID_COOKIE}=${tc.user.id}; ${PERSONA_COOKIE}=${tc.user.role}; ${USER_EMAIL_COOKIE}=${tc.user.email}; ${USER_NAME_COOKIE}=${encodeURIComponent(tc.user.name)}`;
    try {
      const res = await fetch(`http://localhost:3000${tc.route}`, {
        headers: { Cookie: cookieHeader },
        redirect: 'manual',
      });
      if (res.status === tc.expectedStatus) {
        console.log(`✅ [PASS] ${tc.name} returned HTTP ${res.status} OK`);
        passed++;
      } else {
        console.warn(`❌ [FAIL] ${tc.name} returned HTTP ${res.status} (Expected: ${tc.expectedStatus})`);
        console.warn(`   └─ Location Header: ${res.headers.get('location')}`);
      }
    } catch (err: any) {
      console.error(`❌ Request failed for ${tc.name}:`, err.message);
    }
  }

  console.log(`\nResult: ${passed} / ${total} authenticated SSR routes rendered with HTTP 200 OK!`);
  await prisma.$disconnect();
}

testAuthenticatedPageRendering();
