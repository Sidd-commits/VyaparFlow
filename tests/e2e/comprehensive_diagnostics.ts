import { prisma } from '../../lib/prisma';
import { hashPassword } from '../../lib/crypto';
import { USER_ID_COOKIE, PERSONA_COOKIE, USER_EMAIL_COOKIE, USER_NAME_COOKIE } from '../../lib/authCookies';

const BASE_URL = 'http://localhost:3000';

interface DiagResult {
  step: string;
  success: boolean;
  status?: number;
  details?: string;
  error?: any;
}

const results: DiagResult[] = [];

function record(step: string, success: boolean, details?: string, status?: number, error?: any) {
  results.push({ step, success, details, status, error });
  const icon = success ? '✅' : '❌';
  console.log(`${icon} [${status ?? 'N/A'}] ${step}: ${details || (success ? 'OK' : 'FAILED')}`);
  if (error) {
    console.error('   Error details:', error);
  }
}

async function fetchRoute(route: string, cookies: Record<string, string> = {}): Promise<{ status: number; text: string; location?: string }> {
  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('; ');

  const res = await fetch(`${BASE_URL}${route}`, {
    method: 'GET',
    headers: {
      Cookie: cookieHeader,
    },
    redirect: 'manual',
  });

  const location = res.headers.get('location') || undefined;
  const text = await res.text();
  return { status: res.status, text, location };
}

