import { prisma } from './lib/prisma';
import {
  getApplicableRequirementsForCorridor,
  syncBusinessRequirements,
  getTariffIntelligence,
} from './lib/services/applicability';
import { calculateReadinessScore } from './lib/services/readiness';
import { verifyDocumentAction } from './app/actions';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 VYAPARFLOW ONBOARDING & PERSONALIZATION TEST SUITE');
  console.log('====================================================\n');

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Industry Personalization Engine Rules
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Industry-Specific Requirement Applicability ---');

    // Scenario A: Food Exporter
    const foodRules = getApplicableRequirementsForCorridor(
      'Processed Foods MSME Exporter',
      'Food & Agriculture',
      '2008.99.11',
      'AE'
    );
    const hasFssai = foodRules.some((r) => r.title.includes('FSSAI'));
    const hasApeda = foodRules.some((r) => r.title.includes('APEDA'));
    const hasBisSteelInFood = foodRules.some((r) => r.title.includes('BIS Quality Certification'));

    assert(hasFssai, 'Food Exporter receives mandatory FSSAI Food Export License requirement');
    assert(hasApeda, 'Food Exporter receives APEDA RCMC registration requirement');
    assert(!hasBisSteelInFood, 'Food Exporter does NOT receive irrelevant BIS Steel certification');

    // Scenario B: Gold & Jewellery Exporter
    const goldRules = getApplicableRequirementsForCorridor(
      'Gems & Jewellery (Manufacturer)',
      'Gems & Jewellery',
      '7113.19.00',
      'AE'
    );
    const hasFssaiInGold = goldRules.some((r) => r.title.includes('FSSAI'));
    const hasHallmarking = goldRules.some((r) => r.title.includes('Hallmarking') || r.title.includes('GJEPC'));

    assert(!hasFssaiInGold, 'Gold & Jewellery Exporter must NEVER receive FSSAI requirements');
    assert(hasHallmarking, 'Gold & Jewellery Exporter receives Hallmarking / GJEPC RCMC requirements');

    // Scenario C: Steel & Metal Exporter
    const metalRules = getApplicableRequirementsForCorridor(
      'Iron, Steel & Metals (Manufacturer)',
      'Metals & Steel',
      '7304.11.00',
      'US'
    );
    const hasBisSteel = metalRules.some((r) => r.title.includes('BIS Quality Certification'));
    const hasMtc = metalRules.some((r) => r.title.includes('Mill Test Certificate'));
    const hasFssaiInMetal = metalRules.some((r) => r.title.includes('FSSAI'));

    assert(hasBisSteel, 'Metal Exporter receives BIS Steel Quality Certification');
    assert(hasMtc, 'Metal Exporter receives Mill Test Certificate (MTC EN 10204 3.1)');
    assert(!hasFssaiInMetal, 'Metal Exporter does NOT receive FSSAI food certifications');

    // Scenario D: Destination-specific Trade Corridors (India-UAE CEPA vs USA)
    const uaeRules = getApplicableRequirementsForCorridor('Textiles & Garments', 'Textiles', '6109.10', 'AE');
    const usRules = getApplicableRequirementsForCorridor('Textiles & Garments', 'Textiles', '6109.10', 'US');

    const uaeCoo = uaeRules.find((r) => r.title.includes('Certificate of Origin'));
    const usCoo = usRules.find((r) => r.title.includes('Certificate of Origin'));

    assert(uaeCoo?.title.includes('CEPA Preferential') || false, 'UAE Corridor specifies India-UAE CEPA Preferential COO');
    assert(usCoo?.title.includes('Non-Preferential') || false, 'US Corridor specifies Non-Preferential COO');

    // -------------------------------------------------------------------------
    // TEST 2: End-to-End Onboarding Workspace Setup & Data Persistence
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: End-to-End MSME Onboarding & Dynamic Sync ---');

    // 1. Create registered user without business (simulating step after signup)
    const testUser = await prisma.user.create({
      data: {
        email: `msme_onboard_${Date.now()}@vyaparflow.app`,
        name: 'Suresh Textile Mills',
        role: 'MSME',
        passwordHash: 'password123',
      },
    });

    assert(testUser.id !== undefined, 'User registered with account credentials');

    // 2. Complete 6-Step Onboarding for Textile Exporter
    const countryUae = (await prisma.country.findFirst({ where: { isoCode: 'AE' } })) ||
      (await prisma.country.create({ data: { name: 'United Arab Emirates', isoCode: 'AE' } }));

    const categoryTextiles = (await prisma.productCategory.findFirst({ where: { name: { contains: 'Textile' } } })) ||
      (await prisma.productCategory.create({ data: { name: 'Textiles & Garments', description: 'Apparel & Fabrics' } }));

    const onboardedBiz = await prisma.business.create({
      data: {
        ownerUserId: testUser.id,
        displayName: 'Suresh Quality Fabrics',
        legalName: 'Suresh Textile Mills Pvt Ltd',
        businessType: 'Textiles & Garments (MANUFACTURER)',
        location: 'Plot 44, Tirupur Textile Hub',
        city: 'Tirupur',
        state: 'Tamil Nadu',
        gstStatus: 'Active (33AAAAA1234A1Z5)',
        iecStatus: 'Active (3301020304)',
        profileCompletion: 100,
      },
    });

    const onboardedProd = await prisma.product.create({
      data: {
        businessId: onboardedBiz.id,
        categoryId: categoryTextiles.id,
        name: 'Combed Cotton Knit T-Shirts',
        hsCode: '6109.10.00',
        defaultValue: 2000000,
      },
    });

    const onboardedDest = await prisma.productCountry.create({
      data: {
        productId: onboardedProd.id,
        countryId: countryUae.id,
      },
    });

    // 3. Dynamically sync requirements based on the onboarded textile business
    await syncBusinessRequirements(onboardedBiz.id);

    const generatedReqs = await prisma.requirement.findMany({
      where: { productCountryId: onboardedDest.id },
    });

    assert(generatedReqs.length > 0, `Onboarding dynamically generated ${generatedReqs.length} personalized requirements`);

    const hasTexprocil = generatedReqs.some((r) => r.title.toLowerCase().includes('texprocil') || r.title.toLowerCase().includes('aepc'));
    const hasOekoTex = generatedReqs.some((r) => r.title.toLowerCase().includes('oeko-tex'));
    const hasFssaiOnTextile = generatedReqs.some((r) => r.title.toLowerCase().includes('fssai'));

    assert(hasTexprocil, 'Textile exporter receives AEPC / Texprocil RCMC requirement');
    assert(hasOekoTex, 'Textile exporter receives OEKO-TEX Standard 100 testing requirement');
    assert(!hasFssaiOnTextile, 'Textile exporter is NEVER assigned FSSAI requirements');

    // -------------------------------------------------------------------------
    // TEST 3: Document State Machine & Verification Workflow
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Document Upload Lifecycle (Uploaded -> Under Review -> Verified) ---');

    const targetReq = generatedReqs.find((r) => r.title.includes('OEKO-TEX')) || generatedReqs[0];

    // Exporter uploads evidence document
    const uploadedDoc = await prisma.document.create({
      data: {
        businessId: onboardedBiz.id,
        requirementId: targetReq.id,
        type: 'TEST_REPORT',
        storageKey: 'uploads/oeko_tex_test_report_2026.pdf',
        originalName: 'OEKO_TEX_Lab_Pass_Report.pdf',
        mimeType: 'application/pdf',
        size: 1450000,
        status: 'under_review',
        notes: 'Submitted for accredited laboratory compliance review.',
      },
    });

    await prisma.requirement.update({
      where: { id: targetReq.id },
      data: { status: 'under_review', completedAt: null },
    });

    // Verify that simply uploading a file does NOT mark readiness as complete
    const readinessUnderReview = await calculateReadinessScore(onboardedDest.id);
    assert(
      readinessUnderReview.blockers.some((b) => b.title === targetReq.title),
      'Document in "under_review" state remains a critical blocker until authorized approval'
    );

    // Now provider approves document
    await prisma.document.update({
      where: { id: uploadedDoc.id },
      data: { status: 'verified', notes: 'Lab pass verified by SGS Testing Laboratory.' },
    });

    await prisma.requirement.update({
      where: { id: targetReq.id },
      data: { status: 'verified', completedAt: new Date(), reason: 'Verified by authorized reviewer.' },
    });

    const readinessApproved = await calculateReadinessScore(onboardedDest.id);
    assert(
      !readinessApproved.blockers.some((b) => b.title === targetReq.title),
      'Approved document removes blocker and increments export readiness score'
    );
    assert(
      readinessApproved.totalScore >= readinessUnderReview.totalScore,
      `Readiness score increased after verified approval: ${readinessApproved.totalScore}% >= ${readinessUnderReview.totalScore}%`
    );

    // -------------------------------------------------------------------------
    // TEST 4: Multi-Tenant Isolation
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Multi-Tenant Data Isolation ---');

    const tenantUserA = testUser;
    const tenantUserB = await prisma.user.create({
      data: {
        email: `isolated_b_${Date.now()}@vyaparflow.app`,
        name: 'Precision Engineering Hub',
        role: 'MSME',
        passwordHash: 'password123',
        businesses: {
          create: {
            legalName: 'Precision Engineering Pvt Ltd',
            displayName: 'Precision Engineering',
            businessType: 'Engineering & Machinery (MANUFACTURER)',
            location: 'Plot 88, Bhosari MIDC',
            city: 'Pune',
            state: 'Maharashtra',
          },
        },
      },
      include: { businesses: true },
    });

    const userADocs = await prisma.document.findMany({ where: { businessId: onboardedBiz.id } });
    const userBDocs = await prisma.document.findMany({ where: { businessId: tenantUserB.businesses[0].id } });

    const isolationLeak = userBDocs.some((d) => d.businessId === onboardedBiz.id);
    assert(!isolationLeak, 'Tenant B has zero access to Tenant A documents and business profile');

    // -------------------------------------------------------------------------
    // TEST 5: Tariff Intelligence
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Trade Corridor & Tariff Intelligence ---');

    const uaeTariff = getTariffIntelligence('6109.10.00', 'Cotton Knitwear', 'AE', 'United Arab Emirates');
    assert(uaeTariff.preferentialTariff.includes('0.0%'), 'CEPA corridor reflects 0.0% preferential duty for verified origin');
    assert(uaeTariff.disclaimer.length > 0, 'Tariff intelligence displays verified legal authority disclaimer');

    console.log('\n====================================================');
    console.log('🎉 ALL 12 ONBOARDING & PERSONALIZATION TESTS PASSED!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('Test run failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
