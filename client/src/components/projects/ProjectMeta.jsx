import { cn } from '@/lib/cn';

/**
 * @param {{ project: import('@/types').Project; featured?: boolean }} props
 */
export function ProjectMeta({ project, featured = false }) {
  return (
    <div>
      <h3
        className={cn(
          'font-normal tracking-[-0.025em] text-foreground',
          featured
            ? 'text-[clamp(1.4rem,2.2vw,1.95rem)]'
            : 'text-[clamp(1.1rem,1.5vw,1.35rem)]',
        )}
      >
        {project.title}
      </h3>

      <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {[project.category, project.year].filter(Boolean).join(' \u00B7 ')}
      </p>

      {project.description ? (
        <p className="mt-5 max-w-[460px] text-[13.5px] leading-[1.8] text-muted-foreground">
          {project.description}
        </p>
      ) : null}
    </div>
  );
}
