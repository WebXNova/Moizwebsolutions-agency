import { ProjectCard } from '@/components/projects/ProjectCard';

/**
 * @param {{ projects?: import('@/types').Project[] }} props
 */
export function ProjectGrid({ projects = [] }) {
  return (
    <div>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
