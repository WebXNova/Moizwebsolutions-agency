/**
 * @param {{ href?: string; label?: string }} props
 */
export function ProjectAction({ href, label = 'View project' }) {
  if (!href) return null;

  return (
    <a href={href} target="_blank" rel="noreferrer">
      {label}
    </a>
  );
}
