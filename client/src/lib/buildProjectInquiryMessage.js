import {
  budgetRanges,
  inquiryServices,
  resolveTimelineOptions,
} from '@/data/projectInquiry';

/**
 * @typedef {object} InquiryForm
 * @property {string[]} services
 * @property {Record<string, string[]>} projectTypes
 * @property {string} description
 * @property {string} currency
 * @property {string} budget
 * @property {string} timeline
 * @property {string} name
 * @property {string} business
 * @property {string} email
 * @property {string} phone
 * @property {string} website
 * @property {string} social
 */

/**
 * Resolves raw form ids into display labels so the review screen, email body
 * and WhatsApp message all read from one source of truth.
 *
 * @param {InquiryForm} form
 */
export function summarizeInquiry(form) {
  const services = inquiryServices.filter((service) => form.services?.includes(service.id));

  const projectTypeGroups = services
    .map((service) => ({
      title: service.title,
      values: form.projectTypes?.[service.id] ?? [],
    }))
    .filter((group) => group.values.length > 0);

  const bands = budgetRanges[form.currency] ?? [];
  const budget = bands.find((band) => band.id === form.budget)?.label ?? '';

  const timelineOptions = resolveTimelineOptions(form.services ?? []);
  const timeline = timelineOptions.find((option) => option.id === form.timeline)?.label ?? '';

  return {
    services,
    serviceTitles: services.map((service) => service.title),
    projectTypeGroups,
    budget,
    timeline,
  };
}

/**
 * @param {InquiryForm} form
 * @returns {string}
 */
export function buildProjectInquiryMessage(form) {
  const { serviceTitles, projectTypeGroups, budget, timeline } = summarizeInquiry(form);

  const lines = [
    'New project inquiry — Moiz Web Solutions',
    '',
    `Services: ${serviceTitles.join(', ') || '—'}`,
    ...projectTypeGroups.map((group) => `${group.title}: ${group.values.join(', ')}`),
    '',
    'Project description:',
    form.description || '—',
    '',
    `Budget (${form.currency}): ${budget || 'Not specified'}`,
    `Preferred timeline: ${timeline || 'Not specified'}`,
    '',
    `Name: ${form.name || '—'}`,
    `Business / brand: ${form.business || '—'}`,
    `Email: ${form.email || '—'}`,
    `WhatsApp / phone: ${form.phone || '—'}`,
  ];

  if (form.website) lines.push(`Current website: ${form.website}`);
  if (form.social) lines.push(`Profile / social link: ${form.social}`);

  return lines.join('\n');
}

/**
 * @param {InquiryForm} form
 * @param {string} email
 * @returns {string}
 */
export function buildProjectInquiryMailto(form, email) {
  const subject = encodeURIComponent('New project inquiry — Moiz Web Solutions');
  const body = encodeURIComponent(buildProjectInquiryMessage(form));
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

/**
 * @param {InquiryForm} form
 * @param {string} phone Digits only, no leading plus
 * @returns {string}
 */
export function buildProjectInquiryWhatsApp(form, phone) {
  const text = encodeURIComponent(buildProjectInquiryMessage(form));
  return `https://wa.me/${phone}?text=${text}`;
}
