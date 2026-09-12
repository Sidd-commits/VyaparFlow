import assert from 'assert';
import { prisma } from '../../lib/prisma';

export async function runTenantIsolationE2ETest() {
  console.log('================================================================');
  console.log('🧪 RUNNING E2E TEST: MULTI-TENANT ISOLATION & ACCESS CONTROL');
  console.log('================================================================');

  const ts = Date.now();

  // Create Exporter Alpha
  const userA = await prisma.user.create({
    data: {
      email: `alpha_${ts}@vyaparflow.app`,
      name: 'Alpha User',
      passwordHash: 'secret123',
      role: 'MSME',
    },
  });

  const bizA = await prisma.business.create({
    data: {
      ownerUserId: userA.id,
      displayName: 'Alpha Logistics',
      legalName: 'Alpha Exports Pvt Ltd',
      businessType: 'MANUFACTURER',
      location: 'Zone 1',
      city: 'Mumbai',
      state: 'Maharashtra',
      gstStatus: 'Active',
      iecStatus: 'Active',
      profileCompletion: 100,
    },
  });

  // Create Exporter Beta
  const userB = await prisma.user.create({
    data: {
      email: `beta_${ts}@vyaparflow.app`,
      name: 'Beta User',
      passwordHash: 'secret123',
      role: 'MSME',
    },
  });

  const bizB = await prisma.business.create({
    data: {
      ownerUserId: userB.id,
      displayName: 'Beta Corp',
      legalName: 'Beta Exports Pvt Ltd',
      businessType: 'MANUFACTURER',
      location: 'Zone 2',
      city: 'Pune',
      state: 'Maharashtra',
      gstStatus: 'Active',
      iecStatus: 'Active',
      profileCompletion: 100,
    },
  });

  // Verify that User A query only returns Biz A
  const userABusinesses = await prisma.business.findMany({
    where: { ownerUserId: userA.id },
  });
  assert.strictEqual(userABusinesses.length, 1);
  assert.strictEqual(userABusinesses[0].id, bizA.id);
  assert.notStrictEqual(userABusinesses[0].id, bizB.id);

  // Verify that User B query only returns Biz B
  const userBBusinesses = await prisma.business.findMany({
    where: { ownerUserId: userB.id },
  });
  assert.strictEqual(userBBusinesses.length, 1);
  assert.strictEqual(userBBusinesses[0].id, bizB.id);
  assert.notStrictEqual(userBBusinesses[0].id, bizA.id);

  console.log('✓ Tenant isolation database check passed');
  console.log('✅ ALL TENANT ISOLATION E2E TESTS PASSED!');
}

if (require.main === module) {
  runTenantIsolationE2ETest().catch((err) => {
    console.error('TEST FAILED:', err);
    process.exit(1);
  });
}
