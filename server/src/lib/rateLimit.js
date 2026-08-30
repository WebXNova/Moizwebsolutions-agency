/**
 * Fixed-window in-memory rate limiter.
 *
 * Sized for a single-instance portfolio API: enough to stop a script hammering
 * the inbox without adding a dependency or a datastore. If the API is ever
 * scaled horizontally this needs to move to a shared store.
 */

/**
 * @param {{ windowMs: number; maxPerKey: number; maxGlobal: number }} options
 */
export function createRateLimiter({ windowMs, maxPerKey, maxGlobal }) {
  /** @type {Map<string, { count: number; resetAt: number }>} */
  const buckets = new Map();
  let global = { count: 0, resetAt: Date.now() + windowMs };

  function sweep(now) {
    if (global.resetAt <= now) global = { count: 0, resetAt: now + windowMs };
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }

  return {
    /**
     * @param {string} key
     * @returns {{ allowed: boolean; retryAfterSeconds: number; scope?: 'key' | 'global' }}
     */
    check(key) {
      const now = Date.now();
      sweep(now);

      if (global.count >= maxGlobal) {
        return {
          allowed: false,
          scope: 'global',
          retryAfterSeconds: Math.max(1, Math.ceil((global.resetAt - now) / 1000)),
        };
      }

      const bucket = buckets.get(key) ?? { count: 0, resetAt: now + windowMs };
      if (bucket.count >= maxPerKey) {
        return {
          allowed: false,
          scope: 'key',
          retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
        };
      }

      bucket.count += 1;
      buckets.set(key, bucket);
      global.count += 1;

      return { allowed: true, retryAfterSeconds: 0 };
    },

    /** Frees a slot again when the request never resulted in an email. */
    refund(key) {
      const bucket = buckets.get(key);
      if (bucket && bucket.count > 0) bucket.count -= 1;
      if (global.count > 0) global.count -= 1;
    },
  };
}
