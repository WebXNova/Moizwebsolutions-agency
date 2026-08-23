/**
 * @param {{ technology: import('@/types').Technology }} props
 */
export function TechnologyItem({ technology }) {
  return (
    <li>
      <span>{technology.name}</span>
      {technology.category ? <span>{technology.category}</span> : null}
    </li>
  );
}
