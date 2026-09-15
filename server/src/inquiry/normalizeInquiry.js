import { isDangerousUrl } from '../lib/safeUrl.js';
import {
  budgetRanges,
  currencies,
  findService,
  resolveTimelineOptions,
} from './catalog.js';

/**
 * Server-side validation and normalization for a submitted project brief.
 *
 * The browser validates first for fast feedback, but nothing here trusts that:
 * every field is re-checked, trimmed, length-capped and — for anything with a
 * fixed set of options — resolved back to a label from the trusted catalog.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LIMITS = {
  name: 120,
  business: 160,
  email: 254,
  phone: 40,
  website: 300,
  social: 300,
  description: 5000,
  services: 8,
  projectTypesPerService: 24,
};

/** Strips control characters that have no business in an email header or body. */
function clean(value, maxLength) {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, maxLength);
}

/** Header-injection guard: newlines must never reach Subject/Reply-To. */
function cleanSingleLine(value, maxLength) {
  return clean(value, maxLength).replace(/[\r\n]+/g, ' ');
}

/** Preserves paragraphs but collapses runaway blank-line padding. */
function cleanMultiline(value, maxLength) {
  return clean(value, maxLength).replace(/\r\n/g, '\n').replace(/\n{4,}/g, '\n\n\n');
}

/**
 * @typedef {object} NormalizedInquiry
 * @property {{ name: string; business: string; email: string; phone: string; website: string; social: string }} client
 * @property {{ id: string; title: string }[]} services
 * @property {string[]} serviceTitles
 * @property {{ title: string; values: string[] }[]} projectTypeGroups
 * @property {string} projectTypeSummary
 * @property {string} description
 * @property {{ currency: string; rangeLabel: string }} budget
 * @property {string} timeline
 */

/**
 * @param {unknown} body
 * @returns {{ ok: true; data: NormalizedInquiry } | { ok: false; errors: Record<string, string> }}
 */
export function normalizeInquiry(body) {
  /** @type {Record<string, string>} */
  const errors = {};
  const input = body && typeof body === 'object' ? /** @type {Record<string, unknown>} */ (body) : {};

  const name = cleanSingleLine(input.name, LIMITS.name);
  if (name.length < 2) errors.name = 'Please tell us your name.';

  const email = cleanSingleLine(input.email, LIMITS.email).toLowerCase();
  if (!email) errors.email = 'An email address is required.';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Please enter a valid email address.';

  const business = cleanSingleLine(input.business, LIMITS.business);
  const phone = cleanSingleLine(input.phone, LIMITS.phone);
  const website = cleanSingleLine(input.website, LIMITS.website);
  const social = cleanSingleLine(input.social, LIMITS.social);
  if (website && isDangerousUrl(website)) {
    errors.website = 'Enter a normal website address, not a script or data URL.';
  }
  if (social && isDangerousUrl(social)) {
    errors.social = 'Enter a normal profile link, not a script or data URL.';
  }

  const rawServices = Array.isArray(input.services) ? input.services : [];
  const serviceIds = [...new Set(rawServices.filter((id) => typeof id === 'string'))].slice(
    0,
    LIMITS.services,
  );
  const services = serviceIds.map(findService).filter(Boolean);

  if (services.length === 0) errors.services = 'Select at least one service.';
  else if (services.length !== serviceIds.length) {
    errors.services = 'One or more selected services are not recognised.';
  }

  const description = cleanMultiline(input.description, LIMITS.description);
  if (description.length < 10) {
    errors.description = 'A sentence or two about the project helps us respond properly.';
  }

  const currency = typeof input.currency === 'string' ? input.currency.toUpperCase() : '';
  const resolvedCurrency = currencies.includes(currency) ? currency : '';
  if (!resolvedCurrency) errors.currency = 'Choose a currency.';

  // Budget and timeline stay optional — matching the form — but when supplied
  // they must be a real option for the chosen currency and service mix.
  let budgetLabel = '';
  const budgetId = typeof input.budget === 'string' ? input.budget : '';
  if (budgetId && resolvedCurrency) {
    const band = (budgetRanges[resolvedCurrency] ?? []).find((entry) => entry.id === budgetId);
    if (!band) errors.budget = 'That budget range is not recognised.';
    else budgetLabel = band.label;
  }

  let timelineLabel = '';
  const timelineId = typeof input.timeline === 'string' ? input.timeline : '';
  if (timelineId) {
    const option = resolveTimelineOptions(serviceIds).find((entry) => entry.id === timelineId);
    if (!option) errors.timeline = 'That timeline is not recognised.';
    else timelineLabel = option.label;
  }

  const rawProjectTypes =
    input.projectTypes && typeof input.projectTypes === 'object'
      ? /** @type {Record<string, unknown>} */ (input.projectTypes)
      : {};

  const projectTypeGroups = services
    .map((service) => {
      const submitted = Array.isArray(rawProjectTypes[service.id])
        ? /** @type {unknown[]} */ (rawProjectTypes[service.id])
        : [];

      // Only labels the catalog offers for this service survive.
      const values = service.projectTypes
        .filter((type) => submitted.includes(type))
        .slice(0, LIMITS.projectTypesPerService);

      return { title: service.title, values };
    })
    .filter((group) => group.values.length > 0);

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      client: { name, business, email, phone, website, social },
      services: services.map((service) => ({ id: service.id, title: service.title })),
      serviceTitles: services.map((service) => service.title),
      projectTypeGroups,
      projectTypeSummary: projectTypeGroups
        .map((group) => `${group.title} — ${group.values.join(', ')}`)
        .join(' · '),
      description,
      budget: { currency: resolvedCurrency, rangeLabel: budgetLabel },
      timeline: timelineLabel,
    },
  };
}

/**
 * Subject-line summary of the selected services, e.g. `Web Development +2 more`.
 *
 * @param {string[]} serviceTitles
 */
export function summarizeServices(serviceTitles) {
  if (serviceTitles.length === 0) return 'Project inquiry';
  if (serviceTitles.length === 1) return serviceTitles[0];
  if (serviceTitles.length === 2) return `${serviceTitles[0]} + ${serviceTitles[1]}`;
  return `${serviceTitles[0]} +${serviceTitles.length - 1} more`;
}
