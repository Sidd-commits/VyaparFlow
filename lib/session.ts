import crypto from 'crypto';

export interface SessionPayload {
  userId: string;
  email: string;
  role: 'MSME' | 'PROVIDER' | 'ADMIN';
  name: string;
  exp?: number;
}

const DEFAULT_SECRET = 'vyaparflow_default_cryptographic_session_hmac_secret_key_2026';
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || DEFAULT_SECRET;
const TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token.
 * Format: `base64(header).base64(payload).base64(signature)`
 */
export function createSessionToken(payload: Omit<SessionPayload, 'exp'>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const fullPayload: SessionPayload = { ...payload, exp };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(dataToSign);
  const signature = base64UrlEncode(hmac.digest('base64'));

  return `${dataToSign}.${signature}`;
}

/**
 * Verifies the signature and expiration of an HMAC-SHA256 session token.
 * Returns decoded SessionPayload if valid, or null if tampered or expired.
 */
export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  try {
    const hmac = crypto.createHmac('sha256', SESSION_SECRET);
    hmac.update(dataToSign);
    const expectedSignature = base64UrlEncode(hmac.digest('base64'));

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }

    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: SessionPayload = JSON.parse(payloadJson);

    // Check expiration timestamp
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Session expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}
