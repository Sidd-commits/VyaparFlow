import { runDestinationP0Test } from './integration/destination_p0.test';
import { runDestinationSwitcherTest } from './integration/destination_switcher.test';
import { runLiveDestinationE2ETest } from './e2e/live_destination_e2e.test';
import { runServerActionE2ETest } from './e2e/server_action_e2e.test';
import { runTenantIsolationE2ETest } from './e2e/tenant_isolation_e2e.test';

async function main() {
  console.log('\n================================================================');
  console.log('🚀 VYAPARFLOW AUTOMATED MASTER TEST SUITE RUNNER');
  console.log('================================================================\n');

  const startTime = Date.now();

  try {
    // 1. Integration Tests
    console.log('\n--- 1. RUNNING INTEGRATION TESTS ---');
    await runDestinationP0Test();
    await runDestinationSwitcherTest();

    // 2. E2E Tests
    console.log('\n--- 2. RUNNING E2E TESTS ---');
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
