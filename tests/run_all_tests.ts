import { runDestinationP0Test } from './integration/destination_p0.test';
import { runDestinationSwitcherTest } from './integration/destination_switcher.test';
import { runLiveDestinationE2ETest } from './e2e/live_destination_e2e.test';
import { runServerActionE2ETest } from './e2e/server_action_e2e.test';
import { runTenantIsolationE2ETest } from './e2e/tenant_isolation_e2e.test';
import { runAdminAuthorizationSecurityTests } from './security/admin_authorization.test';
import { runPhase2SessionSecurityTests } from './security/phase2_session_security.test';
import { runHttpRouteProtectionTests } from './integration/http_route_protection.test';
import { runPhase3ShipmentWorkflowTests } from './integration/phase3_shipment_workflow.test';

async function main() {
  console.log('\n================================================================');
  console.log('🚀 VYAPARFLOW AUTOMATED MASTER TEST SUITE RUNNER');
  console.log('================================================================\n');

  const startTime = Date.now();

  try {
    // 1. Security & Route Protection Tests
    console.log('\n--- 1. RUNNING SECURITY & AUTHORIZATION TESTS ---');
    await runPhase2SessionSecurityTests();
    await runAdminAuthorizationSecurityTests();
    await runHttpRouteProtectionTests();

    // 2. Integration & Operations Tests
    console.log('\n--- 2. RUNNING INTEGRATION & OPERATIONS TESTS ---');
    await runPhase3ShipmentWorkflowTests();
    await runDestinationP0Test();
    await runDestinationSwitcherTest();

    // 3. E2E Tests
    console.log('\n--- 3. RUNNING E2E TESTS ---');
    await runTenantIsolationE2ETest();
    await runLiveDestinationE2ETest();
    await runServerActionE2ETest();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n================================================================');
    console.log(`🎉 ALL TEST SUITES EXECUTED AND PASSED 100% (Duration: ${duration}s)`);
    console.log('================================================================\n');
  } catch (error) {
    console.error('\n❌ MASTER TEST SUITE FAILED:', error);
    process.exit(1);
  }
}

main();
