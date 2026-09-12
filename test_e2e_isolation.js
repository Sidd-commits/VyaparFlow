const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = 'http://localhost:3000';

function getPage(path, cookieHeader = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          Cookie: cookieHeader,
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: buffer.toString('utf8'),
            rawBuffer: buffer,
            cookies: res.headers['set-cookie'] || [],
          });
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

async function runAudit() {
  console.log('====================================================');
  console.log('🚀 VYAPARFLOW FULL FUNCTIONAL & ISOLATION QA AUDIT');
  console.log('====================================================\n');

  // Fetch actual IDs from Prisma database
  const userA = await prisma.user.findUnique({
    where: { email: 'msme@apex-exports.com' },
    include: { businesses: { include: { shipments: true } } },
  });

  const userB = await prisma.user.findUnique({
    where: { email: 'msme2@konkan-spices.com' },
    include: { businesses: { include: { shipments: true } } },
  });

  const shipmentA = userA?.businesses?.[0]?.shipments?.[0];
  const shipmentB = userB?.businesses?.[0]?.shipments?.[0];

  console.log(`User A: ${userA?.name} (${userA?.id}) | Shipment: ${shipmentA?.shipmentNumber} (${shipmentA?.id})`);
  console.log(`User B: ${userB?.name} (${userB?.id}) | Shipment: ${shipmentB?.shipmentNumber} (${shipmentB?.id})\n`);

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${details ? `\n   Details: ${details}` : ''}`);
    }
  }

  // 1. User A Session Cookie Setup
  const cookieHeaderA = `vyaparflow_active_user_id=${userA.id}; vyaparflow_active_role=MSME; vyaparflow_active_user_email=${userA.email}; vyaparflow_active_user_name=${encodeURIComponent(userA.name)}`;

  // TEST 1: User A Dashboard Inspection
  console.log('--- 1. Inspecting User A (Apex Agro) Dashboard & Modules ---');
  let dashA = await getPage('/dashboard', cookieHeaderA);
  assert(dashA.statusCode === 200, 'User A Dashboard loads with 200 OK');
  assert(dashA.body.includes('Apex Quality Agro Exporters') || dashA.body.includes('Apex'), 'User A sees Apex Agro Exporters');
  assert(dashA.body.includes(shipmentA.shipmentNumber), `User A sees shipment ${shipmentA.shipmentNumber}`);
  assert(!dashA.body.includes(shipmentB.shipmentNumber), `User A DOES NOT see User B shipment ${shipmentB.shipmentNumber}`);
  assert(!dashA.body.includes('Konkan Spice Exporters'), 'User A DOES NOT see User B company Konkan Spice Exporters');

  // Check User A Subpages
  let bizA = await getPage('/business', cookieHeaderA);
  assert(bizA.statusCode === 200 && (bizA.body.includes('Apex Quality Agro Exporters') || bizA.body.includes('Apex')), 'User A Business page displays Apex');

  let readyA = await getPage('/readiness', cookieHeaderA);
  assert(readyA.statusCode === 200 && (readyA.body.includes('Mango Pulp') || readyA.body.includes('United Arab Emirates')), 'User A Readiness page displays Mango Pulp -> UAE');

  let docA = await getPage('/documents', cookieHeaderA);
  assert(docA.statusCode === 200 && docA.body.includes('Document Management'), 'User A Documents page loads with 200 OK');

  let certA = await getPage('/certifications', cookieHeaderA);
  assert(certA.statusCode === 200 && certA.body.includes('Certifications Hub'), 'User A Certifications page loads with 200 OK');

  let packA = await getPage('/packaging', cookieHeaderA);
  assert(packA.statusCode === 200 && (packA.body.includes('Packaging') || packA.body.includes('Labelling')), 'User A Packaging page loads with 200 OK');

  let shpA = await getPage('/shipments', cookieHeaderA);
  assert(shpA.statusCode === 200 && shpA.body.includes(shipmentA.shipmentNumber) && !shpA.body.includes(shipmentB.shipmentNumber), 'User A Shipments list is strictly scoped');

  let shpDetailA = await getPage(`/shipments/${shipmentA.id}`, cookieHeaderA);
  assert(shpDetailA.statusCode === 200 && shpDetailA.body.includes(shipmentA.shipmentNumber), `User A can view own shipment ${shipmentA.shipmentNumber}`);

  let shpQuotesA = await getPage(`/shipments/${shipmentA.id}/quotes`, cookieHeaderA);
  assert(shpQuotesA.statusCode === 200 && shpQuotesA.body.includes('Logistics Quote Comparison'), `User A can view quotes for ${shipmentA.shipmentNumber}`);

  let shpTrackA = await getPage(`/shipments/${shipmentA.id}/tracking`, cookieHeaderA);
  assert(shpTrackA.statusCode === 200 && shpTrackA.body.includes(shipmentA.shipmentNumber) && shpTrackA.body.includes('Tracking'), `User A can view tracking for ${shipmentA.shipmentNumber}`);

  let invoicePdfA = await getPage(`/api/export-documents/invoice?shipmentId=${shipmentA.id}`, cookieHeaderA);
  assert(invoicePdfA.statusCode === 200 && invoicePdfA.headers['content-type'] === 'application/pdf', `User A can download Commercial Invoice PDF for ${shipmentA.shipmentNumber}`);

  // User A trying to access User B's shipment
  console.log('\n--- 2. Testing Cross-User Access Attempt: User A -> User B Data ---');
  let unauthorizedShp = await getPage(`/shipments/${shipmentB.id}`, cookieHeaderA);
  assert(unauthorizedShp.body.includes('Shipment Record Not Found') || unauthorizedShp.statusCode === 404 || unauthorizedShp.statusCode === 403, `User A CANNOT access User B shipment ${shipmentB.shipmentNumber} details`);

  let unauthorizedQuotes = await getPage(`/shipments/${shipmentB.id}/quotes`, cookieHeaderA);
  assert(unauthorizedQuotes.body.includes('Shipment Not Found') || unauthorizedQuotes.statusCode === 404 || unauthorizedQuotes.statusCode === 403, `User A CANNOT access User B shipment ${shipmentB.shipmentNumber} quotes`);

  let unauthorizedInvoice = await getPage(`/api/export-documents/invoice?shipmentId=${shipmentB.id}`, cookieHeaderA);
  assert(unauthorizedInvoice.statusCode === 403 || unauthorizedInvoice.statusCode === 404, 'User A CANNOT download User B invoice PDF (403 Forbidden)');

  // TEST 3: User B Session Setup & Isolation
  console.log('\n--- 3. Authenticating & Inspecting MSME User B (Konkan Spices) ---');
  const cookieHeaderB = `vyaparflow_active_user_id=${userB.id}; vyaparflow_active_role=MSME; vyaparflow_active_user_email=${userB.email}; vyaparflow_active_user_name=${encodeURIComponent(userB.name)}`;

  let dashB = await getPage('/dashboard', cookieHeaderB);
  assert(dashB.statusCode === 200, 'User B Dashboard loads with 200 OK');
  assert(dashB.body.includes('Konkan Spice Exporters') || dashB.body.includes('Konkan'), 'User B sees Konkan Spice Exporters');
  assert(dashB.body.includes(shipmentB.shipmentNumber), `User B sees own shipment ${shipmentB.shipmentNumber}`);
  assert(!dashB.body.includes('Apex'), 'User B DOES NOT see User A company Apex');
  assert(!dashB.body.includes(shipmentA.shipmentNumber), `User B DOES NOT see User A shipment ${shipmentA.shipmentNumber}`);

  let bizB = await getPage('/business', cookieHeaderB);
  assert(bizB.statusCode === 200 && bizB.body.includes('Konkan'), 'User B Business page displays Konkan');

  let readyB = await getPage('/readiness', cookieHeaderB);
  assert(readyB.statusCode === 200 && (readyB.body.includes('Turmeric') || readyB.body.includes('United States')), 'User B Readiness page displays Turmeric -> USA');

  let shpB = await getPage('/shipments', cookieHeaderB);
  assert(shpB.statusCode === 200 && shpB.body.includes(shipmentB.shipmentNumber) && !shpB.body.includes(shipmentA.shipmentNumber), 'User B Shipments list strictly contains only User B shipments');

  let shpDetailB = await getPage(`/shipments/${shipmentB.id}`, cookieHeaderB);
  assert(shpDetailB.statusCode === 200 && shpDetailB.body.includes(shipmentB.shipmentNumber), `User B can view own shipment ${shipmentB.shipmentNumber}`);

  let invoicePdfB = await getPage(`/api/export-documents/invoice?shipmentId=${shipmentB.id}`, cookieHeaderB);
  assert(invoicePdfB.statusCode === 200 && invoicePdfB.headers['content-type'] === 'application/pdf', `User B can download Commercial Invoice PDF for ${shipmentB.shipmentNumber}`);

  // User B attempting to access User A shipment
  let unauthorizedShpB = await getPage(`/shipments/${shipmentA.id}`, cookieHeaderB);
  assert(unauthorizedShpB.body.includes('Shipment Record Not Found') || unauthorizedShpB.statusCode === 404 || unauthorizedShpB.statusCode === 403, `User B CANNOT access User A shipment ${shipmentA.shipmentNumber}`);

  let unauthorizedInvoiceB = await getPage(`/api/export-documents/invoice?shipmentId=${shipmentA.id}`, cookieHeaderB);
  assert(unauthorizedInvoiceB.statusCode === 403 || unauthorizedInvoiceB.statusCode === 404, 'User B CANNOT download User A invoice PDF (403 Forbidden)');

  // TEST 4: Profile Management & Cross-User Update Persistence
  console.log('\n--- 4. Testing Profile Management & Update Scoping ---');
  // Update User A's company profile
  const updatedDisplayNameA = 'Apex Global Super-Agro Exporters';
  await prisma.business.update({
    where: { id: userA.businesses[0].id },
    data: { displayName: updatedDisplayNameA, location: 'Tarapur Super MIDC Corridor' },
  });

  // Verify User A sees updated name
  let dashAAfterUpdate = await getPage('/dashboard', cookieHeaderA);
  assert(dashAAfterUpdate.statusCode === 200 && dashAAfterUpdate.body.includes(updatedDisplayNameA), 'User A sees updated company name on dashboard');

  // Verify User B still sees only User B and NEVER sees User A's updated data
  let dashBAfterUpdate = await getPage('/dashboard', cookieHeaderB);
  assert(dashBAfterUpdate.statusCode === 200 && dashBAfterUpdate.body.includes('Konkan Spice Exporters'), 'User B still sees only Konkan Spice Exporters');
  assert(!dashBAfterUpdate.body.includes(updatedDisplayNameA), 'User B DOES NOT leak User A updated company name');

  // Restore original name
  await prisma.business.update({
    where: { id: userA.businesses[0].id },
    data: { displayName: 'Apex Quality Agro Exporters', location: 'Palghar Industrial Area' },
  });

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${totalTests}`);
  console.log(`PASSED: ${passedTests}`);
  console.log(`FAILED: ${totalTests - passedTests}`);
  console.log('====================================================');

  await prisma.$disconnect();

  if (passedTests === totalTests) {
    console.log('🎉 ALL AUDIT & ISOLATION TESTS PASSED WITH ZERO FAILURES!');
    process.exit(0);
  } else {
    console.error('⚠️ SOME TESTS FAILED. CHECK LOGS ABOVE.');
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error('Audit encountered error:', err);
  process.exit(1);
});
