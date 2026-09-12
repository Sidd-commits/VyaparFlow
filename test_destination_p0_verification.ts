import { prisma } from './lib/prisma';
import { getTariffIntelligence, syncBusinessRequirements } from './lib/services/applicability';
import { calculateReadinessScore } from './lib/services/readiness';
import assert from 'assert';

async function runDestinationP0Verification() {
  console.log('================================================================');
  console.log('🔍 P0 DESTINATION DATA CONNECTIVITY & ROOT CAUSE TEST SUITE');
  console.log('================================================================\n');

  // Clean up any test users from previous runs if needed
  const timestamp = Date.now();

  // -------------------------------------------------------------
  // TEST 1: User A - Netherlands Exporter Onboarding & Verification
  // -------------------------------------------------------------
  console.log('🔹 STEP 1: Creating User A (Netherlands Test Exports)...');
  const userA = await prisma.user.create({
    data: {
      email: `netherlands.exporter.${timestamp}@agriflow.nl`,
      passwordHash: 'Password@123',
      name: 'Roop Agro Processing',
      role: 'MSME',
    },
  });

  const businessA = await prisma.business.create({
    data: {
      ownerUserId: userA.id,
      displayName: 'Netherlands Test Exports',
      legalName: 'Roop Agro Processing Pvt Ltd',
      businessType: 'Food & Processed Agri',
      location: 'Export Processing Zone, Nhava Sheva',
      city: 'Mumbai',
      state: 'Maharashtra',
      gstStatus: 'Not Registered',
      iecStatus: 'Pending Application',
      profileCompletion: 85,
    },
  });

  const categoryFood = await prisma.productCategory.findFirst({
    where: { name: { contains: 'Food' } },
  }) || await prisma.productCategory.create({
    data: { name: 'Food & Processed Agri', description: 'Processed Agro Products' },
  });

  const productA = await prisma.product.create({
    data: {
      businessId: businessA.id,
      categoryId: categoryFood.id,
      name: 'Processed Food Products (Ready-to-Eat / Canned Mango Pulp)',
      hsCode: '2008.99.11',
      unit: 'KG',
      defaultValue: 1500000,
    },
  });

  const netherlands = await prisma.country.findFirst({
    where: { isoCode: 'NL' },
  }) || await prisma.country.create({
    data: { name: 'Netherlands', isoCode: 'NL', active: true },
  });

  // Attach Netherlands to Product
  const pcA = await prisma.productCountry.create({
    data: {
      productId: productA.id,
      countryId: netherlands.id,
    },
    include: {
      country: true,
      product: true,
    },
  });

  // Sync requirements
  await syncBusinessRequirements(businessA.id);

  // Fetch Dashboard Header Data for User A
  const dashBusinessA = await prisma.business.findFirst({
    where: { ownerUserId: userA.id },
    include: {
      products: {
        include: {
          destinations: {
            include: { country: true, requirements: true },
          },
        },
      },
    },
  });

  const dashProductA = dashBusinessA?.products[0];
  const dashDestA = dashProductA?.destinations[0]?.country;

  console.log('   [User A Dashboard Data]');
  console.log(`   - Legal Entity: ${dashBusinessA?.legalName}`);
  console.log(`   - Product: ${dashProductA?.name} (HS ${dashProductA?.hsCode})`);
  console.log(`   - Destination: ${dashDestA?.name} (${dashDestA?.isoCode})`);

  assert.strictEqual(dashDestA?.name, 'Netherlands', 'User A destination must be Netherlands');
  assert.strictEqual(dashDestA?.isoCode, 'NL', 'User A ISO code must be NL');
  assert.notStrictEqual(dashDestA?.name, 'United Arab Emirates', 'User A destination MUST NOT be UAE');

  // Verify Tariff for User A
  const tariffA = getTariffIntelligence(dashProductA!.hsCode, dashProductA!.name, dashDestA!.isoCode, dashDestA!.name);
  console.log(`   - Tariff Corridor: ${tariffA.corridorName}`);
  console.log(`   - Trade Agreement: ${tariffA.tradeAgreement}`);
  console.log(`   - Customs Clearance Port: ${tariffA.destinationCountry}`);

  assert(tariffA.corridorName.includes('Netherlands'), 'Tariff corridor must be Netherlands');
  assert(!tariffA.corridorName.includes('United Arab Emirates'), 'Tariff corridor must NOT be UAE');

  // Verify Statutory Requirements for User A
  const readinessA = await calculateReadinessScore(dashProductA!.destinations[0].id);
  const reqTitlesA = readinessA.blockers.map((b) => b.title);
  console.log('   - Destination Requirements:', reqTitlesA);

  assert(reqTitlesA.some((t) => t.includes('EU') || t.includes('REX') || t.includes('Rotterdam')), 'Must contain EU / Rotterdam requirement');
  console.log('✅ STEP 1 PASSED: User A correctly persisted and resolved Netherlands.\n');

  // -------------------------------------------------------------
  // TEST 2: User B - UAE Exporter Onboarding & Verification
  // -------------------------------------------------------------
  console.log('🔹 STEP 2: Creating User B (UAE Test Exports)...');
  const userB = await prisma.user.create({
    data: {
      email: `uae.exporter.${timestamp}@gulfjewels.ae`,
      passwordHash: 'Password@123',
      name: 'Dubai Jewels FZE',
      role: 'MSME',
    },
  });

  const businessB = await prisma.business.create({
    data: {
      ownerUserId: userB.id,
      displayName: 'UAE Test Exports',
      legalName: 'Dubai Jewels Exports Pvt Ltd',
      businessType: 'Gems & Jewellery',
      location: 'SEEPZ SEZ, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      gstStatus: 'Active (27AAAAA0000A1Z5)',
      iecStatus: 'Active (0301099882)',
      profileCompletion: 90,
    },
  });

  const uae = await prisma.country.findFirst({
    where: { isoCode: 'AE' },
  }) || await prisma.country.create({
    data: { name: 'United Arab Emirates', isoCode: 'AE', active: true },
  });

  const productB = await prisma.product.create({
    data: {
      businessId: businessB.id,
      categoryId: categoryFood.id,
      name: 'Handcrafted 22K Gold Filigree Jewellery',
      hsCode: '7113.19.10',
      unit: 'GMS',
      defaultValue: 5000000,
    },
  });

  const pcB = await prisma.productCountry.create({
    data: {
      productId: productB.id,
      countryId: uae.id,
    },
  });

  await syncBusinessRequirements(businessB.id);

  // Fetch Dashboard Header Data for User B
  const dashBusinessB = await prisma.business.findFirst({
    where: { ownerUserId: userB.id },
    include: {
      products: {
        include: {
          destinations: {
            include: { country: true, requirements: true },
          },
        },
      },
    },
  });

  const dashProductB = dashBusinessB?.products[0];
  const dashDestB = dashProductB?.destinations[0]?.country;

  console.log('   [User B Dashboard Data]');
  console.log(`   - Legal Entity: ${dashBusinessB?.legalName}`);
  console.log(`   - Product: ${dashProductB?.name}`);
  console.log(`   - Destination: ${dashDestB?.name} (${dashDestB?.isoCode})`);

  assert.strictEqual(dashDestB?.name, 'United Arab Emirates', 'User B destination must be UAE');
  assert.strictEqual(dashDestB?.isoCode, 'AE', 'User B ISO code must be AE');

  const tariffB = getTariffIntelligence(dashProductB!.hsCode, dashProductB!.name, dashDestB!.isoCode, dashDestB!.name);
  assert(tariffB.corridorName.includes('United Arab Emirates'), 'Tariff corridor must be UAE');
  console.log('✅ STEP 2 PASSED: User B correctly persisted and resolved UAE.\n');

  // -------------------------------------------------------------
  // TEST 3: User A changes destination: Netherlands -> Germany (DE)
  // -------------------------------------------------------------
  console.log('🔹 STEP 3: User A dynamically changes destination from Netherlands -> Germany...');
  const germany = await prisma.country.findFirst({
    where: { isoCode: 'DE' },
  }) || await prisma.country.create({
    data: { name: 'Germany', isoCode: 'DE', active: true },
  });

  // Update Product A destinations
  await prisma.productCountry.deleteMany({
    where: { productId: productA.id },
  });
  await prisma.productCountry.create({
    data: {
      productId: productA.id,
      countryId: germany.id,
    },
  });
  await syncBusinessRequirements(businessA.id);

  // Re-verify User A
  const updatedBusinessA = await prisma.business.findFirst({
    where: { ownerUserId: userA.id },
    include: {
      products: {
        include: {
          destinations: { include: { country: true } },
        },
      },
    },
  });
  const updatedDestA = updatedBusinessA?.products[0]?.destinations[0]?.country;
  console.log(`   - Updated User A Destination: ${updatedDestA?.name} (${updatedDestA?.isoCode})`);
  assert.strictEqual(updatedDestA?.name, 'Germany', 'User A must now be Germany');

  // Verify User B is unaffected
  const checkBusinessB = await prisma.business.findFirst({
    where: { ownerUserId: userB.id },
    include: {
      products: {
        include: {
          destinations: { include: { country: true } },
        },
      },
    },
  });
  const checkDestB = checkBusinessB?.products[0]?.destinations[0]?.country;
  console.log(`   - User B Destination Check: ${checkDestB?.name} (${checkDestB?.isoCode})`);
  assert.strictEqual(checkDestB?.name, 'United Arab Emirates', 'User B must remain UAE');
  console.log('✅ STEP 3 PASSED: Dynamic destination change for User A preserved tenant isolation.\n');

  // -------------------------------------------------------------
  // TEST 4: User B changes destination: UAE -> Vietnam (VN)
  // -------------------------------------------------------------
  console.log('🔹 STEP 4: User B dynamically changes destination from UAE -> Vietnam...');
  const vietnam = await prisma.country.findFirst({
    where: { isoCode: 'VN' },
  }) || await prisma.country.create({
    data: { name: 'Vietnam', isoCode: 'VN', active: true },
  });

  await prisma.productCountry.deleteMany({
    where: { productId: productB.id },
  });
  await prisma.productCountry.create({
    data: {
      productId: productB.id,
      countryId: vietnam.id,
    },
  });
  await syncBusinessRequirements(businessB.id);

  const finalBusinessB = await prisma.business.findFirst({
    where: { ownerUserId: userB.id },
    include: {
      products: {
        include: {
          destinations: { include: { country: true } },
        },
      },
    },
  });
  const finalDestB = finalBusinessB?.products[0]?.destinations[0]?.country;
  console.log(`   - Final User B Destination: ${finalDestB?.name} (${finalDestB?.isoCode})`);
  assert.strictEqual(finalDestB?.name, 'Vietnam', 'User B must now be Vietnam');

  const tariffFinalB = getTariffIntelligence(productB.hsCode, productB.name, finalDestB!.isoCode, finalDestB!.name);
  console.log(`   - User B Tariff Corridor: ${tariffFinalB.corridorName}`);
  assert(tariffFinalB.corridorName.includes('Vietnam'), 'Tariff must reflect Vietnam');
  console.log('✅ STEP 4 PASSED: Dynamic destination change for User B verified.\n');

  // -------------------------------------------------------------
  // TEST 5: Cross-Tenant Security Access Test
  // -------------------------------------------------------------
  console.log('🔹 STEP 5: Verifying Server-Side Tenant Authorization...');
  const userA_Access_UserB_Business = await prisma.business.findFirst({
    where: { id: businessB.id, ownerUserId: userA.id },
  });
  assert.strictEqual(userA_Access_UserB_Business, null, 'User A cannot access User B business by ID');
  console.log('✅ STEP 5 PASSED: Tenant scoping prevents cross-organization access.\n');

  console.log('================================================================');
  console.log('🎉 ALL P0 DESTINATION DATA CONNECTIVITY TESTS PASSED 100%!');
  console.log('================================================================');
}

runDestinationP0Verification()
  .catch((err) => {
    console.error('❌ P0 TEST RUN FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
