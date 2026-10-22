/**
 * A minimal in-memory sliding-window rate limiter.
 *
 * This is intentionally simple: it protects a single-instance deployment
 * against naive scripted abuse (repeated signup attempts, login brute-force,
 * hammering the paid AI endpoints) without adding an external dependency.
 *
 * It does NOT survive a restart and does NOT coordinate across multiple
 * server instances — for a multi-instance production deployment, replace
 * this with a shared store (e.g. Redis / Upstash) behind the same
 * `isRateLimited` signature.
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

// Keep the map from growing forever under sustained traffic.
const MAX_TRACKED_KEYS = 50_000;

export function isRateLimited(
  key: string,
  { windowMs, max }: { windowMs: number; max: number },
): boolean {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt < now) {
    if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > max;
}

/** Best-effort caller identifier from a request — the proxy-forwarded IP, or "unknown". */
export function clientKey(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
