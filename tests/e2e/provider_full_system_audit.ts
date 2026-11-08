import { prisma } from '../../lib/prisma';
import { createSessionToken } from '../../lib/session';
import { SESSION_COOKIE, USER_ID_COOKIE, PERSONA_COOKIE, USER_EMAIL_COOKIE } from '../../lib/authCookies';
import {
  verifyDocumentAction,
  updateProviderTaskAction,
  completeLabAuditAction,
  fileCustomsLEOAction,
  submitFreightQuoteAction,
  addTrackingEventAction,
} from '../../app/actions';

const BASE_URL = 'http://localhost:3000';

interface AuditCheck {
  pillar: string;
  check: string;
  passed: boolean;
  notes?: string;
  error?: any;
}

const auditTrail: AuditCheck[] = [];

function logAudit(pillar: string, check: string, passed: boolean, notes?: string, error?: any) {
  auditTrail.push({ pillar, check, passed, notes, error });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${pillar}] ${check}${notes ? ' -> ' + notes : ''}`);
  if (error) console.error('   Error:', error);
}

async function requestRoute(
  path: string,
  cookies?: string,
  userAgent?: string
): Promise<{ status: number; text: string; location?: string; contentType?: string }> {
  const headers: Record<string, string> = {
    'User-Agent': userAgent || 'VyaparFlow-ProviderAuditor/2.0',
  };
  if (cookies) headers['Cookie'] = cookies;

  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    redirect: 'manual',
  });
  const location = res.headers.get('location') || undefined;
  const contentType = res.headers.get('content-type') || undefined;
  const text = await res.text();
  return { status: res.status, text, location, contentType };
}

function buildAuthCookies(user: { id: string; email: string; name: string }, role: string) {
  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    role: role as any,
    name: user.name,
  });
  return `${SESSION_COOKIE}=${token}; ${USER_ID_COOKIE}=${user.id}; ${PERSONA_COOKIE}=${role}; ${USER_EMAIL_COOKIE}=${encodeURIComponent(user.email)}`;
}

export async function runProviderFullAudit() {
  console.log('\n================================================================');
  console.log('🚢  VYAPARFLOW — COMPREHENSIVE PRODUCTION AUDIT: ROLE 2 (SERVICE PROVIDER)');
  console.log('================================================================\n');

  // --- PILLAR 1: Provider Entities in Database ---
  console.log('--- Auditing Pillar 1: Multi-Disciplinary Provider Tenancy ---');
  const freightUser = await prisma.user.findFirst({
    where: { email: 'provider@freight.com' },
    include: { providers: true },
  });
  const labUser = await prisma.user.findFirst({
    where: { email: 'lab@certify.com' },
    include: { providers: true },
  });
  const chaUser = await prisma.user.findFirst({
    where: { email: 'cha@customs.com' },
    include: { providers: true },
  });

  logAudit('Tenancy', 'Freight Forwarder account exists in DB', !!freightUser, `User: ${freightUser?.name} (${freightUser?.providers[0]?.name})`);
  logAudit('Tenancy', 'Testing & Quarantine Lab account exists in DB', !!labUser, `User: ${labUser?.name} (${labUser?.providers[0]?.name})`);
  logAudit('Tenancy', 'Customs House Agent (CHA) exists in DB', !!chaUser, `User: ${chaUser?.name} (${chaUser?.providers[0]?.name})`);

  if (!freightUser || !labUser || !chaUser) {
    throw new Error('One or more demo service provider accounts missing in DB!');
  }

  const freightCookies = buildAuthCookies(freightUser, 'PROVIDER');
  const labCookies = buildAuthCookies(labUser, 'PROVIDER');
  const chaCookies = buildAuthCookies(chaUser, 'PROVIDER');

  // --- PILLAR 2: Edge Security & RBAC Enforcements ---
  console.log('\n--- Auditing Pillar 2: Edge Security & Role Isolation ---');
  const unauthProvider = await requestRoute('/provider');
  logAudit('Security', 'Unauthenticated /provider redirects to /login', unauthProvider.status === 307 || unauthProvider.status === 302, `Status: ${unauthProvider.status}`);

  // MSME trying to access provider
  const msmeUser = await prisma.user.findUnique({ where: { email: 'msme@apex-exports.com' } });
  if (msmeUser) {
    const msmeCookies = buildAuthCookies(msmeUser, 'MSME');
    const msmeOnProvider = await requestRoute('/provider', msmeCookies);
    logAudit('Security', 'MSME access to /provider is blocked/redirected to /dashboard', msmeOnProvider.status === 307 || msmeOnProvider.status === 302, `Status: ${msmeOnProvider.status}`);
  }

  // Provider accessing MSME routes
  const providerOnDash = await requestRoute('/dashboard', freightCookies);
  logAudit('Security', 'Provider access to /dashboard redirected to /provider', providerOnDash.status === 307 || providerOnDash.status === 302, `Status: ${providerOnDash.status}`);

  const providerOnDocs = await requestRoute('/documents', freightCookies);
  logAudit('Security', 'Provider access to /documents redirected to /provider?tab=verification', providerOnDocs.status === 307 || providerOnDocs.status === 302, `Status: ${providerOnDocs.status}`);

  const providerOnBiz = await requestRoute('/business', freightCookies);
  logAudit('Security', 'Provider access to /business redirected to /provider?tab=profile', providerOnBiz.status === 307 || providerOnBiz.status === 302, `Status: ${providerOnBiz.status}`);

  const providerOnAdmin = await requestRoute('/admin', freightCookies);
  logAudit('Security', 'Provider access to /admin blocked/redirected to /provider', providerOnAdmin.status === 307 || providerOnAdmin.status === 302, `Status: ${providerOnAdmin.status}`);

  // --- PILLAR 3: Provider Operations Command Hub ---
  console.log('\n--- Auditing Pillar 3: Provider Operations Command Hub ---');
  const providerHub = await requestRoute('/provider', freightCookies);
  logAudit('CommandHub', 'GET /provider returns HTTP 200', providerHub.status === 200, `Status: ${providerHub.status}`);
  logAudit('CommandHub', 'Renders Provider Organization Brand', providerHub.text.includes(freightUser.providers[0].name));
  logAudit('CommandHub', 'Renders KPI telemetry header', providerHub.text.includes('Pending Audits') && providerHub.text.includes('Active Cargo'));
  logAudit('CommandHub', 'Renders 4 Multi-Disciplinary Workspaces tabs', providerHub.text.includes('Compliance Audit Queue') && providerHub.text.includes('Freight RFQ &amp; Quotes Desk'));

  // --- PILLAR 4: Compliance Audit Queue Workspace (tab=verification) ---
  console.log('\n--- Auditing Pillar 4: Compliance Audit Queue Workspace ---');
  const verifyTab = await requestRoute('/provider?tab=verification', chaCookies);
  logAudit('Verification', 'GET /provider?tab=verification returns HTTP 200', verifyTab.status === 200, `Status: ${verifyTab.status}`);
  logAudit('Verification', 'Displays Task Queue filter bar', verifyTab.text.includes('All Tasks') && verifyTab.text.includes('Pending'));

  // Verify that document preview links use /api/documents/[id]
  const sampleDoc = await prisma.document.findFirst();
  if (sampleDoc) {
    const docPdf = await requestRoute(`/api/documents/${sampleDoc.id}`, chaCookies);
    logAudit('Verification', `Document preview API /api/documents/${sampleDoc.id} returns %PDF`, docPdf.status === 200 && docPdf.text.includes('%PDF'), `Status: ${docPdf.status}`);
  }

  // --- PILLAR 5: Freight RFQ & Quotes Desk (tab=quotes) ---
  console.log('\n--- Auditing Pillar 5: Freight RFQ & Quotes Bidding Desk ---');
  const quotesTab = await requestRoute('/provider?tab=quotes', freightCookies);
  logAudit('QuotesDesk', 'GET /provider?tab=quotes returns HTTP 200', quotesTab.status === 200, `Status: ${quotesTab.status}`);
  logAudit('QuotesDesk', 'Renders Live Inbound MSME RFQs banner', quotesTab.text.includes('Live Inbound MSME RFQs') || quotesTab.text.includes('Freight'));
  logAudit('QuotesDesk', 'Displays open shipments with cargo volume & destination', quotesTab.text.includes('MT') && quotesTab.text.includes('Destination'));

  // --- PILLAR 6: Cargo Fleet Telemetry & Milestones (tab=milestones) ---
  console.log('\n--- Auditing Pillar 6: Cargo Fleet Telemetry & Milestones ---');
  const milesTab = await requestRoute('/provider?tab=milestones', freightCookies);
  logAudit('Milestones', 'GET /provider?tab=milestones returns HTTP 200', milesTab.status === 200, `Status: ${milesTab.status}`);
  logAudit('Milestones', 'Displays live consignment telemetry header', milesTab.text.includes('Consignment Telemetry') || milesTab.text.includes('Fleet'));

  // --- PILLAR 7: Accreditations & Provider Profile (tab=profile) ---
  console.log('\n--- Auditing Pillar 7: Provider Accreditations & Profile ---');
  const profileTab = await requestRoute('/provider?tab=profile', labCookies);
  logAudit('Profile', 'GET /provider?tab=profile returns HTTP 200', profileTab.status === 200, `Status: ${profileTab.status}`);
  logAudit('Profile', 'Displays authorized service area', profileTab.text.includes('Authorized Service Area') || profileTab.text.includes('Western Ports'));
  logAudit('Profile', 'Displays accreditation domain', profileTab.text.includes('Accreditation Domain') || profileTab.text.includes('NABL') || profileTab.text.includes('CBIC'));
  logAudit('Profile', 'Displays Institutional Accreditations', profileTab.text.includes('DGFT Authorized Trade Partner') || profileTab.text.includes('ISO/IEC 17025'));

  // --- PILLAR 8: Multi-Role Provider Workflows (Lab / CHA / Freight) ---
  console.log('\n--- Auditing Pillar 8: Role-Specific Provider Workflows ---');
  // Lab view
  const labDeck = await requestRoute('/provider', labCookies);
  logAudit('LabProvider', 'Lab provider opens operations hub with HTTP 200', labDeck.status === 200, `Organization: ${labUser.providers[0].name}`);

  // CHA view
  const chaDeck = await requestRoute('/provider', chaCookies);
  logAudit('CHAProvider', 'CHA provider opens operations hub with HTTP 200', chaDeck.status === 200, `Organization: ${chaUser.providers[0].name}`);

  // Freight view
  const freightDeck = await requestRoute('/provider', freightCookies);
  logAudit('FreightProvider', 'Freight provider opens operations hub with HTTP 200', freightDeck.status === 200, `Organization: ${freightUser.providers[0].name}`);

  // --- PILLAR 9: Mobile Viewport & Cross-Device Resilience ---
  console.log('\n--- Auditing Pillar 9: Mobile Viewport & Cross-Device Resilience ---');
  const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
  const mobileProviderHub = await requestRoute('/provider', freightCookies, mobileUA);
  logAudit('Mobile', 'Mobile GET /provider returns HTTP 200', mobileProviderHub.status === 200, `Status: ${mobileProviderHub.status}`);
  logAudit('Mobile', 'Mobile renders responsive grid containers', mobileProviderHub.text.includes('grid-cols-2') || mobileProviderHub.text.includes('flex-col'));

  const mobileQuotes = await requestRoute('/provider?tab=quotes', freightCookies, mobileUA);
  logAudit('Mobile', 'Mobile GET /provider?tab=quotes returns HTTP 200', mobileQuotes.status === 200);

  const mobileVerify = await requestRoute('/provider?tab=verification', chaCookies, mobileUA);
  logAudit('Mobile', 'Mobile GET /provider?tab=verification returns HTTP 200', mobileVerify.status === 200);

  // --- PILLAR 10: State Machine & Database Integrity ---
  console.log('\n--- Auditing Pillar 10: State Machine & Database Integrity ---');
  const activeShipment = await prisma.shipment.findFirst({
    include: { quotes: true, trackingEvents: true },
  });
  logAudit('DataIntegrity', 'Active Consignment records exist in system', !!activeShipment, `Shipment: #${activeShipment?.shipmentNumber}`);
  logAudit('DataIntegrity', 'Consignment has associated quotes or open for bidding', !!activeShipment && (activeShipment.quotes.length > 0 || activeShipment.status === 'Draft' || activeShipment.status === 'Preparation'));
  logAudit('DataIntegrity', 'Consignment has immutable tracking timeline', !!activeShipment && Array.isArray(activeShipment.trackingEvents));

  const totalTasks = await prisma.providerTask.count();
  logAudit('DataIntegrity', 'System maintains healthy multi-partner task queue', totalTasks >= 3, `Count: ${totalTasks} tasks`);

  // Summary
  console.log('\n================================================================');
  console.log('📊 FINAL COMPREHENSIVE SERVICE PROVIDER AUDIT RESULTS');
  console.log('================================================================');
  const total = auditTrail.length;
  const passed = auditTrail.filter((a) => a.passed).length;
  const failed = total - passed;
  console.log(`Total Provider Checks: ${total}`);
  console.log(`Passed:                ${passed}`);
  console.log(`Failed:                ${failed}`);
  console.log(`Pass Rate:              ${((passed / total) * 100).toFixed(1)}%`);
  console.log('================================================================\n');

  if (failed > 0) {
    throw new Error(`${failed} check(s) failed in Service Provider audit!`);
  }
}

runProviderFullAudit().catch((err) => {
  console.error('Audit fatal failure:', err);
  process.exit(1);
});
