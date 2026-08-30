/**
 * Trusted copy of the inquiry catalog.
 *
 * The browser only ever sends ids. Every human-readable label in the email is
 * resolved from this file, so a tampered request cannot inject its own service
 * names, budget bands or timelines into the message.
 *
 * This mirrors `client/src/data/projectInquiry.js`. `npm run check:catalog`
 * diffs the two and fails if they drift apart.
 */

export const services = [
  {
    id: 'web-development',
    title: 'Web Development',
    timelinePreset: 'build',
    projectTypes: [
      'Business website',
      'Portfolio website',
      'E-commerce',
      'Web application',
      'Dashboard',
      'Student / client portal',
      'API / integration',
      'Existing website redesign',
      'Maintenance / improvements',
      'Other',
    ],
  },
  {
    id: 'video-editing',
    title: 'Video Editing',
    timelinePreset: 'media',
    projectTypes: [
      'YouTube long-form',
      'Shorts',
      'Reels',
      'TikTok',
      'Promotional',
      'Corporate',
      'Social media package',
    ],
  },
  {
    id: 'graphic-design',
    title: 'Graphic Design',
    timelinePreset: 'fast',
    projectTypes: [
      'Logo',
      'Branding',
      'Banner',
      'Poster',
      'Social media',
      'Thumbnail',
      'Brochure',
      'Business material',
    ],
  },
  {
    id: 'branding',
    title: 'Branding & Logo',
    timelinePreset: 'fast',
    projectTypes: [
      'Logo system',
      'Brand identity',
      'Brand guidelines',
      'Visual direction',
      'Brand assets',
    ],
  },
  {
    id: 'ui-themes',
    title: 'UI / Themes',
    timelinePreset: 'build',
    projectTypes: [
      'Landing page',
      'Website UI',
      'Dashboard',
      'Theme customization',
      'Design system',
    ],
  },
  {
    id: 'other',
    title: 'Other',
    timelinePreset: 'default',
    projectTypes: [],
  },
];

export const currencies = ['PKR', 'USD'];

export const budgetRanges = {
  PKR: [
    { id: 'pkr-under-25k', label: 'Under PKR 25,000' },
    { id: 'pkr-25-50k', label: 'PKR 25,000 \u2013 50,000' },
    { id: 'pkr-50-100k', label: 'PKR 50,000 \u2013 100,000' },
    { id: 'pkr-100-200k', label: 'PKR 100,000 \u2013 200,000' },
    { id: 'pkr-200-500k', label: 'PKR 200,000 \u2013 500,000' },
    { id: 'pkr-500k-plus', label: 'PKR 500,000+' },
    { id: 'pkr-not-sure', label: 'Not sure yet' },
  ],
  USD: [
    { id: 'usd-under-100', label: 'Under $100' },
    { id: 'usd-100-300', label: '$100 \u2013 $300' },
    { id: 'usd-300-750', label: '$300 \u2013 $750' },
    { id: 'usd-750-1500', label: '$750 \u2013 $1,500' },
    { id: 'usd-1500-3000', label: '$1,500 \u2013 $3,000' },
    { id: 'usd-3000-plus', label: '$3,000+' },
    { id: 'usd-not-sure', label: 'Not sure yet' },
  ],
};

export const timelinePresets = {
  fast: [
    { id: 'asap', label: 'ASAP' },
    { id: '2-3-days', label: '2\u20133 days' },
    { id: '1-week', label: 'Within 1 week' },
    { id: 'flexible', label: 'Flexible' },
  ],
  media: [
    { id: '1-3-days', label: '1\u20133 days' },
    { id: '3-7-days', label: '3\u20137 days' },
    { id: '1-2-weeks', label: '1\u20132 weeks' },
    { id: 'flexible', label: 'Flexible' },
  ],
  build: [
    { id: '1-2-weeks', label: '1\u20132 weeks' },
    { id: '2-4-weeks', label: '2\u20134 weeks' },
    { id: '1-2-months', label: '1\u20132 months' },
    { id: '2-3-months', label: '2\u20133 months' },
    { id: 'flexible', label: 'Flexible' },
  ],
  default: [
    { id: 'asap', label: 'ASAP' },
    { id: '1-week', label: 'Within 1 week' },
    { id: '1-2-weeks', label: '1\u20132 weeks' },
    { id: '2-4-weeks', label: '2\u20134 weeks' },
    { id: 'flexible', label: 'Flexible' },
  ],
};

/** Longest-running work wins when several services are selected together. */
const PRESET_PRIORITY = ['build', 'media', 'fast', 'default'];

/**
 * @param {string[]} serviceIds
 * @returns {{ id: string; label: string }[]}
 */
export function resolveTimelineOptions(serviceIds) {
  const presets = services
    .filter((service) => serviceIds.includes(service.id))
    .map((service) => service.timelinePreset);

  if (presets.length === 0) return timelinePresets.default;

  const winner = PRESET_PRIORITY.find((preset) => presets.includes(preset));
  return timelinePresets[winner ?? 'default'];
}

/**
 * @param {string} id
 */
export function findService(id) {
  return services.find((service) => service.id === id) ?? null;
}
