import assert from 'assert';
import { prisma } from '../../lib/prisma';
import { ensureProviderProfile } from '../../lib/services/setupProvider';

export async function runProviderPortalTest() {
  console.log('================================================================');
  console.log('🧪 RUNNING INTEGRATION TEST: SERVICE PROVIDER COMMAND DECK');
  console.log('================================================================');

  // 1. Verify Freight Provider Profile Resolution
  console.log('1. Testing Freight Provider Profile Resolution...');
  const freightUser = await prisma.user.findFirst({
    where: { email: 'provider@freight.com' },
  });
  assert(freightUser, 'Freight provider user should exist in database');

  const freightProvider = await ensureProviderProfile(
    freightUser.id,
    freightUser.email,
    freightUser.name
  );
  assert(freightProvider, 'Freight provider entity should resolve');
  assert.strictEqual(freightProvider.type, 'FREIGHT');
  console.log('   ✓ Freight provider resolved:', freightProvider.name);

  // 2. Verify Lab Provider Profile Resolution
  console.log('2. Testing Certification Lab Provider Profile Resolution...');
  const labUser = await prisma.user.findFirst({
    where: { email: 'lab@certify.com' },
  });
  assert(labUser, 'Lab provider user should exist in database');

  const labProvider = await ensureProviderProfile(
    labUser.id,
    labUser.email,
    labUser.name
  );
  assert(labProvider, 'Lab provider entity should resolve');
  assert.strictEqual(labProvider.type, 'CERTIFICATION');
  console.log('   ✓ Lab provider resolved:', labProvider.name);

  // 3. Verify CHA Customs Broker Profile Resolution
  console.log('3. Testing Customs CHA Provider Profile Resolution...');
  const chaUser = await prisma.user.findFirst({
    where: { email: 'cha@customs.com' },
  });
  assert(chaUser, 'CHA provider user should exist in database');

  const chaProvider = await ensureProviderProfile(
    chaUser.id,
    chaUser.email,
    chaUser.name
  );
  assert(chaProvider, 'CHA provider entity should resolve');
  assert.strictEqual(chaProvider.type, 'CUSTOMS_CHA');
  console.log('   ✓ CHA provider resolved:', chaProvider.name);

  // 4. Verify Active Provider Tasks exist for Demo Users
  console.log('4. Verifying Provider Task Queue Population...');
  const tasks = await prisma.providerTask.findMany({
    include: { provider: true, requirement: true, shipment: true },
  });
  assert(tasks.length >= 3, `Expected at least 3 provider tasks, found ${tasks.length}`);
  console.log(`   ✓ Found ${tasks.length} active provider tasks across system`);

  // 5. Verify Freight Rate Quote Submission
  console.log('5. Testing Carrier Quote Submission Workflow...');
  const demoShipment = await prisma.shipment.findFirst({
    where: { shipmentNumber: 'SHP-2026-AE-001' },
  });
  assert(demoShipment, 'Active demo shipment SHP-2026-AE-001 should exist');

  const customQuote = await prisma.quote.create({
    data: {
      shipmentId: demoShipment.id,
      providerId: freightProvider.id,
      mode: 'Air Cargo Express (Direct Flight BOM -> DXB)',
      cost: 295000,
      currency: 'INR',
      transitMin: 1,
      transitMax: 2,
      inclusions: 'Direct flight Mumbai to Dubai, Airport cold store, Priority customs release',
      exclusions: 'Heavy cargo oversized surcharge',
      isSelected: false,
    },
  });
  assert(customQuote.id, 'Quote should be created in database');
  assert.strictEqual(customQuote.cost, 295000);
  console.log('   ✓ Freight rate quote submitted: ₹295,000 for Air Cargo Express');

  // 6. Verify Tracking Milestone Telemetry Posting
  console.log('6. Testing Live Milestone Telemetry Posting...');
  const trackingEvt = await prisma.trackingEvent.create({
    data: {
      shipmentId: demoShipment.id,
      status: 'Pickup Scheduled',
      location: 'Palghar Processing Facility, Maharashtra',
      note: 'SwiftGlobe Reefer truck dispatched for container loading.',
    },
  });
  assert(trackingEvt.id, 'Tracking event should be persisted');
  assert.strictEqual(trackingEvt.status, 'Pickup Scheduled');
  console.log('   ✓ Milestone telemetry event published successfully');

  console.log('================================================================');
  console.log('🎉 ALL SERVICE PROVIDER WORKFLOW INTEGRATION TESTS PASSED!');
  console.log('================================================================');
}

if (require.main === module) {
  runProviderPortalTest()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Provider integration test failed:', err);
      process.exit(1);
    });
}
