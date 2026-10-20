import "server-only";

type Bucket = {
  timestamps: number[];
};

class RateLimiter {
  private buckets = new Map<string, Bucket>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, 5 * 60 * 1000);

      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

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

    bucket.timestamps.push(now);

    return {
      success: true,
      remaining: remaining - 1,
      resetAt,
      retryAfter: 0,
    };
  }

  private cleanup() {
    const now = Date.now();
    const MAX_AGE = 60 * 60 * 1000;

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

const limiter = new RateLimiter();

// ==================================================
// DEVELOPMENT-FRIENDLY LIMITS
// ⚠️ Production এ tighten করুন (LOGIN: 5/min, REGISTER: 3/hour)
// ==================================================
export const RATE_LIMITS = {
  LOGIN: { limit: 20, windowMs: 60 * 1000 },          // Dev: 20/min
  REGISTER: { limit: 20, windowMs: 60 * 60 * 1000 },  // Dev: 20/hour
  PASSWORD_RESET: { limit: 10, windowMs: 60 * 60 * 1000 },
  EMAIL_VERIFY: { limit: 10, windowMs: 60 * 60 * 1000 },

  WALLET_TOPUP: { limit: 10, windowMs: 60 * 60 * 1000 },
  CHECKOUT: { limit: 10, windowMs: 60 * 1000 },
  PAYMENT_SUBMIT: { limit: 5, windowMs: 60 * 1000 },

  REVIEW_SUBMIT: { limit: 5, windowMs: 60 * 60 * 1000 },
  SUPPORT_TICKET: { limit: 5, windowMs: 60 * 60 * 1000 },
  CONTACT_FORM: { limit: 5, windowMs: 60 * 60 * 1000 },
  WISHLIST: { limit: 30, windowMs: 60 * 1000 },

  SEARCH: { limit: 60, windowMs: 60 * 1000 },
  PRODUCT_VIEW: { limit: 120, windowMs: 60 * 1000 },
  API_GENERAL: { limit: 100, windowMs: 60 * 1000 },

  ADMIN_ACTION: { limit: 200, windowMs: 60 * 1000 },
} as const;

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

export function rateLimitResponse(retryAfter: number) {
  return {
    success: false,
    message: `অনেক বেশি চেষ্টা করেছেন। ${retryAfter} সেকেন্ড পরে আবার চেষ্টা করুন।`,
  };
}