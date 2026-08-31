import { heroContent as fallbackHero } from '@/data/hero';
import { serviceGroups, servicesContent as fallbackServicesContent } from '@/data/services';
import { testimonials as fallbackTestimonials, testimonialsContent } from '@/data/testimonials';
import { trustedCompanies as fallbackCompanies, trustedCompaniesContent } from '@/data/trustedCompanies';
import { technologies as fallbackTechnologies, technologiesContent } from '@/data/technologies';
import { processSteps as fallbackProcess, processContent } from '@/data/process';
import { contactConfig, finalCtaContent } from '@/config/contact';
import { siteConfig } from '@/config/site';
import { socialLinks as fallbackSocial } from '@/config/social';
import { navigationLinks } from '@/data/navigation';
import { assets } from '@/config/assets';

/**
 * Prevents awkward single-word line breaks from legacy CMS hero copy.
 * @param {string[] | undefined} lines
 */
function normalizeHeroTitleLines(lines) {
  if (!lines?.length) return fallbackHero.titleLines;

  if (
    lines.length === 4 &&
    lines[1]?.toLowerCase() === 'something' &&
    lines[2]?.toLowerCase() === 'great'
  ) {
    return [lines[0], 'something great', lines[3]];
  }

  return lines;
}

/**
 * @param {Record<string, unknown> | null | undefined} apiHero
 */
export function resolveHero(apiHero) {
  if (!apiHero) return fallbackHero;
  return {
    titleLines: normalizeHeroTitleLines(
      /** @type {string[] | undefined} */ (apiHero.titleLines),
    ),
    paragraph: apiHero.paragraph || fallbackHero.paragraph,
    cta: apiHero.cta || fallbackHero.cta,
    secondaryCta: apiHero.secondaryCta || { label: '', url: '' },
    stat: apiHero.stat || fallbackHero.stat,
    visual: apiHero.imageUrl
      ? { src: apiHero.imageUrl, alt: apiHero.imageAlt || '', width: 1448, height: 1086 }
      : fallbackHero.visual,
    video: apiHero.video || fallbackHero.video,
    badge: apiHero.badge || '',
    availability: apiHero.availability || '',
    visible: apiHero.visible !== false,
    imagePosition: apiHero.imagePosition || 'center',
  };
}

/**
 * @param {Array<Record<string, unknown>> | null | undefined} apiServices
 */
export function resolveServiceGroups(apiServices) {
  if (!Array.isArray(apiServices)) return serviceGroups;
  return apiServices.map((service) => ({
    id: service.slug || service.id,
    icon: service.icon,
    label: service.label || service.title,
    title: service.title,
    description: service.description,
    details: service.details || [],
  }));
}

/**
 * @param {Record<string, unknown> | null | undefined} apiContent
 */
export function resolveServicesContent(apiContent) {
  return {
    title: apiContent?.title || fallbackServicesContent.title,
    subtitle: apiContent?.subtitle || fallbackServicesContent.subtitle,
  };
}

/**
 * @param {Array<Record<string, unknown>> | null | undefined} apiItems
 */
export function resolveTestimonials(apiItems) {
  if (!Array.isArray(apiItems)) return fallbackTestimonials;
  return apiItems.map((item) => ({
    id: item.id,
    quote: item.quote,
    author: item.author,
    role: item.role,
    company: item.company,
    avatar: item.avatarUrl || item.avatar,
    verified: item.verified,
  }));
}

export function resolveTestimonialsLabel(apiLabels) {
  return apiLabels?.testimonials || testimonialsContent.label;
}

/**
 * @param {Array<Record<string, unknown>> | null | undefined} apiItems
 */
export function resolveTrustedCompanies(apiItems) {
  if (!Array.isArray(apiItems)) return fallbackCompanies;
  return apiItems.map((item) => ({
    id: item.id,
    name: item.name,
    logo: item.logoUrl || item.logo,
    width: item.width || 120,
    height: item.height || 32,
    websiteUrl: item.websiteUrl,
    logoAlt: item.logoAlt || item.name,
  }));
}

