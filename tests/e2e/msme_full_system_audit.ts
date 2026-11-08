import { prisma } from '../../lib/prisma';
import { createSessionToken } from '../../lib/session';
import { SESSION_COOKIE, USER_ID_COOKIE, PERSONA_COOKIE, USER_EMAIL_COOKIE } from '../../lib/authCookies';
import { calculateReadinessScore } from '../../lib/services/readiness';
import { fetchGSTDetailsFromSandbox, isValidGstinChecksum } from '../../lib/services/sandboxGst';

const BASE_URL = 'http://localhost:3000';

interface AuditResult {
  category: string;
  item: string;
  passed: boolean;
  notes?: string;
  error?: any;
}

const results: AuditResult[] = [];

function recordCheck(category: string, item: string, passed: boolean, notes?: string, error?: any) {
  results.push({ category, item, passed, notes, error });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${category}] ${item}${notes ? ' -> ' + notes : ''}`);
  if (error) console.error('   Error:', error);
}

async function fetchRoute(urlPath: string, cookies?: string): Promise<{ status: number; text: string; location?: string }> {
  const headers: Record<string, string> = {
    'User-Agent': 'VyaparFlow-SystemAuditor/2.0',
  };
  if (cookies) {
    headers['Cookie'] = cookies;
  }
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    headers,
    redirect: 'manual',
  });
  const location = res.headers.get('location') || undefined;
  const text = await res.text();
  return { status: res.status, text, location };
}

export async function runFullMSMESystemAudit() {
  console.log('\n================================================================');
  console.log('🏛️  VYAPARFLOW — COMPREHENSIVE PRODUCTION AUDIT: ROLE 1 (MSME)');
  console.log('================================================================\n');

  // --- PILLAR 1: User & Business Tenancy ---
  const msmeUser = await prisma.user.findUnique({
    where: { email: 'msme@apex-exports.com' },
    include: {
      businesses: {
        include: {
          products: {
            include: {
              category: true,
              destinations: { include: { country: true, requirements: true, packagingItems: true } },
            },
          },
        },
      },
    },
  });

  if (!msmeUser || !msmeUser.businesses || msmeUser.businesses.length === 0) {
    throw new Error('MSME demo exporter not found in database!');
  }

  const business = msmeUser.businesses[0];
  const product = business.products[0];
  const destination = product?.destinations[0];

  recordCheck('Tenancy', 'MSME User identified in Supabase DB', true, `Name: ${msmeUser.name}, Email: ${msmeUser.email}`);
  recordCheck('Tenancy', 'Business record bound to user', true, `Legal: ${business.legalName}, Trade: ${business.displayName}`);
  recordCheck('Tenancy', 'Export product configured', !!product, `Product: ${product?.name}, HS: ${product?.hsCode}`);
  recordCheck('Tenancy', 'Export destination corridor mapped', !!destination, `Corridor: ${destination?.country?.name} (${destination?.country?.isoCode})`);

  // Create Cryptographic Session Header
  const token = createSessionToken({
    userId: msmeUser.id,
    email: msmeUser.email,
    role: 'MSME',
    name: msmeUser.name,
  });
  const authCookies = `${SESSION_COOKIE}=${token}; ${USER_ID_COOKIE}=${msmeUser.id}; ${PERSONA_COOKIE}=MSME; ${USER_EMAIL_COOKIE}=${encodeURIComponent(msmeUser.email)}`;

  // --- PILLAR 2: Route Protection & Edge RBAC ---
  console.log('\n--- Auditing Pillar 2: Security & Edge RBAC ---');
  const unauthRes = await fetchRoute('/dashboard');
  recordCheck('Security', 'Unauthenticated /dashboard redirects to /login', unauthRes.status === 307 || unauthRes.status === 302, `Status: ${unauthRes.status}`);

  const adminRes = await fetchRoute('/admin', authCookies);
  recordCheck('Security', 'MSME access to /admin is blocked/redirected', adminRes.status === 307 || adminRes.status === 302, `Status: ${adminRes.status}`);

  const providerRes = await fetchRoute('/provider', authCookies);
  recordCheck('Security', 'MSME access to /provider is blocked/redirected', providerRes.status === 307 || providerRes.status === 302, `Status: ${providerRes.status}`);

  // --- PILLAR 3: Exporter Dashboard (/dashboard) ---
  console.log('\n--- Auditing Pillar 3: Exporter Dashboard Layout & Widgets ---');
  const dash = await fetchRoute('/dashboard', authCookies);
  recordCheck('Dashboard', 'GET /dashboard returns HTTP 200', dash.status === 200, `Status: ${dash.status}`);
  recordCheck('Dashboard', 'Company Brand Name rendered', dash.text.includes(business.displayName) || dash.text.includes('Apex Quality Agro Exporters'));
  recordCheck('Dashboard', 'Target Corridor Badge rendered', dash.text.includes('Netherlands') || dash.text.includes('NL'));
  recordCheck('Dashboard', 'Readiness Score Summary rendered', dash.text.includes('Export Readiness') || dash.text.includes('/ 100'));
  recordCheck('Dashboard', 'Active Shipment Card rendered', dash.text.includes('Shipment') || dash.text.includes('JNPT'));
  recordCheck('Dashboard', 'Quick Access Actions rendered (6 cards)', dash.text.includes('Documents') && dash.text.includes('Certifications') && dash.text.includes('Packaging'));
  recordCheck('Dashboard', 'Tariff Intelligence Card rendered', dash.text.includes('Tariff') || dash.text.includes('Duty') || dash.text.includes('HS'));
  recordCheck('Dashboard', 'App Navigation contains Products & Markets', dash.text.includes('Products &amp; Markets') || dash.text.includes('Products & Markets'));

  // --- PILLAR 4: Export Readiness Engine (/readiness) ---
  console.log('\n--- Auditing Pillar 4: Export Readiness Mathematical Engine ---');
  const readyPage = await fetchRoute('/readiness', authCookies);
  recordCheck('Readiness', 'GET /readiness returns HTTP 200', readyPage.status === 200, `Status: ${readyPage.status}`);
  recordCheck('Readiness', 'Displays composite readiness score index', readyPage.text.includes('Overall Index') || readyPage.text.includes('/ 100'));
  recordCheck('Readiness', 'Displays 5 category weights (20%, 25%, 20%, 15%, 20%)', readyPage.text.includes('20% Weight') && readyPage.text.includes('25% Weight') && readyPage.text.includes('15% Weight'));
  recordCheck('Readiness', 'Displays compliance checklist', readyPage.text.includes('Checklist') || readyPage.text.includes('Requirements'));

  const mathScore = await calculateReadinessScore(destination.id);
  recordCheck('Readiness', 'Direct calculation completes without exception', mathScore.totalScore >= 0 && mathScore.totalScore <= 100, `Calculated: ${mathScore.totalScore}/100 (${mathScore.readinessState})`);
  recordCheck('Readiness', 'Explainable breakdown has all 5 pillars', !!mathScore.categoryScores.business && !!mathScore.categoryScores.documents && !!mathScore.categoryScores.certifications && !!mathScore.categoryScores.packaging && !!mathScore.categoryScores.shipment);

  // --- PILLAR 5: Statutory Documents Dossier (/documents) ---
  console.log('\n--- Auditing Pillar 5: Statutory Documents & PDF Vault ---');
  const docPage = await fetchRoute('/documents', authCookies);
  recordCheck('Documents', 'GET /documents returns HTTP 200', docPage.status === 200, `Status: ${docPage.status}`);
  recordCheck('Documents', 'Enterprise document upload component rendered', docPage.text.includes('EnterpriseDocumentUpload') || docPage.text.includes('Upload'));
  recordCheck('Documents', 'Document dossier listing rendered', docPage.text.includes('Dossier') || docPage.text.includes('Compliance Document Dossier'));

  // Check document PDF download
  const sampleDoc = await prisma.document.findFirst({ where: { businessId: business.id } });
  if (sampleDoc) {
    const docFileRes = await fetchRoute(`/api/documents/${sampleDoc.id}`, authCookies);
    recordCheck('Documents', `Download API /api/documents/${sampleDoc.id} returns PDF`, docFileRes.status === 200 && docFileRes.text.includes('%PDF'), `Status: ${docFileRes.status}`);
  }

  // Check Commercial Invoice Generator
  const invoiceRes = await fetchRoute(`/api/export-documents/invoice?businessId=${business.id}`, authCookies);
  recordCheck('Documents', 'Commercial Invoice PDF Generator returns HTTP 200 (%PDF)', invoiceRes.status === 200 && invoiceRes.text.includes('%PDF'), `Status: ${invoiceRes.status}`);

  // Check Packing List Generator
  const packRes = await fetchRoute(`/api/export-documents/packing-list?businessId=${business.id}`, authCookies);
  recordCheck('Documents', 'Packing List PDF Generator returns HTTP 200 (%PDF)', packRes.status === 200 && packRes.text.includes('%PDF'), `Status: ${packRes.status}`);

  // --- PILLAR 6: Certifications Hub (/certifications) ---
  console.log('\n--- Auditing Pillar 6: Product Certifications & Laboratory Booking ---');
  const certPage = await fetchRoute('/certifications', authCookies);
  recordCheck('Certifications', 'GET /certifications returns HTTP 200', certPage.status === 200, `Status: ${certPage.status}`);
  recordCheck('Certifications', 'Renders certification requirements', certPage.text.includes('Certifications Hub') || certPage.text.includes('Phytosanitary') || certPage.text.includes('FSSAI'));
  recordCheck('Certifications', 'Renders partner testing laboratory bodies', certPage.text.includes('Accredited') || certPage.text.includes('Apex Quality') || certPage.text.includes('providerId'));

  // --- PILLAR 7: Packaging & Labelling Compliance (/packaging) ---
  console.log('\n--- Auditing Pillar 7: Export Packaging & Labelling ---');
  const pkgPage = await fetchRoute('/packaging', authCookies);
  recordCheck('Packaging', 'GET /packaging returns HTTP 200', pkgPage.status === 200, `Status: ${pkgPage.status}`);
  recordCheck('Packaging', 'Displays packaging and labelling checkpoints', pkgPage.text.includes('Checklist') || pkgPage.text.includes('ISPM') || pkgPage.text.includes('Label'));
  recordCheck('Packaging', 'Displays prototype disclaimer banner', pkgPage.text.includes('PROTOTYPE RULE DISCLAIMER'));

  // --- PILLAR 8: Shipment Hub, Freight Quotes & Tracking (/shipments) ---
  console.log('\n--- Auditing Pillar 8: Shipment Execution & Freight Orchestration ---');
  const shipPage = await fetchRoute('/shipments', authCookies);
  recordCheck('Shipments', 'GET /shipments returns HTTP 200', shipPage.status === 200, `Status: ${shipPage.status}`);
  recordCheck('Shipments', 'Displays Create New Shipment form', shipPage.text.includes('Create New Shipment'));
  recordCheck('Shipments', 'Displays Active Shipments list', shipPage.text.includes('Active &amp; Historical Shipments') || shipPage.text.includes('Active & Historical Shipments'));

  const activeShipment = await prisma.shipment.findFirst({
    where: { businessId: business.id },
    include: { quotes: true, trackingEvents: true },
  });

  if (activeShipment) {
    const quotesPage = await fetchRoute(`/shipments/${activeShipment.id}/quotes`, authCookies);
    recordCheck('Shipments', `Multi-carrier quotes page /shipments/${activeShipment.id}/quotes returns HTTP 200`, quotesPage.status === 200, `Status: ${quotesPage.status}`);
    recordCheck('Shipments', 'Displays freight options (Sea/Air/Express)', quotesPage.text.includes('Sea Freight') || quotesPage.text.includes('Air Cargo') || quotesPage.text.includes('SwiftGlobe'));

    const trackPage = await fetchRoute(`/shipments/${activeShipment.id}/tracking`, authCookies);
    recordCheck('Shipments', `Tracking timeline page /shipments/${activeShipment.id}/tracking returns HTTP 200`, trackPage.status === 200, `Status: ${trackPage.status}`);
    recordCheck('Shipments', 'Displays milestone timeline events', trackPage.text.includes('Milestones') || trackPage.text.includes('Chronological'));
  }

  // --- PILLAR 9: Business Profile & GSTIN Verification (/business) ---
  console.log('\n--- Auditing Pillar 9: Business Profile & GSTIN Engine ---');
  const bizPage = await fetchRoute('/business', authCookies);
  recordCheck('Business', 'GET /business returns HTTP 200', bizPage.status === 200, `Status: ${bizPage.status}`);
  recordCheck('Business', 'Displays legal registered entity name', bizPage.text.includes(business.legalName) || bizPage.text.includes(business.legalName.replace(/&/g, '&amp;')));
  recordCheck('Business', 'Displays profile completeness indicator', bizPage.text.includes('Profile Readiness') || bizPage.text.includes('Profile Completeness') || bizPage.text.includes('Completeness'));
  recordCheck('Business', 'Renders GSTIN registration block with verify button', bizPage.text.includes('GSTIN Registration') && bizPage.text.includes('Verify &amp; Fetch GST Details'));
  recordCheck('Business', 'Renders DGFT IEC code registration block', bizPage.text.includes('DGFT Import Export Code'));

  // --- PILLAR 10: Products & Corridors Setup (/products) ---
  console.log('\n--- Auditing Pillar 10: Product Catalog & Market Setup ---');
  const prodPage = await fetchRoute('/products', authCookies);
  recordCheck('Products', 'GET /products returns HTTP 200', prodPage.status === 200, `Status: ${prodPage.status}`);
  recordCheck('Products', 'Displays product cards with HS codes', prodPage.text.includes(product.name) && prodPage.text.includes(product.hsCode));
  recordCheck('Products', 'Displays target destination countries', prodPage.text.includes('Netherlands') || prodPage.text.includes('NL'));
  recordCheck('Products', 'Displays Update Destination Market button', prodPage.text.includes('Update Destination Market') || prodPage.text.includes('Manage Profile'));

  // --- PILLAR 11: Real-time GST Verification Exhaustive Matrix ---
  console.log('\n--- Auditing Pillar 11: GST Verification Matrix & Anti-AAT Check ---');
  const testGstMatrix = [
    { gstin: '27AAACP1234F1Z5', desc: 'Apex Agro Preset Exporter (Maharashtra)', expectedCompany: 'Apex Agro Processing & Exports Private Limited' },
    { gstin: '27AABCA1234F1Z8', desc: 'Allana Sons (Maharashtra Agri/Food)', expectedCompany: 'Allana Sons Private Limited' },
    { gstin: '27AAACE1234F1Z4', desc: 'Everest Food Products (Mumbai Spices)', expectedCompany: 'Everest Food Products Private Limited' },
    { gstin: '07AAACM1234F1Z2', desc: 'MDH Spices (New Delhi)', expectedCompany: 'Mahashian Di Hatti Private Limited' },
    { gstin: '24AABCG1234F1Z3', desc: 'Amul / GCMMF (Anand Gujarat)', expectedCompany: 'Gujarat Cooperative Milk Marketing Federation Limited' },
    { gstin: '19AABCI1234F1Z0', desc: 'ITC Limited (Kolkata WB)', expectedCompany: 'ITC Limited (Agri-Business Division)' },
    { gstin: '27AATFA1234F1Z5', desc: 'Custom Arbitrary GSTIN (Maharashtra LLP)', prohibited: 'AAT Industries' },
    { gstin: '24AAACA4321F1Z6', desc: 'Arvind Limited (Ahmedabad Gujarat)', expectedCompany: 'Arvind Limited' },
    { gstin: '27AAAPA5555F1Z2', desc: 'Patil Agro Fresh Enterprises (Proprietor)', expectedCompany: 'Patil Agro Fresh Enterprises' },
  ];

  for (const item of testGstMatrix) {
    const res = await fetchGSTDetailsFromSandbox(item.gstin);
    const legalName = res.data?.legalName || '';
    const hasAatBug = legalName.includes('AAT Industries');
    const isValid = res.success && legalName.length > 5 && !hasAatBug;

    if (item.expectedCompany) {
      recordCheck('GST-Matrix', `Lookup [${item.gstin}] ${item.desc}`, legalName.includes(item.expectedCompany), `Returned: "${legalName}"`);
    } else {
      recordCheck('GST-Matrix', `Lookup [${item.gstin}] ${item.desc}`, isValid, `Returned: "${legalName}" | Zero "AAT Industries" bug`);
    }
  }

  // Test invalid GSTIN handling
  const invalidRes = await fetchRoute('/api/gst/verify?gstin=INVALID123');
  recordCheck('GST-Matrix', 'Invalid GSTIN rejected with HTTP 400', invalidRes.status === 400, `Status: ${invalidRes.status}`);

  // Summary
  console.log('\n================================================================');
  console.log('📊 FINAL COMPREHENSIVE MSME AUDIT RESULTS');
  console.log('================================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`Total System Checks: ${total}`);
  console.log(`Passed:              ${passed}`);
  console.log(`Failed:              ${failed}`);
  console.log(`Pass Rate:            ${((passed / total) * 100).toFixed(1)}%`);
  console.log('================================================================\n');

  if (failed > 0) {
    throw new Error(`${failed} check(s) failed in MSME system audit!`);
  }
}

runFullMSMESystemAudit().catch((err) => {
  console.error('Audit encountered a fatal error:', err);
  process.exit(1);
});
