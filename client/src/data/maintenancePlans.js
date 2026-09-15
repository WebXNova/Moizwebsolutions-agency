/**
 * Copy and pricing for the homepage Maintenance Plans section.
 *
 * @typedef {Object} MaintenancePlan
 * @property {'essentials' | 'growth'} id
 * @property {string} name
 * @property {string} description
 * @property {string} currency
 * @property {string} amount
 * @property {string} period
 * @property {string} cta
 * @property {string[]} includes
 * @property {string[]} tags
 * @property {boolean} [popular]
 */

export const maintenancePlansContent = {
  label: 'Care & Maintenance Plans',
  headingHighlight: 'Maintenance',
  headingRest: 'plans.',
  headingLine2: 'Built for the long run.',
  subtextLines: ['Pick the plan that fits your site.', 'Upgrade anytime.'],
  includedLabel: "What's Included",
  popularLabel: 'Most Popular',
};

/** @type {MaintenancePlan[]} */
export const maintenancePlans = [
  {
    id: 'essentials',
    name: 'Essentials',
    description: 'Portfolios, landing pages, brochure sites.',
    currency: 'PKR',
    amount: '6,499',
    period: '/mo',
    cta: 'Choose Essentials',
    popular: false,
    tags: ['NEXT.JS'],
    includes: [
      'Uptime monitoring (99.9% guaranteed)',
      'Monthly dependency audits & security patches',
      'SSL certificate & domain renewal management',
      'Weekly automated backups (code + database)',
      '1 hour/month of content or text updates',
      'Email support (48-hour response)',
      'Monthly performance report',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Business websites, CMS-driven sites, service businesses.',
    currency: 'PKR',
    amount: '9,499',
    period: '/mo',
    cta: 'Choose Growth',
    popular: true,
    tags: ['NEXT.JS', 'VERCEL'],
    includes: [
      'Everything in Essentials',
      'Daily automated backups',
      'Next.js & npm dependency updates (minor + patch)',
      'Core Web Vitals & performance monitoring',
      'Error tracking with Sentry (setup + monitoring)',
      '4 hours/month of content, design, or feature updates',
      'Technical SEO (sitemap, meta tags, schema)',
      'Priority email support (24-hour response)',
      'Monthly analytics & performance report',
    ],
  },
];
