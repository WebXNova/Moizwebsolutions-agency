/**
 * Homepage sections in scroll order — ids must match DOM `id` attributes.
 * @type {Array<{ id: string; label: string }>}
 */
export const HOME_SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'our-works', label: 'Our Works' },
  { id: 'trusted-companies', label: 'Trusted Companies' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'our-services', label: 'Our Services' },
  { id: 'technologies', label: 'Technologies' },
  { id: 'value', label: 'Value' },
  { id: 'process', label: 'Process' },
  { id: 'contact', label: 'Contact' },
];

/** @type {string[]} */
export const HOME_SECTION_IDS = HOME_SECTIONS.map((section) => section.id);

/**
 * Maps a section index to a vertical position (0–100) along the line.
 * @param {number} index
 * @param {number} total
 */
export function sectionIndexToPosition(index, total) {
  if (total <= 1 || index < 0) return 6;
  const padding = 6;
  const span = 100 - padding * 2;
  return padding + (index / (total - 1)) * span;
}

/**
 * @param {string | null | undefined} sectionId
 * @returns {string | null}
 */
export function getSectionLabel(sectionId) {
  return HOME_SECTIONS.find((section) => section.id === sectionId)?.label ?? null;
}
