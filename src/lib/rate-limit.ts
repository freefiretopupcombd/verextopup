import "server-only";

// ==================================================
// RATE LIMITER
// ==================================================
// In-memory sliding window rate limiter.
//
// ⚠️ PRODUCTION NOTE:
// In-memory works for a single server instance.
// For multi-server / serverless, migrate to Redis (Upstash).
//
// Algorithm: Sliding window log
//   - For each key, store timestamps of recent requests
//   - On new request, filter out entries older than windowMs
//   - If count >= limit → block
//   - Else → allow and record timestamp
// ==================================================

type Bucket = {
  timestamps: number[];
};

class RateLimiter {
  private buckets = new Map<string, Bucket>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Auto-cleanup every 5 minutes to prevent memory leak
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, 5 * 60 * 1000);

      // Prevent Node from hanging on shutdown
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  // ---- Core check method ----
  async check(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<{
    success: boolean;
    remaining: number;
    resetAt: number;
    retryAfter: number;
  }> {
    const now = Date.now();
    const windowStart = now - windowMs;

    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = { timestamps: [] };
      this.buckets.set(key, bucket);
    }

    // Remove old timestamps outside the window
    bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

    const count = bucket.timestamps.length;
    const remaining = Math.max(0, limit - count);
    const oldestTimestamp = bucket.timestamps[0] || now;
    const resetAt = oldestTimestamp + windowMs;

    if (count >= limit) {
      const retryAfter = Math.ceil((resetAt - now) / 1000);
      return {
        success: false,
        remaining: 0,
        resetAt,
        retryAfter,
      };
    }

    // Record this request
    bucket.timestamps.push(now);

    return {
      success: true,
      remaining: remaining - 1,
      resetAt,
      retryAfter: 0,
    };
  }

  // ---- Cleanup old buckets to prevent memory leak ----
  private cleanup() {
    const now = Date.now();
    const MAX_AGE = 60 * 60 * 1000; // 1 hour

    for (const [key, bucket] of this.buckets.entries()) {
      bucket.timestamps = bucket.timestamps.filter(
        (t) => now - t < MAX_AGE
      );
      if (bucket.timestamps.length === 0) {
        this.buckets.delete(key);
      }
    }
  }
}

// Singleton instance
const limiter = new RateLimiter();

// ==================================================
// PRESETS
// ==================================================
// Different rate limits for different actions.
//
// Format: { limit: N requests, windowMs: M milliseconds }
// ==================================================
export const RATE_LIMITS = {
  // ---- Auth (very strict) ----
  LOGIN: { limit: 5, windowMs: 60 * 1000 },           // 5 attempts / minute
  REGISTER: { limit: 3, windowMs: 60 * 60 * 1000 },   // 3 / hour
  PASSWORD_RESET: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 / hour
  EMAIL_VERIFY: { limit: 5, windowMs: 60 * 60 * 1000 },

  // ---- Financial (strict) ----
  WALLET_TOPUP: { limit: 10, windowMs: 60 * 60 * 1000 },  // 10 / hour
  CHECKOUT: { limit: 10, windowMs: 60 * 1000 },           // 10 / minute
  PAYMENT_SUBMIT: { limit: 5, windowMs: 60 * 1000 },      // 5 / minute

  // ---- User actions (moderate) ----
  REVIEW_SUBMIT: { limit: 5, windowMs: 60 * 60 * 1000 },  // 5 / hour
  SUPPORT_TICKET: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 / hour
  CONTACT_FORM: { limit: 5, windowMs: 60 * 60 * 1000 },   // 5 / hour
  WISHLIST: { limit: 30, windowMs: 60 * 1000 },

  // ---- Public (permissive) ----
  SEARCH: { limit: 60, windowMs: 60 * 1000 },             // 60 / minute
  PRODUCT_VIEW: { limit: 120, windowMs: 60 * 1000 },
  API_GENERAL: { limit: 100, windowMs: 60 * 1000 },

  // ---- Admin actions ----
  ADMIN_ACTION: { limit: 200, windowMs: 60 * 1000 },
} as const;

// ==================================================
// HELPER — Rate limit check
// ==================================================
// Usage:
//   const result = await rateLimit("login", `ip:${ip}`, RATE_LIMITS.LOGIN)
//   if (!result.success) return { error: "Too many attempts. Try again in Xs" }
// ==================================================
export async function rateLimit(
  prefix: string,
  identifier: string,
  preset: { limit: number; windowMs: number }
): Promise<{
  success: boolean;
  remaining: number;
  retryAfter: number;
}> {
  const key = `${prefix}:${identifier}`;
  const result = await limiter.check(key, preset.limit, preset.windowMs);

  return {
    success: result.success,
    remaining: result.remaining,
    retryAfter: result.retryAfter,
  };
}

// ==================================================
// HELPER — Get client IP from request
// ==================================================
// Considers common proxy headers in order of trust:
//   1. CF-Connecting-IP (Cloudflare)
//   2. X-Real-IP (Nginx)
//   3. X-Forwarded-For (first IP in chain)
//   4. Fallback: "unknown"
// ==================================================
export function getClientIp(headers: Headers): string {
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return "unknown";
}

// ==================================================
// HELPER — Standard "too many requests" response
// ==================================================
export function rateLimitResponse(retryAfter: number) {
  return {
    success: false,
    message: `অনেক বেশি চেষ্টা করেছেন। ${retryAfter} সেকেন্ড পরে আবার চেষ্টা করুন।`,
  };
}