import { createSessionToken, verifySessionToken } from '../../lib/session';
import { checkRateLimit, getClientIp } from '../../lib/rateLimit';

export async function runPhase2SessionSecurityTests() {
  console.log('🔒 Running Phase 2 Session & Rate Limiting Security Tests...');

  // --- TEST 1: Valid Session Creation & Verification ---
  const validPayload = {
    userId: 'user_test_msme_123',
    email: 'msme_test@vyaparflow.com',
    role: 'MSME' as const,
    name: 'MSME Test User',
  };

  const token = createSessionToken(validPayload);
  if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
    throw new Error('Phase 2 Test 1 Failed: Token format is not standard 3-part signed JWT format.');
  }

  const verified = verifySessionToken(token);
  if (!verified) {
    throw new Error('Phase 2 Test 1 Failed: Valid token failed signature verification.');
  }
  if (verified.userId !== validPayload.userId || verified.role !== 'MSME' || verified.email !== validPayload.email) {
    throw new Error('Phase 2 Test 1 Failed: Decoded payload does not match original data.');
  }
  console.log('  ✅ Test 1: Cryptographic session token creation and verification PASSED');

  // --- TEST 2: Tampered Token Detection & Rejection ---
  const parts = token.split('.');
  // Modify one character in payload (base64)
  const tamperedPayload = parts[1].slice(0, -2) + (parts[1].endsWith('A') ? 'B' : 'A') + parts[1].slice(-1);
  const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

  const tamperedResult = verifySessionToken(tamperedToken);
  if (tamperedResult !== null) {
    throw new Error('Phase 2 Test 2 Failed: Tampered token was NOT rejected by HMAC verification!');
  }
  console.log('  ✅ Test 2: Tamper detection (HMAC-SHA256 signature mismatch) PASSED');

  // --- TEST 3: Invalid / Garbage Tokens ---
  if (verifySessionToken('') !== null || verifySessionToken('invalid.token') !== null || verifySessionToken(null) !== null) {
    throw new Error('Phase 2 Test 3 Failed: Garbage tokens were not properly rejected.');
  }
  console.log('  ✅ Test 3: Malformed & garbage token rejection PASSED');

  // --- TEST 4: Sliding Window Rate Limiting ---
  const testIp = `test_ip_${Date.now()}`;
  const limit = 5;
  const windowMs = 10000;

  // Make 5 requests - should all succeed
  for (let i = 1; i <= limit; i++) {
    const res = checkRateLimit(`rate_test:${testIp}`, limit, windowMs);
    if (!res.success) {
      throw new Error(`Phase 2 Test 4 Failed: Request ${i} was throttled prematurely.`);
    }
    if (res.remaining !== limit - i) {
      throw new Error(`Phase 2 Test 4 Failed: Expected remaining ${limit - i}, got ${res.remaining}`);
    }
  }

  // 6th request - MUST be rejected with success: false
  const sixthRes = checkRateLimit(`rate_test:${testIp}`, limit, windowMs);
  if (sixthRes.success) {
    throw new Error('Phase 2 Test 4 Failed: 6th request exceeded limit but was allowed!');
  }
  if (sixthRes.remaining !== 0) {
    throw new Error('Phase 2 Test 4 Failed: Remaining should be 0 on rate limit rejection.');
  }
  console.log('  ✅ Test 4: Sliding-window rate limiter enforcement PASSED');

  // --- TEST 5: Client IP Extraction ---
  const mockReqWithForwarded = {
    headers: new Headers({
      'x-forwarded-for': '203.0.113.195, 70.41.3.18',
    }),
  };
  const extractedIp = getClientIp(mockReqWithForwarded);
  if (extractedIp !== '203.0.113.195') {
    throw new Error(`Phase 2 Test 5 Failed: Expected 203.0.113.195, got ${extractedIp}`);
  }

  const fallbackIp = getClientIp({ headers: new Headers() });
  if (fallbackIp !== '127.0.0.1') {
    throw new Error(`Phase 2 Test 5 Failed: Expected 127.0.0.1 fallback, got ${fallbackIp}`);
  }
  console.log('  ✅ Test 5: Client IP extraction & fallback headers PASSED');

  console.log('🎉 Phase 2 Session & Rate Limiting Security Tests 100% PASSED!\n');
}

if (require.main === module) {
  runPhase2SessionSecurityTests().catch((err) => {
    console.error('Fatal Error:', err);
    process.exit(1);
  });
}
