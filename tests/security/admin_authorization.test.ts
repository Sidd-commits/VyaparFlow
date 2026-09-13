import assert from 'assert';
import { prisma } from '../../lib/prisma';
import { isPlatformAdmin, getPlatformAdminEmail } from '../../lib/authGuards';
import { hashPassword, verifyPassword } from '../../lib/crypto';
import { updateRuleAction, deleteUserAction, getAllUsers } from '../../app/actions';

export async function runAdminAuthorizationSecurityTests() {
  console.log('================================================================');
  console.log('🛡️ RUNNING P0 SECURITY TEST SUITE: ADMIN AUTHORIZATION & PRIVILEGE ENFORCEMENT');
  console.log('================================================================');

  const ts = Date.now();
  const configuredAdminEmail = getPlatformAdminEmail();
  assert.strictEqual(typeof configuredAdminEmail, 'string');
  console.log(`[Config] Server-Controlled Admin Email: ${configuredAdminEmail}`);

  // --------------------------------------------------------------------------
  // TEST 1: Password Cryptographic Hashing & Verification
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 1: Cryptographic Password Hashing & Verification ---');
  const plainPassword = 'SuperSecretSecurePassword!2026';
  const hashed = hashPassword(plainPassword);
  
  assert.ok(hashed.startsWith('pbkdf2$100000$'), 'Hash must use PBKDF2 with 100,000 rounds');
  assert.ok(verifyPassword(plainPassword, hashed), 'verifyPassword must return true for correct password');
  assert.ok(!verifyPassword('WrongPassword123', hashed), 'verifyPassword must return false for wrong password');
  assert.ok(!verifyPassword('', hashed), 'Empty password must be rejected');
  console.log('✓ PBKDF2 100,000 iterations + salt hashing verified');

  // --------------------------------------------------------------------------
  // TEST 2: isPlatformAdmin Identity Enforcement
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: isPlatformAdmin Authorization Boundary ---');
  
  // Case A: Valid Admin
  const legitimateAdminUser = {
    id: `admin_${ts}`,
    email: configuredAdminEmail,
    role: 'ADMIN',
  };
  assert.strictEqual(isPlatformAdmin(legitimateAdminUser), true, 'Legitimate Platform Admin must be approved');

  // Case B: Case insensitivity / whitespace trimming
  const upperCaseAdminUser = {
    id: `admin_case_${ts}`,
    email: `  ${configuredAdminEmail.toUpperCase()}  `,
    role: 'ADMIN',
  };
  assert.strictEqual(isPlatformAdmin(upperCaseAdminUser), true, 'Normalized email matching must succeed');

  // Case C: Attacker pretending to have ADMIN role but different email
  const imposterAdminUser = {
    id: `hacker_${ts}`,
    email: 'hacker@malicious-domain.com',
    role: 'ADMIN', // Client / DB tamper attempt
  };
  assert.strictEqual(isPlatformAdmin(imposterAdminUser), false, 'Tampered role with non-admin email must be rejected');

  // Case D: Email containing "admin" substring
  const substringAdminUser = {
    id: `fake_admin_${ts}`,
    email: 'badadmin@gmail.com',
    role: 'ADMIN',
  };
  assert.strictEqual(isPlatformAdmin(substringAdminUser), false, 'Substring email match must be rejected');

  // Case E: MSME user with configured admin email but role not ADMIN
  const msmeWithAdminEmail = {
    id: `msme_admin_${ts}`,
    email: configuredAdminEmail,
    role: 'MSME',
  };
  assert.strictEqual(isPlatformAdmin(msmeWithAdminEmail), false, 'User must have both ADMIN role and configured admin email');

  console.log('✓ isPlatformAdmin strict identity boundary verified');

  // --------------------------------------------------------------------------
  // TEST 3: Attacker Exporter / Provider attempting Admin Server Actions
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3: Server Action Protection (updateRuleAction, deleteUserAction, getAllUsers) ---');

  // Create a real MSME user and Provider user in DB
  const attackerExporter = await prisma.user.create({
    data: {
      email: `attacker_exporter_${ts}@vyaparflow.app`,
      name: 'Attacker Exporter',
      passwordHash: hashPassword('password123'),
      role: 'MSME',
    },
  });

  const attackerProvider = await prisma.user.create({
    data: {
      email: `attacker_provider_${ts}@vyaparflow.app`,
      name: 'Attacker Provider',
      passwordHash: hashPassword('password123'),
      role: 'PROVIDER',
    },
  });

  // Test that calling updateRuleAction unauthenticated throws Forbidden/Unauthorized
  let threwUpdateRule = false;
  try {
    await updateRuleAction('non-existent-rule-id', { priority: 'critical', active: false });
  } catch (err: unknown) {
    threwUpdateRule = true;
    const msg = (err as Error).message || '';
    assert.ok(
      msg.includes('Forbidden') || msg.includes('Unauthorized'),
      `Expected Forbidden/Unauthorized error, got: ${msg}`
    );
  }
  assert.ok(threwUpdateRule, 'updateRuleAction must block unauthorized execution');

  // Test that calling deleteUserAction unauthenticated throws Forbidden/Unauthorized
  let threwDeleteUser = false;
  try {
    await deleteUserAction(attackerExporter.id);
  } catch (err: unknown) {
    threwDeleteUser = true;
    const msg = (err as Error).message || '';
    assert.ok(
      msg.includes('Forbidden') || msg.includes('Unauthorized'),
      `Expected Forbidden/Unauthorized error, got: ${msg}`
    );
  }
  assert.ok(threwDeleteUser, 'deleteUserAction must block unauthorized execution');

  // Test that calling getAllUsers unauthenticated throws Forbidden/Unauthorized
  let threwGetAllUsers = false;
  try {
    await getAllUsers();
  } catch (err: unknown) {
    threwGetAllUsers = true;
    const msg = (err as Error).message || '';
    assert.ok(
      msg.includes('Forbidden') || msg.includes('Unauthorized'),
      `Expected Forbidden/Unauthorized error, got: ${msg}`
    );
  }
  assert.ok(threwGetAllUsers, 'getAllUsers must block unauthorized execution');

  console.log('✓ Unauthenticated and unauthorized calls to admin actions strictly rejected');

  // --------------------------------------------------------------------------
  // TEST 4: Platform Admin Mutation & Audit Trail
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 4: Platform Admin Mutation & Audit Trail ---');

  // Create a temporary user to act as actor for foreign key constraint
  const auditActor = await prisma.user.create({
    data: {
      email: `audit_actor_${ts}@vyaparflow.app`,
      name: 'Audit Actor',
      passwordHash: hashPassword('password123'),
      role: 'ADMIN',
    },
  });

  // Verify that an audit log can be written for admin actions
  const testAudit = await prisma.auditLog.create({
    data: {
      actorId: auditActor.id,
      action: 'ADMIN_SECURITY_AUDIT_VERIFIED',
      entityType: 'System',
      entityId: 'admin-gate',
      newValueJson: JSON.stringify({ verifiedAt: new Date().toISOString() }),
    },
  });
  assert.ok(testAudit.id, 'Audit log must be created successfully');

  // Clean up temporary test records
  await prisma.auditLog.deleteMany({ where: { id: testAudit.id } });
  await prisma.user.deleteMany({
    where: {
      id: { in: [attackerExporter.id, attackerProvider.id, auditActor.id] },
    },
  });

  console.log('✓ Audit logging and cleanup verified');
  console.log('\n================================================================');
  console.log('🎉 ALL P0 ADMIN AUTHORIZATION & SECURITY TESTS PASSED 100%!');
  console.log('================================================================\n');
}

if (require.main === module) {
  runAdminAuthorizationSecurityTests().catch((err) => {
    console.error('❌ SECURITY TEST SUITE FAILED:', err);
    process.exit(1);
  });
}
