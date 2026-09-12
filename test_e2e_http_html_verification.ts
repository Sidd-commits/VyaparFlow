import { prisma } from './lib/prisma';
import assert from 'assert';

async function testFullEndToEndHttpJourney() {
  console.log('================================================================');
  console.log('🌐 FULL HTTP & RENDERED HTML ONBOARDING JOURNEY TEST');
  console.log('================================================================\n');

  const timestamp = Date.now();

  // -------------------------------------------------------------
  // TEST SCENARIO 1: JAPAN EXPORTER (Destination = Japan / JP)
  // -------------------------------------------------------------
  console.log('-------------------------------------------------------------');
  console.log('🔹 SCENARIO 1: Fresh User Onboarding with Destination = Japan (JP)');
  console.log('-------------------------------------------------------------');

  // 1. Create fresh user
  const userJapan = await prisma.user.create({
    data: {
      email: `tokyo.exporter.${timestamp}@agriflow.jp`,
      name: 'Kenji Agro Exports',
      role: 'MSME',
      passwordHash: 'UserPassword@123',
    },
  });

  // Ensure Japan exists in Country table
  const japan = await prisma.country.findFirst({ where: { isoCode: 'JP' } }) ||
    await prisma.country.create({ data: { name: 'Japan', isoCode: 'JP', active: true } });

  // 2. Perform onboarding persistence exactly as completeOnboardingAction does
  const categoryFood = await prisma.productCategory.findFirst({
    where: { name: { contains: 'Food' } },
  }) || await prisma.productCategory.create({
    data: { name: 'Food & Processed Agri', description: 'Food & Agriculture' },
  });

  const businessJapan = await prisma.business.create({
    data: {
      ownerUserId: userJapan.id,
      displayName: 'Kenji Premium Mango Exports',
      legalName: 'Kenji Agro Processing India Pvt Ltd',
      businessType: 'Food & Processed Agri (MANUFACTURER)',
      location: 'Plot 55, Agro Processing Zone',
      city: 'Pune',
      state: 'Maharashtra',
      gstStatus: 'Active (27AAACK1234K1Z5)',
      iecStatus: 'Active (0301099882)',
      profileCompletion: 100,
    },
  });

  const productJapan = await prisma.product.create({
    data: {
      businessId: businessJapan.id,
      categoryId: categoryFood.id,
      name: 'Processed Food Products (Ready-to-Eat / Canned Mango Pulp)',
      hsCode: '2008.99.11',
      unit: 'KG',
      defaultValue: 1600000,
    },
  });

  const pcJapan = await prisma.productCountry.create({
    data: {
      productId: productJapan.id,
      countryId: japan.id,
    },
    include: { country: true },
  });

  // 3. Fetch rendered dashboard page over HTTP with session cookies
  const cookiesHeader = `vyaparflow_active_user_id=${userJapan.id}; vyaparflow_active_user_email=${encodeURIComponent(userJapan.email)}; vyaparflow_active_user_name=${encodeURIComponent(userJapan.name)}; vyaparflow_active_role=MSME`;

  console.log('   Sending HTTP GET request to http://localhost:3000/dashboard with User session cookies...');
  const resJapan = await fetch('http://localhost:3000/dashboard', {
    headers: {
      Cookie: cookiesHeader,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });

  const htmlJapan = await resJapan.text();

  console.log(`   HTTP Response Status: ${resJapan.status} ${resJapan.statusText}`);

  // Assertions on rendered HTML
  const hasKenjiBrand = htmlJapan.includes('Kenji Premium Mango Exports');
  const hasKenjiLegal = htmlJapan.includes('Kenji Agro Processing India Pvt Ltd');
  const hasJapanDestination = htmlJapan.includes('Japan') || htmlJapan.includes('→ Japan') || htmlJapan.includes('&rarr; Japan');
  const hasUaeDestination = htmlJapan.includes('→ United Arab Emirates') || htmlJapan.includes('&rarr; United Arab Emirates') || htmlJapan.includes('United Arab Emirates (India-UAE CEPA');

  console.log(`   - Brand Name in HTML: ${hasKenjiBrand ? '✅ FOUND' : '❌ NOT FOUND'}`);
  console.log(`   - Legal Entity in HTML: ${hasKenjiLegal ? '✅ FOUND' : '❌ NOT FOUND'}`);
  console.log(`   - Japan Destination in HTML: ${hasJapanDestination ? '✅ FOUND' : '❌ NOT FOUND'}`);
  console.log(`   - UAE False Fallback in HTML: ${hasUaeDestination ? '❌ FOUND (BUG!)' : '✅ NOT FOUND'}`);

  assert(hasKenjiBrand, 'Dashboard HTML must render the user brand name');
  assert(hasKenjiLegal, 'Dashboard HTML must render the user legal entity');
  assert(hasJapanDestination, 'Dashboard HTML must render Japan destination');
  assert(!hasUaeDestination, 'Dashboard HTML MUST NOT contain UAE fallback');

  console.log('✅ SCENARIO 1 (JAPAN) PASSED 100%!\n');

  // -------------------------------------------------------------
  // TEST SCENARIO 2: NETHERLANDS EXPORTER (Destination = Netherlands / NL)
  // -------------------------------------------------------------
  console.log('-------------------------------------------------------------');
  console.log('🔹 SCENARIO 2: Fresh User Onboarding with Destination = Netherlands (NL)');
  console.log('-------------------------------------------------------------');

  const userNl = await prisma.user.create({
    data: {
      email: `amsterdam.exporter.${timestamp}@agriflow.nl`,
      name: 'Roop Agro Processing',
      role: 'MSME',
      passwordHash: 'UserPassword@123',
    },
  });

  const netherlands = await prisma.country.findFirst({ where: { isoCode: 'NL' } }) ||
    await prisma.country.create({ data: { name: 'Netherlands', isoCode: 'NL', active: true } });

  const businessNl = await prisma.business.create({
    data: {
      ownerUserId: userNl.id,
      displayName: 'Roop Agro Processing Pvt Ltd',
      legalName: 'Roop Agro Processing Private Limited',
      businessType: 'Food & Processed Agri (MANUFACTURER)',
      location: 'Plot 14, Export Processing Zone',
      city: 'Mumbai',
      state: 'Maharashtra',
      gstStatus: 'Not Registered',
      iecStatus: 'Pending Application',
      profileCompletion: 80,
    },
  });

  const productNl = await prisma.product.create({
    data: {
      businessId: businessNl.id,
      categoryId: categoryFood.id,
      name: 'Processed Food Products (Ready-to-Eat / Canned Mango Pulp)',
      hsCode: '2008.99.11',
      unit: 'KG',
      defaultValue: 1500000,
    },
  });

  await prisma.productCountry.create({
    data: {
      productId: productNl.id,
      countryId: netherlands.id,
    },
    include: { country: true },
  });

  const cookiesHeaderNl = `vyaparflow_active_user_id=${userNl.id}; vyaparflow_active_user_email=${encodeURIComponent(userNl.email)}; vyaparflow_active_user_name=${encodeURIComponent(userNl.name)}; vyaparflow_active_role=MSME`;

  console.log('   Sending HTTP GET request to http://localhost:3000/dashboard for Netherlands user...');
  const resNl = await fetch('http://localhost:3000/dashboard', {
    headers: {
      Cookie: cookiesHeaderNl,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });

  const htmlNl = await resNl.text();
  console.log(`   HTTP Response Status: ${resNl.status} ${resNl.statusText}`);

  const hasRoopBrand = htmlNl.includes('Roop Agro Processing Pvt Ltd');
  const hasNlDestination = htmlNl.includes('Netherlands') || htmlNl.includes('→ Netherlands') || htmlNl.includes('&rarr; Netherlands');
  const hasRotterdamCorridor = htmlNl.includes('Rotterdam') || htmlNl.includes('EU Single Market');
  const hasUaeNl = htmlNl.includes('→ United Arab Emirates') || htmlNl.includes('&rarr; United Arab Emirates') || htmlNl.includes('United Arab Emirates (India-UAE CEPA');

  console.log(`   - Roop Brand in HTML: ${hasRoopBrand ? '✅ FOUND' : '❌ NOT FOUND'}`);
  console.log(`   - Netherlands in HTML: ${hasNlDestination ? '✅ FOUND' : '❌ NOT FOUND'}`);
  console.log(`   - Rotterdam/EU Corridor in HTML: ${hasRotterdamCorridor ? '✅ FOUND' : '❌ NOT FOUND'}`);
  console.log(`   - UAE False Fallback in HTML: ${hasUaeNl ? '❌ FOUND (BUG!)' : '✅ NOT FOUND'}`);

  assert(hasRoopBrand, 'Dashboard HTML must render Roop brand name');
  assert(hasNlDestination, 'Dashboard HTML must render Netherlands destination');
  assert(hasRotterdamCorridor, 'Dashboard HTML must render Rotterdam/EU tariff corridor');
  assert(!hasUaeNl, 'Dashboard HTML MUST NOT contain UAE fallback');

  console.log('✅ SCENARIO 2 (NETHERLANDS) PASSED 100%!\n');

  console.log('================================================================');
  console.log('🎉 ALL LIVE HTTP / DASHBOARD RENDER TESTS PASSED 100%!');
  console.log('================================================================');
}

testFullEndToEndHttpJourney()
  .catch((e) => {
    console.error('❌ HTTP TEST RUN FAILED:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
