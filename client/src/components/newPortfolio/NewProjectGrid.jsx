import { NewProjectCard } from '@/components/newPortfolio/NewProjectCard';

/**
 * Isolated 1 / 2 / 3 column grid for the new Our Works section.
 *
 * @param {{ projects?: import('@/types').PortfolioProject[] }} props
 */
export function NewProjectGrid({ projects = [] }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 md:gap-x-10 md:gap-y-[4.5rem] lg:grid-cols-3 lg:gap-x-8 lg:gap-y-20">
      {projects.map((project, index) => (
        <NewProjectCard key={project.id} project={project} index={index} />
      ))}
    </div>
  );
}
