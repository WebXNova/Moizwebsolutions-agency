import { defaultSiteSettings } from './defaults.js';
import { asBool, asString, isValidUrl } from '../lib/validators.js';
import { isSafeAssetUrl, isSafeHref } from '../lib/safeUrl.js';

function isDangerousOrInvalidEmbed(value) {
  if (!value) return false;
  if (/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(value)) return false;
  return !isValidUrl(value);
}

export const ALLOWED_SETTING_KEYS = Object.freeze([
  'hero',
  ...Object.keys(defaultSiteSettings),
]);

const CTA_SHAPE = { label: '', url: '' };

/**
 * @param {unknown} value
 */
function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * @param {unknown} value
 * @param {number} [max]
 */
function str(value, max = 2000) {
  return asString(value).slice(0, max);
}

/**
 * @param {unknown} value
 */
function cta(value, errors, fieldName = 'CTA') {
  const source = isPlainObject(value) ? value : {};
  const raw = asString(source.url);
  let url = '';
  if (raw) {
    if (isSafeHref(raw)) url = raw;
    else if (errors) errors.push(`${fieldName} URL is invalid.`);
  }
  return {
    label: str(source.label, 120),
    url,
  };
}

/**
 * @param {unknown} value
 * @param {string} field
 * @param {string[]} errors
 */
function requireValidOptionalUrl(value, field, errors) {
  const raw = asString(value);
  if (!raw) return '';
  if (!isValidUrl(raw)) {
    errors.push(`${field} must be a valid http(s) URL.`);
    return '';
  }
  return raw;
}

/**
 * @param {unknown} value
 */
