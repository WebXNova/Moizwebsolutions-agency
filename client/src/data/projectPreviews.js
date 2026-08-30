import { assets } from '@/config/assets';
import { apiUrl } from '@/config/api';

/**
 * Client-side website-preview crop settings, keyed by project slug.
 * Lets each screenshot keep its own framing without a separate card component.
 *
 * @typedef {Object} ProjectPreviewConfig
 * @property {string} src
 * @property {string} alt
 * @property {number} [width]
 * @property {number} [height]
 * @property {'website' | 'cover'} [mode]
 * @property {string} [objectPosition]
 * @property {string} [objectPositionMd]
 * @property {string} [objectPositionLg]
 * @property {number} [scale]
 * @property {string} [shiftY]
 * @property {string} [shiftYMd]
 * @property {string} [shiftYLg]
 * @property {number} [parallax]
 */

/** @type {Record<string, ProjectPreviewConfig>} */
export const projectPreviews = {
  'mrb-classes': {
    src: assets.work.mrbClasses.src,
    alt: assets.work.mrbClasses.alt,
    width: assets.work.mrbClasses.width,
    height: assets.work.mrbClasses.height,
    mode: 'website',
    // Pin the header / hero; the navy panel already tucks under the feature cards.
    objectPosition: 'center 12%',
    objectPositionMd: 'center 10%',
    objectPositionLg: 'center 8%',
    scale: 1,
    shiftY: '0px',
    shiftYMd: '0px',
    shiftYLg: '0px',
    parallax: 8,
  },
};

/**
 * @param {string} url
 */
export function resolveImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) return apiUrl(url);
  return url;
}

/**
 * @param {Pick<import('@/types').PortfolioProject, 'slug' | 'title'>} project
 * @returns {ProjectPreviewConfig | null}
 */
export function getProjectPreviewConfig(project) {
  const slug = (project.slug || '').toLowerCase();
  if (projectPreviews[slug]) return projectPreviews[slug];

  const title = (project.title || '').toLowerCase();
  if (title.includes('mrb') && title.includes('class')) {
    return projectPreviews['mrb-classes'];
  }

  return null;
}

/**
 * @param {import('@/types').PortfolioProject} project
 */
export function resolveProjectPreview(project) {
  const config = getProjectPreviewConfig(project);
  const fallbackSrc = resolveImageUrl(project.imageUrl);

  if (!config) {
    return {
      src: fallbackSrc,
      alt: `${project.title} website project preview`,
      mode: /** @type {const} */ ('cover'),
      objectPosition: 'center top',
      objectPositionMd: 'center top',
      objectPositionLg: 'center top',
      scale: 1,
      shiftY: '0px',
      shiftYMd: '0px',
      shiftYLg: '0px',
      parallax: 6,
    };
  }

  return {
    src: config.src || fallbackSrc,
    alt: config.alt || `${project.title} website project preview`,
    width: config.width,
    height: config.height,
    mode: config.mode ?? 'website',
    objectPosition: config.objectPosition ?? 'center 18%',
    objectPositionMd: config.objectPositionMd ?? config.objectPosition ?? 'center 14%',
    objectPositionLg: config.objectPositionLg ?? config.objectPositionMd ?? config.objectPosition ?? 'center 10%',
    scale: config.scale ?? 1,
    shiftY: config.shiftY ?? '0px',
    shiftYMd: config.shiftYMd ?? config.shiftY ?? '0px',
    shiftYLg: config.shiftYLg ?? config.shiftYMd ?? config.shiftY ?? '0px',
    parallax: config.parallax ?? 8,
  };
}
