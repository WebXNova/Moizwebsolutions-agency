import { TechnologyItem } from '@/components/technologies/TechnologyItem';

/**
 * @param {{ technologies?: import('@/types').Technology[] }} props
 */
export function TechnologyList({ technologies = [] }) {
  return (
    <ul>
      {technologies.map((technology) => (
        <TechnologyItem key={technology.id} technology={technology} />
      ))}
    </ul>
  );
}