async function main() {
  console.log('================================================================');
  console.log('🔍 VYAPARFLOW COMPREHENSIVE RUNTIME & FUNCTIONAL DIAGNOSTICS');
  console.log('================================================================\n');

  // 1. Unauthenticated Public Page Checks
  console.log('--- Phase 1: Unauthenticated Public Page Checks ---');
  try {
    const landing = await fetchRoute('/');
    record('Landing Page (GET /)', landing.status === 200, `Length: ${landing.text.length} chars`, landing.status);

    const login = await fetchRoute('/login');
    record('Login Page (GET /login)', login.status === 200, `Length: ${login.text.length} chars`, login.status);

    const onboardingUnauth = await fetchRoute('/onboarding');
    record('Onboarding Unauth (GET /onboarding)', onboardingUnauth.status === 307 || onboardingUnauth.status === 302 || onboardingUnauth.status === 200, `Redirects to ${onboardingUnauth.location || 'rendered'}`, onboardingUnauth.status);

    const dashboardUnauth = await fetchRoute('/dashboard');
    record('Dashboard Unauth (GET /dashboard)', dashboardUnauth.status === 307 || dashboardUnauth.status === 302 || dashboardUnauth.status === 200, `Redirects to ${dashboardUnauth.location || 'rendered'}`, dashboardUnauth.status);

    const adminUnauth = await fetchRoute('/admin');
    record('Admin Unauth (GET /admin)', adminUnauth.status === 307 || adminUnauth.status === 302 || adminUnauth.status === 403, `Redirects to ${adminUnauth.location || 'denied'}`, adminUnauth.status);
  } catch (err: any) {
    record('Public routes fetch', false, err.message, undefined, err);
  }

  // 2. Database & Seed Verification
  console.log('\n--- Phase 2: Database Integrity & Seed Entities ---');
  let msmeUser: any = null;
  let providerUser: any = null;
  let adminUser: any = null;

  try {
    const userCount = await prisma.user.count();
    const businessCount = await prisma.business.count();
    const productCount = await prisma.product.count();
    const countryCount = await prisma.country.count();
    const ruleCount = await prisma.rule.count();
    const requirementCount = await prisma.requirement.count();
    const shipmentCount = await prisma.shipment.count();
    const providerCount = await prisma.provider.count();

    console.log(`Database Statistics:
    - Users: ${userCount}
    - Businesses: ${businessCount}
    - Products: ${productCount}
    - Countries: ${countryCount}
    - Rules: ${ruleCount}
    - Requirements: ${requirementCount}
    - Shipments: ${shipmentCount}
    - Providers: ${providerCount}`);

    record('Database connectivity & entity count', userCount > 0 && countryCount > 0, `Users: ${userCount}, Countries: ${countryCount}, Rules: ${ruleCount}`);

    msmeUser = await prisma.user.findFirst({
      where: { role: 'MSME' },
      include: { businesses: { include: { products: { include: { destinations: { include: { country: true } } } } } } }
    });

    providerUser = await prisma.user.findFirst({
      where: { role: 'PROVIDER' },
      include: { providers: true }
    });

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vyaparflow.com';
    adminUser = await prisma.user.findFirst({
      where: { email: adminEmail }
    });

    record('MSME Test User Found', !!msmeUser, msmeUser ? `Email: ${msmeUser.email}, Businesses: ${msmeUser.businesses?.length}` : 'Not found');
    record('Provider Test User Found', !!providerUser, providerUser ? `Email: ${providerUser.email}` : 'Not found');
    record('Admin Test User Found', !!adminUser, adminUser ? `Email: ${adminUser.email}` : 'Not found');
  } catch (err: any) {
    record('Database check', false, err.message, undefined, err);
  }

  // 3. Authenticated MSME User Session & Page Checks
  if (msmeUser) {
    console.log('\n--- Phase 3: Authenticated MSME User Page Checks ---');
    const msmeCookies = {
      [USER_ID_COOKIE]: msmeUser.id,
      [USER_EMAIL_COOKIE]: msmeUser.email,
      [USER_NAME_COOKIE]: msmeUser.name,
      [PERSONA_COOKIE]: 'MSME',
    };

    const routesToCheck = [
      '/dashboard',
      '/business',
      '/readiness',
      '/documents',
      '/shipments',
      '/packaging',
      '/certifications',
      '/products',
    ];

    for (const route of routesToCheck) {
      try {
        const res = await fetchRoute(route, msmeCookies);
        const isSuccess = res.status === 200 || (res.status >= 300 && res.status < 400 && !res.text.includes('Internal Server Error'));
        record(`MSME Route (GET ${route})`, isSuccess && !res.text.includes('Application error: a client-side exception') && !res.text.includes('Unhandled Runtime Error'), `Status: ${res.status}, Length: ${res.text.length}`, res.status);
      } catch (err: any) {
        record(`MSME Route (GET ${route})`, false, err.message, undefined, err);
      }
    }
  }

  // 4. Authenticated Provider User Session & Page Checks
  if (providerUser) {
    console.log('\n--- Phase 4: Authenticated Provider User Page Checks ---');
    const providerCookies = {
      [USER_ID_COOKIE]: providerUser.id,
      [USER_EMAIL_COOKIE]: providerUser.email,
      [USER_NAME_COOKIE]: providerUser.name,
      [PERSONA_COOKIE]: 'PROVIDER',
    };

    try {
      const res = await fetchRoute('/provider', providerCookies);
      const isSuccess = res.status === 200;
      record('Provider Portal (GET /provider)', isSuccess, `Status: ${res.status}, Length: ${res.text.length}`, res.status);
    } catch (err: any) {
      record('Provider Portal (GET /provider)', false, err.message, undefined, err);
    }
  }

  // 5. Authenticated Admin User Session & Page Checks
  if (adminUser) {
    console.log('\n--- Phase 5: Authenticated Admin User Page Checks ---');
    const adminCookies = {
      [USER_ID_COOKIE]: adminUser.id,
      [USER_EMAIL_COOKIE]: adminUser.email,
      [USER_NAME_COOKIE]: adminUser.name,
      [PERSONA_COOKIE]: 'ADMIN',
    };

    try {
      const res = await fetchRoute('/admin', adminCookies);
      const isSuccess = res.status === 200;
      record('Admin Dashboard (GET /admin)', isSuccess, `Status: ${res.status}, Length: ${res.text.length}`, res.status);
    } catch (err: any) {
      record('Admin Dashboard (GET /admin)', false, err.message, undefined, err);
    }
  }

  // 6. Non-Admin trying to access /admin
  if (msmeUser) {
    console.log('\n--- Phase 6: Privilege Escalation & Security Boundary Checks ---');
    const msmeCookies = {
      [USER_ID_COOKIE]: msmeUser.id,
      [USER_EMAIL_COOKIE]: msmeUser.email,
      [USER_NAME_COOKIE]: msmeUser.name,
      [PERSONA_COOKIE]: 'ADMIN', // malicious spoof attempt
    };

    try {
      const res = await fetchRoute('/admin', msmeCookies);
      const isBlocked = Boolean(res.status === 307 || res.status === 302 || res.status === 403 || (res.location && res.location.includes('error=unauthorized')));
      record('Spoofed Admin Persona Access Denied', isBlocked, `Status: ${res.status}, Redirect: ${res.location}`, res.status);
    } catch (err: any) {
      record('Spoofed Admin Persona Check', false, err.message, undefined, err);
    }
  }

  // 7. Test API Endpoints
  console.log('\n--- Phase 7: API Endpoint Functional Checks ---');
  try {
    // GST Verification API
    const gstRes = await fetch(`${BASE_URL}/api/gst/verify?gstin=27AABCU9603R1ZN`);
    const gstData = await gstRes.json();
    record('GST API Verification (/api/gst/verify)', gstRes.status === 200 && gstData.success === true, `Success: ${gstData.success}, Business: ${gstData.data?.legalName || 'N/A'}`, gstRes.status);
  } catch (err: any) {
    record('GST API Verification', false, err.message, undefined, err);
  }

  try {
    // Invalid GSTIN Check
    const gstInvalidRes = await fetch(`${BASE_URL}/api/gst/verify?gstin=INVALID_GST`);
    const gstInvalidData = await gstInvalidRes.json();
    record('GST API Rejects Invalid GSTIN', gstInvalidRes.status === 400 && gstInvalidData.success === false, `Result: ${JSON.stringify(gstInvalidData)}`, gstInvalidRes.status);
  } catch (err: any) {
    record('GST API Invalid Check', false, err.message, undefined, err);
  }

  // 8. Document Generation APIs & Dynamic Document Viewer
  try {
    const invoiceRes = await fetch(`${BASE_URL}/api/export-documents/invoice?businessId=${msmeUser?.businesses?.[0]?.id || '123'}`);
    record('Commercial Invoice Generation (/api/export-documents/invoice)', invoiceRes.status === 200, `Status: ${invoiceRes.status}, Content-Type: ${invoiceRes.headers.get('content-type')}`, invoiceRes.status);

    const packingListRes = await fetch(`${BASE_URL}/api/export-documents/packing-list?businessId=${msmeUser?.businesses?.[0]?.id || '123'}`);
    record('Packing List Generation (/api/export-documents/packing-list)', packingListRes.status === 200, `Status: ${packingListRes.status}, Content-Type: ${packingListRes.headers.get('content-type')}`, packingListRes.status);

    const anyDoc = await prisma.document.findFirst();
    if (anyDoc) {
      const docRes = await fetch(`${BASE_URL}/api/documents/${anyDoc.id}`);
      const isPdf = Boolean(docRes.status === 200 && docRes.headers.get('content-type')?.includes('application/pdf'));
      record(`Document PDF Viewer API (/api/documents/${anyDoc.id})`, isPdf, `Status: ${docRes.status}, Content-Type: ${docRes.headers.get('content-type')}`, docRes.status);
    }

    // Phase 4: Production Health Check API
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    record('Production Health API (/api/health)', healthRes.status === 200 && healthData.status === 'healthy' && healthData.database?.status === 'connected', `Status: ${healthData.status}, DB: ${healthData.database?.status} (${healthData.database?.latencyMs}ms)`, healthRes.status);
  } catch (err: any) {
    record('Document Generation & Health API', false, err.message, undefined, err);
  }

  // Summary
  console.log('\n================================================================');
  console.log('📊 DIAGNOSTICS SUMMARY');
  console.log('================================================================');
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`Total checks: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
