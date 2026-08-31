export const TALK_ROUTE = '/contact';

/** Canonical comparison pricing for the value card. Amounts are PKR. */
export const featurePricing = {
  max: 200000,
  starting: 40000,
  currency: 'PKR',
};

/**
 * Manual mid-market PKR → USD reference for the value card only.
 * Update this constant when the advertised conversion should change.
 */
export const PKR_TO_USD_RATE = 278;

/** @typedef {'PKR' | 'USD'} FeatureCurrency */

/**
 * @param {number} amountPkr
 * @param {FeatureCurrency} currency
 */
export function convertFeaturePrice(amountPkr, currency) {
  if (currency === 'USD') return Math.round(amountPkr / PKR_TO_USD_RATE);
  return amountPkr;
}

/**
 * Pakistani grouping for PKR (`2,00,000`); Western grouping for USD.
 * @param {number} amount
 * @param {FeatureCurrency} currency
 */
export function formatFeatureAmount(amount, currency) {
  const locale = currency === 'USD' ? 'en-US' : 'en-IN';
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(amount);
}

/**
 * @param {string} prefix
 * @param {number} amountPkr
 * @param {FeatureCurrency} currency
 */
export function formatFeaturePriceLine(prefix, amountPkr, currency) {
  const converted = convertFeaturePrice(amountPkr, currency);
  return `${prefix} ${currency} ${formatFeatureAmount(converted, currency)}`;
}

export const featureHighlightsContent = {
  brandLabel: 'MOIZ WEB SOLUTIONS (MWS)',
  pricingLabel: '// Pricing',
  supportLabel: '// Support',
  saveBadge: 'Save up to 80%',
  costHeading: 'Save money without sacrificing quality',
  costDescription:
    'Cut overhead, not quality. Pay for the work, not the org chart between you and the engineer.',
  othersLabel: 'Others',
  othersPrefix: 'Up to',
  oursPrefix: 'From',
  supportValue: '24h',
  supportDescription: 'Email us anytime \u2014 a real reply within a day.',
  focusHeading: 'Focus on your business.',
  focusSubheading: 'We\u2019ll handle the web.',
  advantages: ['Senior engineers', 'Bespoke design', 'Post-launch care'],
  ctaLabel: 'Get a project estimate',
  ctaHref: TALK_ROUTE,
};
