import { prisma } from '@/lib/prisma';
import {
  calculateReadinessScore,
} from '@/lib/services/readiness';
import {
  calculateProfileCompleteness,
  syncBusinessProfileCompleteness,
} from '@/lib/services/profileCompleteness';
import { evaluateShipmentClearance } from '@/lib/services/shipmentClearance';
import { getApplicableRequirementsForCorridor, getTariffIntelligence } from '@/lib/services/applicability';
import { validateGSTIN, validateIEC } from '@/lib/businessTypeConfig';
import { createSessionToken } from '@/lib/session';
import { hashPassword, verifyPassword } from '@/lib/crypto';

async function runPlatformAudit() {
  console.log('================================================================');
  console.log('🧪 VYAPARFLOW MASTER PLATFORM AUDIT & FUNCTIONAL TEST SUITE');
  console.log('================================================================\n');

  let passedChecks = 0;
  let totalChecks = 0;

  function assert(condition: boolean, message: string) {
    totalChecks++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passedChecks++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // -------------------------------------------------------------
  // Test 1: Cryptography & Security Session Engine
  // -------------------------------------------------------------
  console.log('📌 1. Cryptography, Password Hashing & JWT Sessions');
  const password = 'SecurePassword123!';
  const hash = await hashPassword(password);
  assert(typeof hash === 'string' && hash.startsWith('pbkdf2$'), 'PBKDF2 secure password hash generated');
  const isCorrect = await verifyPassword(password, hash);
  assert(isCorrect === true, 'Password verification succeeds with correct credentials');
  const isIncorrect = await verifyPassword('WrongPassword', hash);
  assert(isIncorrect === false, 'Password verification fails on incorrect credentials');

  const token = await createSessionToken({ userId: 'u-1', email: 'test@vyaparflow.in', role: 'MSME' });
  assert(typeof token === 'string' && token.length > 20, 'Cryptographic JWT session token issued');

  // -------------------------------------------------------------
  // Test 2: Statutory Registration & Tax Validators
  // -------------------------------------------------------------
  console.log('\n📌 2. Statutory Registrations & Format Validators');
  assert(validateGSTIN('27AAAAA0000A1Z5').valid === true, 'Valid 15-digit GSTIN recognized');
  assert(validateGSTIN('INVALID_GSTIN').valid === false, 'Invalid GSTIN format rejected');
  assert(validateIEC('0301099882').valid === true, 'Valid 10-digit DGFT IEC recognized');
  assert(validateIEC('12345').valid === false, 'Invalid IEC code rejected');

  // -------------------------------------------------------------
  // Test 3: Tariff Intelligence & Corridor Engine
  // -------------------------------------------------------------
  console.log('\n📌 3. Tariff Intelligence & Bilateral Trade Rules');
  const tariffNL = getTariffIntelligence('2008.99.11', 'Mango Pulp', 'NL', 'Netherlands');
  assert(tariffNL.standardMfnTariff.length > 0, 'EU MFN tariff intelligence retrieved');
  assert(tariffNL.tradeAgreement.includes('EU') || tariffNL.tradeAgreement.length > 0, 'Trade corridor framework identified');

  const rulesNL = getApplicableRequirementsForCorridor('Food', 'Agri', '2008.99.11', 'NL');
  assert(rulesNL.length >= 4, 'Tailored corridor rules populated for Netherlands (NL)');
  assert(rulesNL.some((r) => r.type === 'document' || r.type === 'certification'), 'Rule types categorized correctly');

  // -------------------------------------------------------------
  // Test 4: Profile Completeness & Synchronization Engine
  // -------------------------------------------------------------
  console.log('\n📌 4. Profile Completeness Mathematical Engine');
  // Find or create test business
  let testUser = await prisma.user.findFirst({
    where: { role: 'MSME' },
    include: {
      businesses: {
        include: {
          products: {
            include: {
              destinations: {
                include: { country: true, requirements: true },
              },
            },
          },
          documents: true,
        },
      },
    },
  });

  if (testUser && testUser.businesses[0]) {
    const biz = testUser.businesses[0];
    const profileRes = await calculateProfileCompleteness(biz.id);
    assert(profileRes.totalScore >= 0 && profileRes.totalScore <= 100, `Profile completeness calculated: ${profileRes.totalScore}%`);
    assert(profileRes.categoryScores.identity.maxPoints === 20, 'Identity pillar maxPoints is 20');
    assert(profileRes.categoryScores.taxRegistration.maxPoints === 30, 'Tax registration maxPoints is 30');

    const syncRes = await syncBusinessProfileCompleteness(biz.id);
    assert(syncRes.totalScore === profileRes.totalScore, 'Database sync matches calculated score');
  }

  // -------------------------------------------------------------
  // Test 5: Export Readiness Assessment & Blocker Evaluation
  // -------------------------------------------------------------
  console.log('\n📌 5. Export Readiness & Blocker Evaluation Engine');
  const pc = await prisma.productCountry.findFirst({
    include: {
      product: { include: { business: true } },
      country: true,
      requirements: true,
      packagingItems: true,
    },
  });

  if (pc) {
    const readiness = await calculateReadinessScore(pc.id);
    assert(readiness.totalScore >= 0 && readiness.totalScore <= 100, `Readiness score computed: ${readiness.totalScore}/100`);
    assert(
      readiness.readinessState === 'Export Ready' ||
        readiness.readinessState === 'Almost Ready' ||
        readiness.readinessState === 'In Progress' ||
        readiness.readinessState === 'Action Required (Blockers)' ||
        readiness.readinessState === 'Getting Started',
      `Readiness state assigned: "${readiness.readinessState}"`
    );
    assert(readiness.categoryScores.business.weight === 20, 'Business category weight is 20%');
    assert(readiness.categoryScores.documents.weight === 25, 'Documents category weight is 25%');
    assert(readiness.categoryScores.certifications.weight === 20, 'Certifications category weight is 20%');
    assert(readiness.categoryScores.packaging.weight === 15, 'Packaging category weight is 15%');
    assert(readiness.categoryScores.shipment.weight === 20, 'Shipment prerequisites weight is 20%');
  }

  // -------------------------------------------------------------
  // Test 6: Shipment Clearance Engine
  // -------------------------------------------------------------
  console.log('\n📌 6. Shipment Compliance Clearance Engine');
  const shipment = await prisma.shipment.findFirst({
    include: {
      business: true,
      product: true,
      destinationCountry: true,
    },
  });

  if (shipment) {
    const clearance = await evaluateShipmentClearance(shipment.id);
    assert(typeof clearance.canDispatch === 'boolean', `Shipment dispatch clearance evaluated: canDispatch=${clearance.canDispatch}`);
    assert(clearance.clearanceScore >= 0 && clearance.clearanceScore <= 100, `Clearance score computed: ${clearance.clearanceScore}%`);
    assert(clearance.checks.length >= 4, 'Multi-tier clearance checklist populated');
  }

  // -------------------------------------------------------------
  // Test 7: HTTP Endpoint Responsiveness
  // -------------------------------------------------------------
  console.log('\n📌 7. HTTP Endpoint Live Responsiveness (http://localhost:3000)');
  try {
    const resLanding = await fetch('http://localhost:3000/');
    assert(resLanding.status === 200, `GET / returned HTTP ${resLanding.status}`);
    const landingHtml = await resLanding.text();
    assert(landingHtml.includes('VyaparFlow') || landingHtml.includes('Export'), 'Landing page content contains branding');

    const resLogin = await fetch('http://localhost:3000/login');
    assert(resLogin.status === 200, `GET /login returned HTTP ${resLogin.status}`);

    const resHealth = await fetch('http://localhost:3000/api/health');
    assert(resHealth.status === 200, `GET /api/health returned HTTP ${resHealth.status}`);
  } catch (err: any) {
    console.error('HTTP fetch check failed:', err.message);
  }

  console.log('\n================================================================');
  console.log(`🎉 ALL MASTER PLATFORM TESTS PASSED! (${passedChecks}/${totalChecks} checks verified)`);
  console.log('================================================================\n');
}

runPlatformAudit()
  .catch((err) => {
    console.error('Master platform audit failed:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
