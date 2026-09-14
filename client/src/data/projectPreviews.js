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
 * @property {Array<{ objectPosition: string; alt?: string; zoom?: number }>} [galleryCrops]
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
    galleryCrops: [
      { objectPosition: 'center top', zoom: 1, alt: 'MRB Classes homepage hero' },
      { objectPosition: 'left top', zoom: 1, alt: 'MRB Classes left features' },
      { objectPosition: 'center 30%', zoom: 1, alt: 'MRB Classes feature cards' },
      { objectPosition: 'right top', zoom: 1, alt: 'MRB Classes right features' },
      { objectPosition: 'center 60%', zoom: 1, alt: 'MRB Classes lower section' },
    ],
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
      objectPosition: project.previewObjectPosition || 'center top',
      objectPositionMd: project.previewObjectPosition || 'center top',
      objectPositionLg: project.previewObjectPosition || 'center top',
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
    galleryCrops: config.galleryCrops,
  };
}

const DEFAULT_GALLERY_CROPS = [
  { objectPosition: 'center top', zoom: 1 },
  { objectPosition: 'left top', zoom: 1 },
  { objectPosition: 'center 30%', zoom: 1 },
  { objectPosition: 'right top', zoom: 1 },
  { objectPosition: 'center 60%', zoom: 1 },
];

/**
 * Five static preview tiles for the Our Works mosaic. Unique gallery URLs win;
 * remaining slots reuse the main screenshot with distinct crops.
 *
 * @param {import('@/types').PortfolioProject} project
 * @returns {Array<{ src: string; alt: string; width?: number; height?: number; objectPosition: string; zoom: number }>}
 */
export function resolveProjectGallery(project) {
  const preview = resolveProjectPreview(project);
  const crops = preview.galleryCrops?.length ? preview.galleryCrops : DEFAULT_GALLERY_CROPS;
  const extras = Array.isArray(project.gallery)
    ? project.gallery.map((url) => resolveImageUrl(url)).filter(Boolean)
    : [];

  /** @type {Array<{ src: string; alt: string; width?: number; height?: number; objectPosition: string }>} */
  const images = [];

  extras.forEach((src, index) => {
    if (!src || images.length >= 5) return;
    images.push({
      src,
      alt: `${project.title} preview ${index + 1}`,
      objectPosition: 'center top',
      zoom: 1,
    });
  });

  if (preview.src) {
    let cropIndex = 0;
    while (images.length < 5 && cropIndex < crops.length) {
      const crop = crops[cropIndex];
      images.push({
        src: preview.src,
        alt: crop.alt || preview.alt || `${project.title} preview ${images.length + 1}`,
        width: preview.width,
        height: preview.height,
        objectPosition: crop.objectPosition,
        zoom: crop.zoom ?? (cropIndex === 0 ? 1 : 2.1),
      });
      cropIndex += 1;
    }
  }

  return images.slice(0, 5);
}
