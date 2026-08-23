/**
 * @param {{ project: import('@/types').Project }} props
 */
export function ProjectImage({ project }) {
  if (!project.image) return null;

  return <img src={project.image} alt={project.title} />;
}
