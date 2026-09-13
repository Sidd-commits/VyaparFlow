interface RateLimitRecord {
  timestamps: number[];
}

// In-memory store for rate limiting by IP/key
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale records every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const maxWindow = 15 * 60 * 1000; // 15 mins
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < maxWindow);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
  resetSeconds: number;
}

/**
 * Checks sliding window rate limit for a given key (e.g. IP + endpoint).
 * @param key Unique key, e.g. `gst:${ip}` or `login:${ip}`
 * @param limit Maximum number of allowed requests in the time window
 * @param windowMs Time window in milliseconds (e.g., 60000 for 1 minute)
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  let record = rateLimitStore.get(key);

  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Remove timestamps outside current window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0];
    const resetSeconds = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));
    return {
      success: false,
      remaining: 0,
      limit,
      resetSeconds,
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    remaining: limit - record.timestamps.length,
    limit,
    resetSeconds: Math.ceil(windowMs / 1000),
  };
}

/**
 * Extracts client IP from standard proxy headers or fallback.
 */
export function getClientIp(req: Request | { headers: Headers }): string {
  try {
    const headers = req.headers;
    const forwardedFor = headers.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }
    const realIp = headers.get('x-real-ip');
    if (realIp) {
      return realIp.trim();
    }
  } catch (err) {
    // fallback
  }
  return '127.0.0.1';
}
