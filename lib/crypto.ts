import crypto from 'crypto';

const ITERATIONS = 100000;
const KEYLEN = 64;
const DIGEST = 'sha512';

/**
 * Hashes a plaintext password using PBKDF2 with a cryptographically secure random salt.
 * Output format: `pbkdf2$<iterations>$<salt>$<derivedKeyHex>`
 */
export function hashPassword(password: string): string {
  if (!password) {
    throw new Error('Password cannot be empty for hashing');
  }
  const cleanPassword = password.trim();
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(cleanPassword, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex');
  return `pbkdf2$${ITERATIONS}$${salt}$${derivedKey}`;
}

/**
 * Verifies a plaintext password against a stored hash string.
 * Uses timingSafeEqual to protect against timing analysis attacks.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) {
    return false;
  }

  const p = password.trim();
  const rawP = password;

  // Handle PBKDF2 format
  if (storedHash.startsWith('pbkdf2$')) {
    const parts = storedHash.split('$');
    if (parts.length !== 4) {
      return false;
    }
    const iterations = parseInt(parts[1], 10);
    const salt = parts[2];
    const originalHash = parts[3];

    // Compute key with trimmed password
    const computedKey = crypto.pbkdf2Sync(p, salt, iterations, KEYLEN, DIGEST).toString('hex');
    const originalBuffer = Buffer.from(originalHash, 'hex');
    const computedBuffer = Buffer.from(computedKey, 'hex');

    if (originalBuffer.length === computedBuffer.length && crypto.timingSafeEqual(originalBuffer, computedBuffer)) {
      return true;
    }

    // Also try exact raw password in case password had intentional spaces
    if (rawP !== p) {
      const computedKeyRaw = crypto.pbkdf2Sync(rawP, salt, iterations, KEYLEN, DIGEST).toString('hex');
      const computedBufferRaw = Buffer.from(computedKeyRaw, 'hex');
      if (originalBuffer.length === computedBufferRaw.length && crypto.timingSafeEqual(originalBuffer, computedBufferRaw)) {
        return true;
      }
    }
  }

  // Fallback for plaintext passwords (e.g. initial demo seed data)
  if (storedHash === password || storedHash === p || storedHash.trim() === p) {
    return true;
  }

  return false;
}
