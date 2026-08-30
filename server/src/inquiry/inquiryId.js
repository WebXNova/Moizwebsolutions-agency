import { randomInt } from 'node:crypto';

// Crockford-ish alphabet: no I, L, O, U — an inquiry id gets read aloud on calls.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/**
 * Builds a human-quotable inquiry id such as `MWS-20260826-K7QP`.
 *
 * The date segment makes briefs sortable in a mailbox; the random segment is
 * what actually provides uniqueness, so two submissions in the same millisecond
 * still get distinct ids.
 *
 * @param {Date} date
 * @param {string} [timeZone]
 * @returns {string}
 */
export function createInquiryId(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZone || 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const datePart = `${lookup.year}${lookup.month}${lookup.day}`;

  let suffix = '';
  for (let index = 0; index < 4; index += 1) {
    suffix += ALPHABET[randomInt(ALPHABET.length)];
  }

  return `MWS-${datePart}-${suffix}`;
}

/**
 * @param {Date} date
 * @param {string} [timeZone]
 * @returns {string} e.g. `26 Aug 2026, 04:32 PM (GMT+5)`
 */
export function formatSubmittedAt(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZone || 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).formatToParts(date);

  const at = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${at.day} ${at.month} ${at.year}, ${at.hour}:${at.minute} ${at.dayPeriod} (${at.timeZoneName})`;
}
