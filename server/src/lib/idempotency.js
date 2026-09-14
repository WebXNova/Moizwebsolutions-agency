import { createHash } from 'node:crypto';

/**
 * Short-lived in-memory idempotency map for the single-process API.
 *
 * @param {{ ttlMs?: number }} [options]
 */
export function createIdempotencyStore({ ttlMs = 5 * 60 * 1000 } = {}) {
  /** @type {Map<string, { expiresAt: number; value: unknown; inflight?: Promise<unknown> }>} */
  const entries = new Map();

  function sweep(now = Date.now()) {
    for (const [key, entry] of entries) {
      if (entry.expiresAt <= now && !entry.inflight) entries.delete(key);
    }
  }

  return {
    /**
     * @param {string} key
     */
    get(key) {
      sweep();
      const entry = entries.get(key);
      if (!entry || entry.expiresAt <= Date.now()) return null;
      return entry.value;
    },

    /**
     * @param {string} key
     * @param {unknown} value
     */
    set(key, value) {
      entries.set(key, { value, expiresAt: Date.now() + ttlMs });
    },

    /**
     * @param {string} key
     * @param {() => Promise<unknown>} producer
     */
    async remember(key, producer) {
      sweep();
      const existing = entries.get(key);
      if (existing?.inflight) return existing.inflight;
      if (existing && existing.expiresAt > Date.now()) return existing.value;

      const inflight = Promise.resolve()
        .then(producer)
        .then((value) => {
          entries.set(key, { value, expiresAt: Date.now() + ttlMs });
          return value;
        })
        .finally(() => {
          const current = entries.get(key);
          if (current?.inflight === inflight) {
            current.inflight = undefined;
          }
        });

      entries.set(key, { value: null, expiresAt: Date.now() + ttlMs, inflight });
      return inflight;
    },
  };
}

/**
 * Canonical hash of an already-normalized payload. Same retry, same key.
 * Different description / services → different key, even with the same email.
 *
 * @param {string} ip
 * @param {unknown} canonicalBody
 */
export function inquiryIdempotencyKey(ip, canonicalBody) {
  const hash = createHash('sha256');
  hash.update(String(ip || 'unknown'));
  hash.update('\0');
  hash.update(JSON.stringify(canonicalBody));
  return hash.digest('hex');
}
