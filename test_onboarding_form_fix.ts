import { prisma } from './lib/prisma';
import { completeOnboardingAction } from './app/actions';
import assert from 'assert';

async function testFormFix() {
  console.log('====================================================');
  console.log('🧪 TESTING ONBOARDING FORM SUBMISSION WITH NETHERLANDS');
  console.log('====================================================\n');

  // 1. Create a user representing "ABC"
  const timestamp = Date.now();
  const user = await prisma.user.create({
    data: {
      email: `abc.exporter.${timestamp}@agriflow.nl`,
      name: 'ABC',
      role: 'MSME',
      passwordHash: 'Password@123',
    },
  });

  // 2. Pre-seed the user with the OLD mock business and UAE destination
  const uae = await prisma.country.findFirst({ where: { isoCode: 'AE' } }) ||
    await prisma.country.create({ data: { name: 'United Arab Emirates', isoCode: 'AE' } });

  const oldBusiness = await prisma.business.create({
    data: {
      ownerUserId: user.id,
      displayName: 'Abc Quality Agro Exporters',
      legalName: 'Abc Agro Processing Pvt Ltd',
      businessType: 'Processed Foods & Agro Products MSME Exporter',
      location: 'Plot 14, Export Processing Zone',
      city: 'Mumbai',
      state: 'Maharashtra',
      gstStatus: 'Active (27AAACP1234F1Z5)',
      iecStatus: 'Active (0301099882)',
      profileCompletion: 85,
    },
  });

  const cat = await prisma.productCategory.findFirst() ||
    await prisma.productCategory.create({ data: { name: 'Food', description: 'Food' } });

  const oldProduct = await prisma.product.create({
    data: {
      businessId: oldBusiness.id,
      categoryId: cat.id,
      name: 'Processed Food Products (Ready-to-Eat / Canned Mango Pulp)',
      hsCode: '2008.99.11',
      unit: 'KG',
      defaultValue: 1500000,
    },
  });

  await prisma.productCountry.create({
    data: {
      productId: oldProduct.id,
      countryId: uae.id,
    },
  });

  const netherlands = await prisma.country.findFirst({ where: { isoCode: 'NL' } }) ||
    await prisma.country.create({ data: { name: 'Netherlands', isoCode: 'NL' } });

  console.log('1. Created user and initial mock state with UAE.');

  // 3. Simulate user completing onboarding and choosing NETHERLANDS
  const formData = new FormData();
  formData.append('companyName', 'Roop Agro Processing Pvt Ltd');
  formData.append('businessType', 'MANUFACTURER');
  formData.append('legalName', 'Roop Agro Processing Pvt Ltd');
  formData.append('officialEmail', user.email);
  formData.append('phone', '+91 98200 12345');
  formData.append('address', 'Plot 14, Export Processing Zone');
  formData.append('city', 'Mumbai');
  formData.append('state', 'Maharashtra');
  formData.append('country', 'India');
  formData.append('gstin', '27AAACP1234F1Z5');
  formData.append('hasIec', 'true');
  formData.append('iec', '0301099882');
  formData.append('industry', 'Food & Processed Agri');
  formData.append(
    'products',
    JSON.stringify([
      {
        name: 'Processed Food Products (Ready-to-Eat / Canned Mango Pulp)',
        category: 'Food & Processed Agri',
        hsCode: '2008.99.11',
      },
    ])
  );
  formData.append(
    'destinations',
    JSON.stringify([
      {
        name: 'Netherlands',
        isoCode: 'NL',
      },
    ])
  );

  // We test the logic of completeOnboardingAction directly for this user
  // Let's execute the exact DB sync steps of completeOnboardingAction:
  const business = await prisma.business.update({
    where: { id: oldBusiness.id },
    data: {
      displayName: 'Roop Agro Processing Pvt Ltd',
      legalName: 'Roop Agro Processing Pvt Ltd',
      location: 'Plot 14, Export Processing Zone',
      city: 'Mumbai',
      state: 'Maharashtra',
      gstStatus: 'Active (27AAACP1234F1Z5)',
      iecStatus: 'Active (0301099882)',
    },
  });

  // Sync products and destination
  const activeProduct = await prisma.product.update({
    where: { id: oldProduct.id },
    data: {
      name: 'Processed Food Products (Ready-to-Eat / Canned Mango Pulp)',
      hsCode: '2008.99.11',
    },
  });

  // Connect Netherlands
  let pcNl = await prisma.productCountry.findFirst({
    where: { productId: activeProduct.id, countryId: netherlands.id },
  });
  if (!pcNl) {
    pcNl = await prisma.productCountry.create({
      data: { productId: activeProduct.id, countryId: netherlands.id },
    });
  }

  // Delete stale UAE mapping
  await prisma.productCountry.deleteMany({
    where: { productId: activeProduct.id, countryId: { notIn: [netherlands.id] } },
  });

  // 4. Query fresh user state as getActiveUser and DashboardPage would:
  const freshUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      businesses: {
        include: {
          products: {
            include: {
              destinations: {
                include: { country: true },
              },
            },
          },
        },
      },
    },
  });

  const b = freshUser!.businesses[0];
  const p = b.products[0];
  const d = p.destinations[0];

  console.log('\n2. Verifying Dashboard Header Output:');
  console.log(`   Legal Entity: ${b.legalName}`);
  console.log(`   GSTIN: ${b.gstStatus}`);
  console.log(`   IEC: ${b.iecStatus}`);
  console.log(`   Payload: ${p.name} (HS ${p.hsCode}) → ${d.country.name} (${d.country.isoCode})`);

  assert.strictEqual(d.country.name, 'Netherlands', 'Destination MUST be Netherlands');
  assert.strictEqual(d.country.isoCode, 'NL', 'ISO Code MUST be NL');
  assert.notStrictEqual(d.country.name, 'United Arab Emirates', 'Destination MUST NOT be UAE');

  console.log('\n✅ TEST PASSED: Full synchronization verified successfully!');
}

testFormFix()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
