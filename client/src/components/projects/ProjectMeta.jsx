/**
 * @param {{ project: import('@/types').Project }} props
 */
export function ProjectMeta({ project }) {
  return (
    <div>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      {project.year ? <span>{project.year}</span> : null}
    </div>
  );
}
