import { cn } from '@/lib/cn';

/**
 * @param {{ project: import('@/types').Project; featured?: boolean }} props
 */
export function ProjectImage({ project, featured = false }) {
  return (
    <div className="overflow-hidden bg-foreground/[0.04]">
      <img
        src={project.image}
        alt={`${project.title} \u2014 ${project.category}`}
        loading="lazy"
        decoding="async"
        className={cn(
          'w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]',
          featured ? 'aspect-[16/9]' : 'aspect-[4/3]',
        )}
      />
    </div>
  );
}
