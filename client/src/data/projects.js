import { assets } from '@/config/assets';

/** Static samples used when the API is unavailable. Live projects come from the CMS. */
/** @type {import('@/types').Project[]} */
export const projects = [
  {
    id: 'project-commerce',
    title: 'Northbound Supply',
    category: 'E-Commerce',
    year: '2025',
    description:
      'A catalogue and checkout rebuild that cut load time in half and simplified a sprawling product taxonomy.',
    tags: ['React', 'Tailwind CSS', 'MySQL'],
    image: assets.work.commerce,
    featured: true,
    href: '#work',
  },
  {
    id: 'project-dashboard',
    title: 'Meridian Analytics',
    category: 'Product Interface',
    year: '2025',
    description:
      'A reporting console for operations teams, built around dense data and a restrained dark interface.',
    tags: ['React', 'Node.js', 'MongoDB'],
    image: assets.work.dashboard,
    featured: true,
    href: '#work',
  },
  {
    id: 'project-identity',
    title: 'Atelier Doré',
    category: 'Identity & Web',
    year: '2024',
    description:
      'Brand system and a single-page site for a small design practice, print and screen developed together.',
    tags: ['Design', 'Vite', 'Tailwind CSS'],
    image: assets.work.identity,
    featured: true,
    href: '#work',
  },
  {
    id: 'project-editorial',
    title: 'Field Notes Journal',
    category: 'Editorial Platform',
    year: '2024',
    description:
      'A long-form publishing platform with a typographic reading experience and an editor-friendly workflow.',
    tags: ['React', 'Express', 'MySQL'],
    image: assets.work.editorial,
    featured: true,
    href: '#work',
  },
];

/**
 * Maps static samples into the CMS project shape used by Our Work / Portfolio.
 *
 * @param {{ featured?: boolean; categoryId?: string }} [params]
 * @returns {import('@/types').PortfolioProject[]}
 */
export function getFallbackProjects(params = {}) {
  const list = projects.map((project, index) => ({
    id: project.id,
    title: project.title,
    slug: project.id.replace(/^project-/, ''),
    categoryId: '',
    category: project.category || '',
    description: project.description || '',
    technologies: Array.isArray(project.tags) ? project.tags.join(' · ') : '',
    imageUrl: typeof project.image === 'string' ? project.image : project.image?.src || '',
    liveUrl: '',
    featured: Boolean(project.featured),
    displayOrder: index,
    year: project.year,
  }));

  return list.filter((project) => {
    if (params.featured && !project.featured) return false;
    if (params.categoryId && project.categoryId !== params.categoryId) return false;
    return true;
  });
}

export const workContent = {
  eyebrow: 'Selected work',
  title: 'Recent projects',
  subtitle: 'A short selection. Full case studies available on request.',
  cta: { label: 'Start a project', href: '#contact' },
};