function stringList(value, maxItems = 16, maxLen = 200) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim().slice(0, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

/**
 * @param {unknown} body
 */
function validateHero(body) {
  const errors = [];
  const source = isPlainObject(body) ? body : {};
  const titleLines = stringList(source.titleLines, 8, 80);
  if (titleLines.length === 0) errors.push('Hero title lines are required.');

  const video = isPlainObject(source.video) ? source.video : {};
  const embedUrl = asString(video.embedUrl);
  if (embedUrl && isDangerousOrInvalidEmbed(embedUrl)) {
    errors.push('Hero video URL is invalid.');
  }

  const imageUrl = str(source.imageUrl, 500);
  if (imageUrl && !isSafeAssetUrl(imageUrl)) {
    errors.push('Hero image URL is invalid.');
  }

  const stat = isPlainObject(source.stat) ? source.stat : {};
  const data = {
    titleLines,
    paragraph: str(source.paragraph, 4000),
    cta: cta(source.cta, errors, 'Hero CTA'),
    secondaryCta: cta(source.secondaryCta ?? CTA_SHAPE, errors, 'Hero secondary CTA'),
    badge: str(source.badge, 80),
    availability: str(source.availability, 160),
    stat: {
      value: str(stat.value, 24),
      label: str(stat.label, 80),
    },
    imageUrl,
    imageAlt: str(source.imageAlt, 200),
    imagePosition: str(source.imagePosition, 40) || 'center',
    visible: asBool(source.visible, true),
    video: {
      title: str(video.title, 160),
      embedUrl,
    },
  };

  return { errors, data };
}

/**
 * @param {unknown} body
 */
function validateSite(body) {
  const errors = [];
  const source = isPlainObject(body) ? body : {};
  const url = requireValidOptionalUrl(source.url, 'Site URL', errors);
  return {
    errors,
    data: {
      name: str(source.name, 120) || defaultSiteSettings.site.name,
      shortName: str(source.shortName, 40),
      tagline: str(source.tagline, 200),
      description: str(source.description, 500),
      url,
      locale: str(source.locale, 16) || 'en',
      timezone: str(source.timezone, 64) || 'UTC',
      copyright: str(source.copyright, 200),
    },
  };
}

/**
 * @param {unknown} body
 */
function validateContact(body) {
  const errors = [];
  const source = isPlainObject(body) ? body : {};
  const mapsUrl = requireValidOptionalUrl(source.mapsUrl, 'Maps URL', errors);
  return {
    errors,
    data: {
      email: str(source.email, 254),
      phone: str(source.phone, 40),
      whatsapp: str(source.whatsapp, 40),
      address: str(source.address, 300),
      officeLocation: str(source.officeLocation, 200),
      businessHours: str(source.businessHours, 200),
      contactCta: str(source.contactCta, 80),
      mapsUrl,
      availability: str(source.availability, 160),
    },
  };
}

/**
 * @param {unknown} body
 */
function validateCta(body) {
  const errors = [];
  const source = isPlainObject(body) ? body : {};
  return {
    errors,
    data: {
      eyebrow: str(source.eyebrow, 80),
      headline: str(source.headline, 200),
      title: str(source.title, 200),
      subtitle: str(source.subtitle, 1000),
      cta: cta(source.cta, errors, 'CTA'),
      secondaryText: str(source.secondaryText, 200),
      visible: asBool(source.visible, true),
    },
  };
}

/**
 * @param {unknown} body
 */
function validateHeroCta(body) {
  const errors = [];
  const source = isPlainObject(body) ? body : {};
  const backgroundImageUrl = str(source.backgroundImageUrl, 500);
  if (backgroundImageUrl && !isSafeAssetUrl(backgroundImageUrl)) {
    errors.push('Background image URL is invalid.');
  }
  return {
    errors,
    data: {
      heading: str(source.heading, 200),
      description: str(source.description, 1000),
      primaryCta: cta(source.primaryCta, errors, 'Primary CTA'),
      secondaryCta: cta(source.secondaryCta, errors, 'Secondary CTA'),
      label: str(source.label, 80),
      backgroundImageUrl,
      visible: asBool(source.visible, true),
    },
  };
}

/**
 * @param {unknown} body
 */
function validateFooter(body) {
  const errors = [];
  const source = isPlainObject(body) ? body : {};
  const links = Array.isArray(source.quickLinks) ? source.quickLinks : [];
  const quickLinks = links.slice(0, 12).map((link, index) => {
    const item = isPlainObject(link) ? link : {};
    const href = str(item.href, 300);
    if (href && !isSafeHref(href)) {
      errors.push(`Footer quick link ${index + 1} has an invalid href.`);
    }
    return { label: str(item.label, 80), href };
  });

  return {
    errors,
    data: {
      tagline: str(source.tagline, 200),
      description: str(source.description, 500),
      visible: asBool(source.visible, true),
      quickLinks,
    },
  };
}

/**
 * @param {unknown} body
 */
function validateSeo(body) {
  const errors = [];
  const source = isPlainObject(body) ? body : {};
  const canonicalUrl = requireValidOptionalUrl(source.canonicalUrl, 'Canonical URL', errors);
  const ogImage = str(source.ogImage, 500);
  if (ogImage && !isSafeAssetUrl(ogImage)) {
    errors.push('Open Graph image URL is invalid.');
  }
  const twitterCard = str(source.twitterCard, 40) || 'summary_large_image';
  if (!['summary', 'summary_large_image'].includes(twitterCard)) {
    errors.push('Twitter card must be summary or summary_large_image.');
  }

  return {
    errors,
    data: {
      homeTitle: str(source.homeTitle, 80),
      homeDescription: str(source.homeDescription, 320),
      defaultKeywords: str(source.defaultKeywords, 400),
      ogTitle: str(source.ogTitle, 80),
      ogDescription: str(source.ogDescription, 320),
      ogImage,
      twitterCard,
      canonicalUrl,
      robots: str(source.robots, 80) || 'index,follow',
    },
  };
}

/**
 * @param {unknown} body
 */
function validateSectionLabels(body) {
  const source = isPlainObject(body) ? body : {};
  return {
    errors: [],
    data: {
      testimonials: str(source.testimonials, 120),
      trustedCompanies: str(source.trustedCompanies, 120),
      technologiesEyebrow: str(source.technologiesEyebrow, 80),
      technologiesTitle: str(source.technologiesTitle, 160),
      technologiesSubtitle: str(source.technologiesSubtitle, 400),
      processEyebrow: str(source.processEyebrow, 80),
      processTitle: str(source.processTitle, 160),
    },
  };
}

/**
 * @param {unknown} body
 */
function validateServicesContent(body) {
  const source = isPlainObject(body) ? body : {};
  return {
    errors: [],
    data: {
      title: str(source.title, 200),
      subtitle: str(source.subtitle, 600),
    },
  };
}

const VALIDATORS = {
  hero: validateHero,
  site: validateSite,
  contact: validateContact,
  cta: validateCta,
  heroCta: validateHeroCta,
  footer: validateFooter,
  seo: validateSeo,
  sectionLabels: validateSectionLabels,
  servicesContent: validateServicesContent,
};

/**
 * @param {string} key
 * @param {unknown} value
 * @returns {{ ok: true; data: unknown } | { ok: false; status: number; code: string; message: string }}
 */
export function validateSetting(key, value) {
  if (!ALLOWED_SETTING_KEYS.includes(key)) {
    return {
      ok: false,
      status: 400,
      code: 'unknown_setting',
      message: 'Unknown settings key.',
    };
  }

  if (!isPlainObject(value)) {
    return {
      ok: false,
      status: 400,
      code: 'validation_failed',
      message: 'Settings value must be a JSON object.',
    };
  }

  const validator = VALIDATORS[key];
  const { errors, data } = validator(value);
  if (errors.length > 0) {
    return {
      ok: false,
      status: 400,
      code: 'validation_failed',
      message: errors[0],
    };
  }

  return { ok: true, data };
}
