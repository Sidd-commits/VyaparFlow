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

export async function runLiveDestinationE2ETest() {
  console.log('================================================================');
  console.log('🧪 RUNNING E2E TEST: LIVE DESTINATION ONBOARDING & DASHBOARD');
  console.log('================================================================');

  const timestamp = Date.now();
  const emailJapan = `e2e_japan_${timestamp}@vyaparflow.app`;
  const nameJapan = 'BC';

  const userJapan = await prisma.user.create({
    data: {
      email: emailJapan,
      name: nameJapan,
      passwordHash: 'secret123',
      role: 'MSME',
    },
  });

  const cookieJapan = `vyaparflow_active_user_id=${userJapan.id}; vyaparflow_active_user_email=${encodeURIComponent(userJapan.email)}; vyaparflow_active_user_name=${encodeURIComponent(userJapan.name)}; vyaparflow_active_role=MSME`;

  let countryJP = await prisma.country.findFirst({ where: { isoCode: 'JP' } });
  if (!countryJP) {
    countryJP = await prisma.country.create({ data: { name: 'Japan', isoCode: 'JP', active: true } });
  }

  const bizJP = await prisma.business.create({
    data: {
      ownerUserId: userJapan.id,
      displayName: 'Bc Quality Agro Exporters',
      legalName: 'Bc Agro Processing Pvt Ltd',
      businessType: 'Food & Processed Agri (MANUFACTURER)',
      location: 'Industrial Export Corridor',
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

  const prodJP = await prisma.product.create({
    data: {
      businessId: bizJP.id,
      categoryId: catFood.id,
      name: 'Processed Food Products (Ready-to-Eat / Canned Mango Pulp)',
      hsCode: '2008.99.11',
      unit: 'KG',
      defaultValue: 1000000,
    },
  });

  await prisma.productCountry.create({
    data: {
      productId: prodJP.id,
      countryId: countryJP.id,
    },
  });

  const resJP = await httpGet('http://localhost:3000/dashboard', cookieJapan);
  assert.strictEqual(resJP.statusCode, 200, 'Status must be 200 OK');

  const htmlJP = resJP.body;
  assert(htmlJP.includes('Bc Quality Agro Exporters'), 'Dashboard must display brand name');
  assert(htmlJP.includes('Bc Agro Processing Pvt Ltd'), 'Dashboard must display legal entity name');
  assert(htmlJP.includes('Japan') || htmlJP.includes('→ Japan') || htmlJP.includes('&rarr; Japan'), 'Dashboard must display Japan');
  assert(!htmlJP.includes('→ United Arab Emirates') && !htmlJP.includes('&rarr; United Arab Emirates'), 'Dashboard must NOT display UAE arrow');

  console.log('✓ E2E Japan destination verification passed');

  // Test Netherlands
  const emailNL = `e2e_nl_${timestamp}@vyaparflow.app`;
  const userNL = await prisma.user.create({
    data: {
      email: emailNL,
      name: 'BC',
      passwordHash: 'secret123',
      role: 'MSME',
    },
  });

  const cookieNL = `vyaparflow_active_user_id=${userNL.id}; vyaparflow_active_user_email=${encodeURIComponent(userNL.email)}; vyaparflow_active_user_name=${encodeURIComponent(userNL.name)}; vyaparflow_active_role=MSME`;

  let countryNL = await prisma.country.findFirst({ where: { isoCode: 'NL' } });
  if (!countryNL) {
    countryNL = await prisma.country.create({ data: { name: 'Netherlands', isoCode: 'NL', active: true } });
  }

  const bizNL = await prisma.business.create({
    data: {
      ownerUserId: userNL.id,
      displayName: 'Bc Quality Agro Exporters',
      legalName: 'Bc Agro Processing Pvt Ltd',
      businessType: 'Food & Processed Agri (MANUFACTURER)',
      location: 'Industrial Export Corridor',
      city: 'Mumbai',
      state: 'Maharashtra',
      gstStatus: 'Not Registered',
      iecStatus: 'Pending Application',
      profileCompletion: 60,
    },
  });

  const prodNL = await prisma.product.create({
    data: {
      businessId: bizNL.id,
      categoryId: catFood.id,
      name: 'Processed Food Products (Ready-to-Eat / Canned Mango Pulp)',
      hsCode: '2008.99.11',
      unit: 'KG',
      defaultValue: 1000000,
    },
  });

  await prisma.productCountry.create({
    data: {
      productId: prodNL.id,
      countryId: countryNL.id,
    },
  });

  const resNL = await httpGet('http://localhost:3000/dashboard', cookieNL);
  assert.strictEqual(resNL.statusCode, 200, 'Status must be 200 OK');

  const htmlNL = resNL.body;
  assert(htmlNL.includes('Netherlands') || htmlNL.includes('→ Netherlands') || htmlNL.includes('&rarr; Netherlands'), 'Dashboard must display Netherlands');
  assert(!htmlNL.includes('→ United Arab Emirates') && !htmlNL.includes('&rarr; United Arab Emirates'), 'Dashboard must NOT display UAE arrow');

  console.log('✓ E2E Netherlands destination verification passed');
  console.log('✅ ALL LIVE DESTINATION E2E TESTS PASSED!');
}

if (require.main === module) {
  runLiveDestinationE2ETest().catch((err) => {
    console.error('TEST FAILED:', err);
    process.exit(1);
  });
}
