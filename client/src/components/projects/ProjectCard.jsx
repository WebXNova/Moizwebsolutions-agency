import { ArrowUpRightIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { ProjectPreview } from '@/components/projects/ProjectPreview';
import { TiltFrame } from '@/components/effects/TiltFrame';
import { resolveProjectPreview } from '@/data/projectPreviews';
import { useBandProgress } from '@/hooks/useBandProgress';
import { useInViewOnce } from '@/hooks/useInView';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * @param {{
 *   project: import('@/types').PortfolioProject;
 *   className?: string;
 * }} props
 */
export function ProjectCard({ project, className }) {
  const preview = resolveProjectPreview(project);
  const panelTitle = project.title.toUpperCase();
  const metaTitle = `${project.title} — ${project.category}`;
  const liveUrl = project.liveUrl;

  const [ref, revealed] = useInViewOnce({ threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  const reduced = usePrefersReducedMotion();
  const compact = useMediaQuery('(max-width: 640px)');
  const finePointer = useFinePointer();
  const playParallax = revealed && !reduced && finePointer && !compact;

  useBandProgress(ref, playParallax);

  return (
    <TiltFrame className={className}>
      <article ref={ref} className="project-card group/preview bg-surface-muted">
      <div className="preview-stage relative aspect-[4/3] min-h-[13.5rem] overflow-hidden sm:min-h-[15.5rem] lg:min-h-[16.5rem]">
        <ProjectPreview
          src={preview.src}
          alt={preview.alt}
          width={preview.width}
          height={preview.height}
          mode={preview.mode}
          objectPosition={preview.objectPosition}
          objectPositionMd={preview.objectPositionMd}
          objectPositionLg={preview.objectPositionLg}
          scale={preview.scale}
          shiftY={preview.shiftY}
          shiftYMd={preview.shiftYMd}
          shiftYLg={preview.shiftYLg}
          parallax={preview.parallax}
          revealed={revealed || reduced}
          reduced={reduced}
        />
      </div>

      <div className="fx-card-glow relative z-10 mx-3 -mt-[4.5rem] bg-brand-navy-deep px-5 py-4 shadow-lg sm:mx-4">
        <h3 className="text-[15px] font-semibold uppercase tracking-[0.08em] text-brand-yellow">
          {panelTitle}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-white/90">
          {project.description}
        </p>
        {project.technologies ? (
          <p className="mt-2.5 text-[11px] font-semibold text-brand-yellow">
            {project.technologies}
          </p>
        ) : null}
      </div>

      <div className="flex items-end justify-between gap-4 px-4 pb-5 pt-5">
        <div className="min-w-0">
          <h4 className="text-[14px] font-semibold text-foreground">{metaTitle}</h4>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {project.description}
          </p>
        </div>

        {liveUrl ? (
          <div className="live-preview group/live flex shrink-0 flex-col items-end gap-2">
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-medium text-muted-foreground transition-[color,letter-spacing] duration-300 hover-capable:group-hover/live:tracking-[0.04em] hover-capable:group-hover/live:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Live Preview
            </a>
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${project.title} live preview`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition-[transform,border-color,box-shadow] duration-300 hover-capable:group-hover/live:border-border-interactive hover-capable:group-hover/live:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ArrowUpRightIcon
                className={cn(
                  'h-3.5 w-3.5 transition-transform duration-300 ease-out',
                  'hover-capable:group-hover/live:translate-x-[3px] hover-capable:group-hover/live:-translate-y-[2px]',
                )}
              />
            </a>
          </div>
        ) : null}
      </div>
    </article>
      </TiltFrame>
  );
}
