// In-memory rate limiting — works within a single warm server instance,
// but does NOT share state across different instances. On Vercel, that
// means a distributed attacker hitting your app across multiple cold
// starts / instances won't be fully caught by this alone. What this DOES
// catch: a single script or browser hammering an endpoint in a tight
// loop, which is the overwhelming majority of real-world abuse at your
// current scale.
//
// For guaranteed protection across every instance, the standard approach
// is Upstash Redis + @upstash/ratelimit (Vercel's own recommended setup).
// That needs an external account and API keys I don't have here — this
// is the same constraint as the Sentry situation. This in-memory version
// is the honest "what I can actually build and verify without those"
// equivalent, with the same upgrade-later shape.

type Entry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Entry>();

// Prevent unbounded memory growth from stale entries piling up forever.
const MAX_ENTRIES = 5000;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    if (store.size >= MAX_ENTRIES) {
      // Cheap eviction: clear everything rather than tracking LRU. This
      // resets everyone's window early in the rare case we hit the cap,
      // which is a fine tradeoff for an in-memory best-effort limiter.
      store.clear();
    }

    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Best-effort client identifier from request headers. Vercel sets
 * x-forwarded-for; falls back to a constant for local dev where it's
 * usually absent.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
