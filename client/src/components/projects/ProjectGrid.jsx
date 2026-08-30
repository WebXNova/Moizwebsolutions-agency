import { ProjectCard } from '@/components/projects/ProjectCard';

/**
 * Static responsive grid — 1 col mobile, 2 tablet, 3 desktop.
 * No carousel, slider, or horizontal scroll.
 *
 * @param {{ projects?: import('@/types').PortfolioProject[] }} props
 */
export function ProjectGrid({ projects = [] }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 md:gap-x-10 md:gap-y-[4.5rem] lg:grid-cols-3 lg:gap-x-8 lg:gap-y-20">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