export function resolveTrustedCompaniesLabel(apiLabels) {
  return apiLabels?.trustedCompanies || trustedCompaniesContent.label;
}

/**
 * @param {Array<Record<string, unknown>> | null | undefined} apiItems
 */
export function resolveTechnologies(apiItems) {
  if (!Array.isArray(apiItems)) return fallbackTechnologies;
  return apiItems.map((item) => ({
    id: item.slug || item.id,
    name: item.name,
    category: item.category,
    logo: item.logoUrl || item.logo,
    color: item.color,
    invertOnDark: item.invertOnDark,
    width: item.width || 24,
    height: item.height || 24,
  }));
}

/**
 * @param {Record<string, unknown> | null | undefined} apiLabels
 */
export function resolveTechnologiesContent(apiLabels) {
  return {
    eyebrow: apiLabels?.technologiesEyebrow || technologiesContent.eyebrow,
    title: apiLabels?.technologiesTitle || technologiesContent.title,
    subtitle: apiLabels?.technologiesSubtitle || technologiesContent.subtitle,
  };
}

/**
 * @param {Array<Record<string, unknown>> | null | undefined} apiSteps
 */
export function resolveProcessSteps(apiSteps) {
  if (!Array.isArray(apiSteps)) return fallbackProcess;
  return apiSteps.map((step) => ({
    id: step.id,
    step: step.stepNumber,
    number: String(step.stepNumber),
    title: step.title,
    icon: step.icon,
    description: step.description,
  }));
}

/**
 * @param {Record<string, unknown> | null | undefined} apiLabels
 */
export function resolveProcessContent(apiLabels) {
  return {
    eyebrow: apiLabels?.processEyebrow || processContent.eyebrow,
    title: apiLabels?.processTitle || processContent.title,
  };
}

/**
 * @param {Record<string, unknown> | null | undefined} apiCta
 */
export function resolveFinalCta(apiCta) {
  if (!apiCta) return finalCtaContent;
  return {
    eyebrow: apiCta.eyebrow || finalCtaContent.eyebrow,
    headline: apiCta.headline || '',
    title: apiCta.title || finalCtaContent.title,
    subtitle: apiCta.subtitle || finalCtaContent.subtitle,
    cta: apiCta.cta || finalCtaContent.cta,
  };
}

/**
 * @param {Record<string, unknown> | null | undefined} apiContact
 */
export function resolveContactConfig(apiContact) {
  if (!apiContact) return contactConfig;
  return {
    email: apiContact.email || contactConfig.email,
    phone: apiContact.phone || contactConfig.phone,
    address: apiContact.address || contactConfig.address,
    availability: apiContact.availability || contactConfig.availability,
    whatsapp: apiContact.whatsapp || '',
    mapsUrl: apiContact.mapsUrl || '',
  };
}

/**
 * @param {Record<string, unknown> | null | undefined} apiSite
 */
export function resolveSiteConfig(apiSite) {
  if (!apiSite) return siteConfig;
  return {
    name: apiSite.name || siteConfig.name,
    shortName: apiSite.shortName || siteConfig.shortName,
    tagline: apiSite.tagline || siteConfig.tagline,
    description: apiSite.description || siteConfig.description,
    url: apiSite.url || siteConfig.url,
    locale: apiSite.locale || siteConfig.locale,
    copyright: apiSite.copyright,
  };
}

/**
 * @param {Array<Record<string, unknown>> | null | undefined} apiLinks
 */
export function resolveSocialLinks(apiLinks) {
  if (!Array.isArray(apiLinks)) return fallbackSocial;
  return apiLinks.map((link) => ({
    platform: link.platform,
    href: link.href,
    label: link.label || link.platform,
  }));
}

/**
 * @param {Array<Record<string, unknown>> | null | undefined} apiNav
 */
export function resolveNavigation(apiNav) {
  if (!Array.isArray(apiNav)) return navigationLinks;
  return apiNav.map((item) => ({
    label: item.label,
    href: item.href,
  }));
}

export { assets };
