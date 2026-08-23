import { ProjectImage } from '@/components/projects/ProjectImage';
import { ProjectMeta } from '@/components/projects/ProjectMeta';
import { ProjectTags } from '@/components/projects/ProjectTags';
import { ProjectAction } from '@/components/projects/ProjectAction';

/**
 * @param {{ project: import('@/types').Project }} props
 */
export function ProjectCard({ project }) {
  return (
    <article>
      <ProjectImage project={project} />
      <ProjectMeta project={project} />
      <ProjectTags tags={project.tags ?? []} />
      <ProjectAction href={project.href} />
    </article>
  );
}
