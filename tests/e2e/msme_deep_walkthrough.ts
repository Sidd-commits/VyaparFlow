import { prisma } from '../../lib/prisma';
import { createSessionToken } from '../../lib/session';
import { SESSION_COOKIE, USER_ID_COOKIE, PERSONA_COOKIE, USER_EMAIL_COOKIE } from '../../lib/authCookies';

const BASE_URL = 'http://localhost:3000';

interface StepResult {
  section: string;
  check: string;
  passed: boolean;
  details?: string;
  error?: any;
}

const auditLog: StepResult[] = [];

function logCheck(section: string, check: string, passed: boolean, details?: string, error?: any) {
  auditLog.push({ section, check, passed, details, error });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${section}] ${check}${details ? ' -> ' + details : ''}`);
  if (error) console.error('   Error:', error);
}

async function fetchWithAuth(urlPath: string, cookies: string): Promise<{ status: number; text: string; location?: string }> {
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    headers: {
      Cookie: cookies,
      'User-Agent': 'MSME-Auditor/1.0',
    },
    redirect: 'manual',
  });
  const location = res.headers.get('location') || undefined;
  const text = await res.text();
  return { status: res.status, text, location };
}

export async function runMsmeDeepAudit() {
  console.log('\n================================================================');
  console.log('🔍 VYAPARFLOW — DEEP MSME EXPORTER AUDIT & FUNCTIONAL TEST');
  console.log('================================================================\n');

  // 1. Identify MSME Exporter 1
  const msmeEmail = 'msme@apex-exports.com';
  const msmeUser = await prisma.user.findUnique({
    where: { email: msmeEmail },
    include: {
      businesses: {
        include: {
          products: {
            include: {
              destinations: { include: { country: true } },
            },
          },
        },
      },
    },
  });

  if (!msmeUser) {
    throw new Error(`MSME demo account (${msmeEmail}) not found in database!`);
  }

  const business = msmeUser.businesses[0];
  const product = business?.products[0];
  const destination = product?.destinations[0];

  logCheck('Setup', 'Found MSME user & business in database', true, `User: ${msmeUser.name}, Business: ${business?.displayName}`);

  // Create cryptographic session token
  const sessionToken = createSessionToken({
    userId: msmeUser.id,
    email: msmeUser.email,
    role: 'MSME',
    name: msmeUser.name,
  });

  const cookieHeader = `${SESSION_COOKIE}=${sessionToken}; ${USER_ID_COOKIE}=${msmeUser.id}; ${PERSONA_COOKIE}=MSME; ${USER_EMAIL_COOKIE}=${encodeURIComponent(msmeUser.email)}`;

  // ==========================================
  // SECTION 1: DASHBOARD (/dashboard)
  // ==========================================
  console.log('\n--- Auditing 1: MSME Exporter Dashboard ---');
  try {
    const dashRes = await fetchWithAuth('/dashboard', cookieHeader);
    logCheck('Dashboard', 'GET /dashboard returns HTTP 200', dashRes.status === 200, `Status: ${dashRes.status}`);

    const hasBrand = dashRes.text.includes(business.displayName) || dashRes.text.includes('Apex Quality Agro Exporters');
    logCheck('Dashboard', 'Header displays Company Display Name', hasBrand, `Expected: ${business.displayName}`);

    const hasDestination = dashRes.text.includes('Netherlands') || dashRes.text.includes('NL');
    logCheck('Dashboard', 'Header displays Target Export Corridor', hasDestination);

    const hasReadiness = dashRes.text.includes('Export Readiness') || dashRes.text.includes('readiness');
    logCheck('Dashboard', 'Renders Export Readiness summary card', hasReadiness);

    const hasAttention = dashRes.text.includes('attention') || dashRes.text.includes('Action Required') || dashRes.text.includes('Blocker');
    logCheck('Dashboard', 'Renders Attention / Action Queue section', hasAttention);

    const hasShipment = dashRes.text.includes('Shipment') || dashRes.text.includes('SHP-2026');
    logCheck('Dashboard', 'Renders Active Shipment tracking card', hasShipment);

    const hasTariff = dashRes.text.includes('Tariff') || dashRes.text.includes('Duty') || dashRes.text.includes('MFN');
    logCheck('Dashboard', 'Renders Indicative Tariff intelligence', hasTariff);
  } catch (err: any) {
    logCheck('Dashboard', 'Dashboard audit failed', false, err.message, err);
  }

  // ==========================================
  // SECTION 2: READINESS SCORE (/readiness)
  // ==========================================
  console.log('\n--- Auditing 2: Export Readiness Assessment Engine ---');
  try {
    const readyRes = await fetchWithAuth('/readiness', cookieHeader);
    logCheck('Readiness', 'GET /readiness returns HTTP 200', readyRes.status === 200, `Status: ${readyRes.status}`);

    const hasScoreIndex = readyRes.text.includes('/ 100') || readyRes.text.includes('Overall Index');
    logCheck('Readiness', 'Displays composite overall score index', hasScoreIndex);

    const hasWeights = readyRes.text.includes('20% Weight') && readyRes.text.includes('25% Weight') && readyRes.text.includes('15% Weight');
    logCheck('Readiness', 'Displays explainable 5 category weight breakdown', hasWeights);

    const hasChecklist = readyRes.text.includes('Checklist') || readyRes.text.includes('Requirements');
    logCheck('Readiness', 'Displays statutory compliance checklist', hasChecklist);
  } catch (err: any) {
    logCheck('Readiness', 'Readiness audit failed', false, err.message, err);
  }

  // ==========================================
  // SECTION 3: DOCUMENTS DOSSIER (/documents)
  // ==========================================
  console.log('\n--- Auditing 3: Statutory Document Management ---');
  try {
    const docRes = await fetchWithAuth('/documents', cookieHeader);
    logCheck('Documents', 'GET /documents returns HTTP 200', docRes.status === 200, `Status: ${docRes.status}`);

    const hasUpload = docRes.text.includes('Upload') || docRes.text.includes('EnterpriseDocumentUpload');
    logCheck('Documents', 'Renders Enterprise Document Upload component', hasUpload);

    const hasDossier = docRes.text.includes('Dossier') || docRes.text.includes('Compliance Document Dossier');
    logCheck('Documents', 'Renders Document Dossier listing', hasDossier);

    // Check if any document exists
    const doc = await prisma.document.findFirst({
      where: { businessId: business.id },
    });
    if (doc) {
      const viewerRes = await fetchWithAuth(`/api/documents/${doc.id}`, cookieHeader);
      const isPdf = viewerRes.status === 200 && viewerRes.text.includes('%PDF');
      logCheck('Documents', `Document PDF download API (/api/documents/${doc.id})`, isPdf, `Status: ${viewerRes.status}`);
    } else {
      logCheck('Documents', 'Sample document exists in business vault', false, 'No document found');
    }
  } catch (err: any) {
    logCheck('Documents', 'Documents audit failed', false, err.message, err);
  }

  // ==========================================
  // SECTION 4: CERTIFICATIONS HUB (/certifications)
  // ==========================================
  console.log('\n--- Auditing 4: Product Certifications & Lab Testing ---');
  try {
    const certRes = await fetchWithAuth('/certifications', cookieHeader);
    logCheck('Certifications', 'GET /certifications returns HTTP 200', certRes.status === 200, `Status: ${certRes.status}`);

    const hasHub = certRes.text.includes('Certifications Hub') || certRes.text.includes('Phytosanitary') || certRes.text.includes('Laboratory');
    logCheck('Certifications', 'Displays certification requirements with accredited bodies', hasHub);

    const hasLabs = certRes.text.includes('Apex Quality Labs') || certRes.text.includes('providerId');
    logCheck('Certifications', 'Displays lab assignment dropdown and request action', hasLabs);
  } catch (err: any) {
    logCheck('Certifications', 'Certifications audit failed', false, err.message, err);
  }

  // ==========================================
  // SECTION 5: PACKAGING & LABELLING (/packaging)
  // ==========================================
  console.log('\n--- Auditing 5: Packaging & Labelling Compliance ---');
  try {
    const pkgRes = await fetchWithAuth('/packaging', cookieHeader);
    logCheck('Packaging', 'GET /packaging returns HTTP 200', pkgRes.status === 200, `Status: ${pkgRes.status}`);

    const hasChecklist = pkgRes.text.includes('Packaging & Labelling') || pkgRes.text.includes('ISPM');
    logCheck('Packaging', 'Displays container sealing, palletization, and labelling checklist', hasChecklist);

    const hasCorridorSwitch = pkgRes.text.includes('Switch Target Destination') || pkgRes.text.includes('/packaging?destId=');
    logCheck('Packaging', 'Supports switching target destination corridor', hasCorridorSwitch);
  } catch (err: any) {
    logCheck('Packaging', 'Packaging audit failed', false, err.message, err);
  }

  // ==========================================
  // SECTION 6: SHIPMENT HUB & DISPATCH (/shipments)
  // ==========================================
  console.log('\n--- Auditing 6: Shipment Execution & Dispatch Center ---');
  try {
    const shipRes = await fetchWithAuth('/shipments', cookieHeader);
    logCheck('Shipments', 'GET /shipments returns HTTP 200', shipRes.status === 200, `Status: ${shipRes.status}`);

    const hasCreateForm = shipRes.text.includes('Create New Shipment') || shipRes.text.includes('destinationCountryId');
    logCheck('Shipments', 'Displays Create New Shipment form', hasCreateForm);

    // Check active shipment link
    const activeShip = await prisma.shipment.findFirst({
      where: { businessId: business.id },
      include: { trackingEvents: true },
    });
    if (activeShip) {
      logCheck('Shipments', 'Active demo shipment found in DB', true, `Code: ${activeShip.shipmentNumber}`);

      // Check tracking page
      const trackRes = await fetchWithAuth(`/shipments/${activeShip.id}/tracking`, cookieHeader);
      logCheck('Shipments', `Tracking page GET /shipments/${activeShip.id}/tracking`, trackRes.status === 200, `Status: ${trackRes.status}`);

      // Check quotes page
      const quoteRes = await fetchWithAuth(`/shipments/${activeShip.id}/quotes`, cookieHeader);
      logCheck('Shipments', `Quotes page GET /shipments/${activeShip.id}/quotes`, quoteRes.status === 200, `Status: ${quoteRes.status}`);
    } else {
      logCheck('Shipments', 'Active demo shipment found in DB', false, 'None found');
    }
  } catch (err: any) {
    logCheck('Shipments', 'Shipments audit failed', false, err.message, err);
  }

  // ==========================================
  // SECTION 7: COMPANY PROFILE & SETTINGS (/business)
  // ==========================================
  console.log('\n--- Auditing 7: Company Profile & Government Registrations ---');
  try {
    const bizRes = await fetchWithAuth('/business', cookieHeader);
    logCheck('Business', 'GET /business returns HTTP 200', bizRes.status === 200, `Status: ${bizRes.status}`);

    const hasLegalName = bizRes.text.includes(business.legalName) || bizRes.text.includes('Apex Agro Processing');
    logCheck('Business', 'Displays legal registered business name', hasLegalName, `Legal Name: ${business.legalName}`);

    const hasEditModal = bizRes.text.includes('Edit Company Details') || bizRes.text.includes('EditCompanyProfileModal');
    logCheck('Business', 'Renders Edit Company Details interactive modal', hasEditModal);

    const hasGstForm = bizRes.text.includes('GSTIN Registration') || bizRes.text.includes('gstNumber');
    logCheck('Business', 'Renders GSTIN & IEC registration form', hasGstForm);

    const hasLookupButton = bizRes.text.includes('Fetch GST Details') || bizRes.text.includes('GSTLookupButton');
    logCheck('Business', 'Renders real-time GST Lookup button', hasLookupButton);
  } catch (err: any) {
    logCheck('Business', 'Business profile audit failed', false, err.message, err);
  }

  // ==========================================
  // SECTION 8: PRODUCTS & CORRIDORS (/products)
  // ==========================================
  console.log('\n--- Auditing 8: Export Products & Destination Markets ---');
  try {
    const prodRes = await fetchWithAuth('/products', cookieHeader);
    logCheck('Products', 'GET /products returns HTTP 200', prodRes.status === 200, `Status: ${prodRes.status}`);

    const hasProductCard = prodRes.text.includes(product?.name || 'Processed Food') || prodRes.text.includes('HS Code');
    logCheck('Products', 'Displays product card with HS code & category', hasProductCard, `Product: ${product?.name}`);

    const hasDestCountry = prodRes.text.includes('Netherlands') || prodRes.text.includes(destination?.country.name || 'NL');
    logCheck('Products', 'Displays mapped destination market', hasDestCountry);
  } catch (err: any) {
    logCheck('Products', 'Products audit failed', false, err.message, err);
  }

  // ==========================================
  // SECTION 9: GST API VERIFICATION CHECK (/api/gst/verify)
  // ==========================================
  console.log('\n--- Auditing 9: GST Verification API Analysis ---');
  const testGstins = [
    { gstin: '27AAACP1234F1Z5', desc: 'Apex Agro Preset GSTIN' },
    { gstin: '27AATFA1234F1Z5', desc: 'User custom GSTIN (Maharashtra AATF)' },
    { gstin: '24AAACA1234F1Z9', desc: 'Gujarat Company GSTIN' },
    { gstin: '07AAACA1234F1Z9', desc: 'Delhi Company GSTIN' },
    { gstin: 'INVALID_GSTIN_123', desc: 'Invalid GSTIN' },
  ];

  for (const item of testGstins) {
    try {
      const res = await fetch(`${BASE_URL}/api/gst/verify?gstin=${item.gstin}`);
      const json = await res.json();
      console.log(`  GSTIN [${item.gstin}] (${item.desc}): Status ${res.status}`);
      console.log('    -> Legal Name:', json.data?.legalName || json.error);
      console.log('    -> Trade Name:', json.data?.tradeName || 'N/A');
      console.log('    -> Source:', json.data?.source || 'N/A');
    } catch (err: any) {
      console.error(`  GSTIN [${item.gstin}] failed:`, err.message);
    }
  }

  // Summary
  console.log('\n================================================================');
  console.log('📊 MSME EXPORTER AUDIT SUMMARY');
  console.log('================================================================');
  const total = auditLog.length;
  const passed = auditLog.filter(l => l.passed).length;
  const failed = total - passed;
  console.log(`Total checks: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('================================================================\n');
}

runMsmeDeepAudit().catch(console.error);
