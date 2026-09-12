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

export async function runDestinationSwitcherTest() {
  console.log('================================================================');
  console.log('🧪 RUNNING INTEGRATION TEST: DESTINATION SWITCHER');
  console.log('================================================================');

  const ts = Date.now();
  const user = await prisma.user.create({
    data: {
      email: `switcher.test.${ts}@vyaparflow.app`,
      name: 'Switcher Test Exporter',
      passwordHash: 'secret123',
      role: 'MSME',
    },
  });

  const cookieHeader = `vyaparflow_active_user_id=${user.id}; vyaparflow_active_user_email=${encodeURIComponent(user.email)}; vyaparflow_active_user_name=${encodeURIComponent(user.name)}; vyaparflow_active_role=MSME`;

  let countryNL = await prisma.country.findFirst({ where: { isoCode: 'NL' } });
  if (!countryNL) {
    countryNL = await prisma.country.create({ data: { name: 'Netherlands', isoCode: 'NL', active: true } });
  }

  const biz = await prisma.business.create({
    data: {
      ownerUserId: user.id,
      displayName: 'Switcher Quality Exports',
      legalName: 'Switcher Agro Pvt Ltd',
      businessType: 'Food & Agricultural Goods (Processed Foods, Spices, Grains)',
      location: 'Plot 10, MIDC',
      city: 'Mumbai',
      state: 'Maharashtra',
      gstStatus: 'Active (27AAACP1234F1Z5)',
      iecStatus: 'Active (0301099882)',
      profileCompletion: 80,
    },
  });

  let catFood = await prisma.productCategory.findFirst({ where: { name: { contains: 'Food' } } });
  if (!catFood) {
    catFood = await prisma.productCategory.create({ data: { name: 'Food & Processed Agri' } });
  }

  const prod = await prisma.product.create({
    data: {
      businessId: biz.id,
      categoryId: catFood.id,
      name: 'Processed Food Products (Ready-to-Eat / Canned Mango Pulp)',
      hsCode: '2008.99.11',
      unit: 'KG',
      defaultValue: 1000000,
    },
  });

  const pc = await prisma.productCountry.create({
    data: {
      productId: prod.id,
      countryId: countryNL.id,
    },
  });

  // Verify initial Netherlands dashboard
  const res1 = await httpGet('http://localhost:3000/dashboard', cookieHeader);
  assert.strictEqual(res1.statusCode, 200);
  assert(res1.body.includes('Netherlands') || res1.body.includes('→ Netherlands') || res1.body.includes('&rarr; Netherlands'), 'Must display Netherlands');
  assert(!res1.body.includes('→ United Arab Emirates') && !res1.body.includes('&rarr; United Arab Emirates'), 'Must NOT display UAE arrow');
  console.log('✓ Initial dashboard displays "→ Netherlands"');

  // Switch to JAPAN (JP)
  let jpCountry = await prisma.country.findFirst({ where: { isoCode: 'JP' } });
  if (!jpCountry) jpCountry = await prisma.country.create({ data: { name: 'Japan', isoCode: 'JP', active: true } });

  await prisma.productCountry.update({
    where: { id: pc.id },
    data: { countryId: jpCountry.id },
  });

  const res2 = await httpGet('http://localhost:3000/dashboard', cookieHeader);
  assert.strictEqual(res2.statusCode, 200);
  assert(res2.body.includes('Japan') || res2.body.includes('→ Japan') || res2.body.includes('&rarr; Japan'), 'Must display Japan');
  console.log('✓ Switched destination to JAPAN: dashboard immediately shows "→ Japan"');

  console.log('✅ ALL DESTINATION SWITCHER TESTS PASSED!');
}

if (require.main === module) {
  runDestinationSwitcherTest().catch((err) => {
    console.error('TEST FAILED:', err);
    process.exit(1);
  });
}
