import { timingSafeEqual } from 'node:crypto';

/**
 * Constant-time string compare. Different lengths still fail closed without
 * returning early on the first mismatched character of equal-length values.
 *
 * @param {unknown} left
 * @param {unknown} right
 */
export function secretsEqual(left, right) {
  const a = Buffer.from(String(left ?? ''), 'utf8');
  const b = Buffer.from(String(right ?? ''), 'utf8');
  if (a.length !== b.length) {
    const dummy = a.length ? a : Buffer.from([0]);
    timingSafeEqual(dummy, dummy);
    return false;
  }
  if (a.length === 0) return false;
  return timingSafeEqual(a, b);
}
