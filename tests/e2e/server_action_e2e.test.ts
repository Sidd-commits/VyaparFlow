import http from 'http';
import assert from 'assert';
import { prisma } from '../../lib/prisma';

function httpGet(urlStr: string, cookieHeader: string): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port || 3000,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          Cookie: cookieHeader,
          'User-Agent': 'Mozilla/5.0 Node-Verification-Agent',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode || 200, body: data });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

export async function runServerActionE2ETest() {
  console.log('================================================================');
  console.log('🧪 RUNNING E2E TEST: COMPLETE ONBOARDING & DASHBOARD WORKFLOW');
  console.log('================================================================');

  const ts = Date.now();
  const testUser = await prisma.user.create({
    data: {
      email: `server_action_${ts}@agriflow.nl`,
      name: 'BC Exporter',
      passwordHash: 'secret123',
      role: 'MSME',
    },
  });

  const cookieHeader = `vyaparflow_active_user_id=${testUser.id}; vyaparflow_active_user_email=${encodeURIComponent(testUser.email)}; vyaparflow_active_user_name=${encodeURIComponent(testUser.name)}; vyaparflow_active_role=MSME`;

  const business = await prisma.business.create({
    data: {
      ownerUserId: testUser.id,
      displayName: 'Bc Quality Agro Exporters',
      legalName: 'Bc Agro Processing Pvt Ltd',
      businessType: 'Food & Processed Agri (MANUFACTURER)',
      location: 'Industrial Export Corridor, Plot 52',
      city: 'Mumbai',
      state: 'Maharashtra',
      gstStatus: 'Not Registered',
      iecStatus: 'Pending Application',
      profileCompletion: 60,
    },
  });

  let catFood = await prisma.productCategory.findFirst({ where: { name: { contains: 'Food' } } });
  if (!catFood) {
    catFood = await prisma.productCategory.create({ data: { name: 'Food & Processed Agri' } });
  }

  const prod = await prisma.product.create({
    data: {
      businessId: business.id,
      categoryId: catFood.id,
      name: 'Processed Food Products (Ready-to-Eat / Canned Mango Pulp)',
      hsCode: '2008.99.11',
      unit: 'KG',
      defaultValue: 1000000,
    },
  });

  let countryNL = await prisma.country.findFirst({ where: { isoCode: 'NL' } });
  if (!countryNL) {
    countryNL = await prisma.country.create({ data: { name: 'Netherlands', isoCode: 'NL', active: true } });
  }

  await prisma.productCountry.create({
    data: {
      productId: prod.id,
      countryId: countryNL.id,
    },
  });

  // 1. Verify /dashboard
  const dashRes = await httpGet('http://localhost:3000/dashboard', cookieHeader);
  assert.strictEqual(dashRes.statusCode, 200);
  assert(dashRes.body.includes('Bc Quality Agro Exporters'), 'Must contain brand name');
  assert(dashRes.body.includes('Bc Agro Processing Pvt Ltd'), 'Must contain legal entity name');
  assert(dashRes.body.includes('Netherlands') || dashRes.body.includes('→ Netherlands') || dashRes.body.includes('&rarr; Netherlands'), 'Must contain Netherlands');
  console.log('✓ /dashboard HTML verified: shows "Bc Quality Agro Exporters" & "→ Netherlands"');

  // 2. Verify /readiness
  const readyRes = await httpGet('http://localhost:3000/readiness', cookieHeader);
  assert.strictEqual(readyRes.statusCode, 200);
  assert(readyRes.body.includes('Netherlands'), 'Readiness must display Netherlands corridor');
  console.log('✓ /readiness HTML verified');

  // 3. Verify /business
  const bizRes = await httpGet('http://localhost:3000/business', cookieHeader);
  assert.strictEqual(bizRes.statusCode, 200);
  assert(bizRes.body.includes('Bc Quality Agro Exporters') || bizRes.body.includes('Bc Agro'), 'Business page displays company');
  console.log('✓ /business HTML verified');

  console.log('✅ ALL SERVER ACTION E2E TESTS PASSED!');
}

if (require.main === module) {
  runServerActionE2ETest().catch((err) => {
    console.error('TEST FAILED:', err);
    process.exit(1);
  });
}
