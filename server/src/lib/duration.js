/**
 * Parse JWT-style durations: `3600`, `15m`, `12h`, `7d`, `1w`.
 *
 * @param {string} value
 * @returns {number | null} milliseconds, or null when invalid
 */
export function durationToMs(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const match = /^(\d+)([smhdw])?$/i.exec(value.trim());
  if (!match) return null;
  const amount = Number.parseInt(match[1], 10);
  if (!Number.isFinite(amount) || amount < 1) return null;
  const unit = (match[2] || 's').toLowerCase();
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };
  return amount * multipliers[unit];
}
