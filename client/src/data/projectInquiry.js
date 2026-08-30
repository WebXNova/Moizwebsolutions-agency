/**
 * Central configuration for the project inquiry experience.
 *
 * Everything a non-developer might want to change later — services, project
 * types, budget bands, timelines and copy — lives here rather than in JSX.
 */

/** Ordered wizard steps. */
export const inquirySteps = [
  { id: 'services', index: '01', label: 'Services' },
  { id: 'project', index: '02', label: 'Project' },
  { id: 'contact', index: '03', label: 'Contact' },
  { id: 'review', index: '04', label: 'Review' },
];

/**
 * Service categories. `projectTypes` drives the conditional options shown in
 * step 02, and `timelinePreset` selects the realistic timeline band.
 */
export const inquiryServices = [
  {
    id: 'web-development',
    title: 'Web Development',
    description:
      'Full-stack websites, web applications, dashboards, portals, APIs and integrations.',
    icon: 'development',
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
    description:
      'YouTube long-form, Shorts, Reels, TikTok, promotional videos and social content.',
    icon: 'video',
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
    description:
      'Logos, banners, posters, thumbnails, social graphics and business materials.',
    icon: 'design',
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
    description: 'Logo systems, brand identity, visual direction and brand assets.',
    icon: 'brand',
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
    description:
      'Landing pages, UI systems, website themes, dashboards and responsive interfaces.',
    icon: 'theme',
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
    description: 'Anything outside the listed categories — tell us what you have in mind.',
    icon: 'other',
    timelinePreset: 'default',
    projectTypes: [],
  },
];

/** Currencies offered in the budget step. First entry is the default. */
export const currencies = [
  { id: 'PKR', label: 'PKR', symbol: 'PKR' },
  { id: 'USD', label: 'USD', symbol: '$' },
];

/**
 * Budget qualification bands — not advertised prices. Edit freely; ids are only
 * used internally so labels can change without breaking anything.
 */
export const budgetRanges = {
  PKR: [
    { id: 'pkr-under-25k', label: 'Under PKR 25,000' },
    { id: 'pkr-25-50k', label: 'PKR 25,000 – 50,000' },
    { id: 'pkr-50-100k', label: 'PKR 50,000 – 100,000' },
    { id: 'pkr-100-200k', label: 'PKR 100,000 – 200,000' },
    { id: 'pkr-200-500k', label: 'PKR 200,000 – 500,000' },
    { id: 'pkr-500k-plus', label: 'PKR 500,000+' },
    { id: 'pkr-not-sure', label: 'Not sure yet' },
  ],
  USD: [
    { id: 'usd-under-100', label: 'Under $100' },
    { id: 'usd-100-300', label: '$100 – $300' },
    { id: 'usd-300-750', label: '$300 – $750' },
    { id: 'usd-750-1500', label: '$750 – $1,500' },
    { id: 'usd-1500-3000', label: '$1,500 – $3,000' },
    { id: 'usd-3000-plus', label: '$3,000+' },
    { id: 'usd-not-sure', label: 'Not sure yet' },
  ],
};

/**
 * Timeline bands per kind of work. A logo does not need the same options as a
 * full-stack application, so each service points at one of these presets.
 */
export const timelinePresets = {
  fast: [
    { id: 'asap', label: 'ASAP' },
    { id: '2-3-days', label: '2–3 days' },
    { id: '1-week', label: 'Within 1 week' },
    { id: 'flexible', label: 'Flexible' },
  ],
  media: [
    { id: '1-3-days', label: '1–3 days' },
    { id: '3-7-days', label: '3–7 days' },
    { id: '1-2-weeks', label: '1–2 weeks' },
    { id: 'flexible', label: 'Flexible' },
  ],
  build: [
    { id: '1-2-weeks', label: '1–2 weeks' },
    { id: '2-4-weeks', label: '2–4 weeks' },
    { id: '1-2-months', label: '1–2 months' },
    { id: '2-3-months', label: '2–3 months' },
    { id: 'flexible', label: 'Flexible' },
  ],
  default: [
    { id: 'asap', label: 'ASAP' },
    { id: '1-week', label: 'Within 1 week' },
    { id: '1-2-weeks', label: '1–2 weeks' },
    { id: '2-4-weeks', label: '2–4 weeks' },
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
  const presets = inquiryServices
    .filter((service) => serviceIds.includes(service.id))
    .map((service) => service.timelinePreset);

  if (presets.length === 0) return timelinePresets.default;

  const winner = PRESET_PRIORITY.find((preset) => presets.includes(preset));
  return timelinePresets[winner ?? 'default'];
}

/**
 * @param {string[]} serviceIds
 * @returns {{ id: string; title: string; projectTypes: string[] }[]}
 */
export function resolveProjectTypeGroups(serviceIds) {
  return inquiryServices.filter(
    (service) => serviceIds.includes(service.id) && service.projectTypes.length > 0,
  );
}

export const inquiryContent = {
  title: 'Let\u2019s build something great.',
  subtitle: 'Tell us what you\u2019re building. We\u2019ll help shape the right digital solution.',
  steps: {
    services: {
      heading: 'What can we help you with?',
      hint: 'Select everything that applies — you can pick more than one.',
    },
    project: {
      heading: 'Tell us about the project.',
      hint: 'A few details are enough. We\u2019ll follow up with the right questions.',
    },
    contact: {
      heading: 'How can we reach you?',
      hint: 'We reply to every enquiry within two working days.',
    },
    review: {
      heading: 'Review your brief.',
      hint: 'Check everything looks right before you send it over.',
    },
  },
  submitLabel: 'Send via email',
  sendingLabel: 'Sending\u2026',
  sentLabel: 'Sent',
  retryLabel: 'Try again',
  successTitle: 'Project request sent',
  successSubtitle:
    'Your project brief has been successfully sent to Moiz Web Solutions. We reply to every enquiry within two working days.',
  confirmationNote:
    'A copy of your brief is on its way to your inbox. If it isn\u2019t there in a few minutes, check your spam folder.',
};
