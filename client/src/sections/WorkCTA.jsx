/**
 * @param {{ label?: string; href?: string }} props
 */
export function WorkCTA({ label = 'View all work', href = '/work' }) {
  return <a href={href}>{label}</a>;
}
