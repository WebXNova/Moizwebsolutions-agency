import { ArrowUpRightIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { resolveProjectPreview } from '@/data/projectPreviews';
import { TiltFrame } from '@/components/effects/TiltFrame';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const ENTRY_ROT = ['-3.6deg', '2.8deg', '-2.2deg', '4.1deg', '-4.8deg'];

/**
 * Isolated project card for the new Our Works section.
 * Entrance: unique delay + slight rotation that snaps to square.
 * Hover: desktop 3D tilt and gold border glow — copy and layout unchanged.
 *
 * @param {{
 *   project: import('@/types').PortfolioProject;
 *   index?: number;
 * }} props
 */
export function NewProjectCard({ project, index = 0 }) {
  const preview = resolveProjectPreview(project);
  const liveUrl = project.liveUrl;
  const panelTitle = project.title.toUpperCase();
  const metaTitle = `${project.title} — ${project.category}`;

  const reduced = usePrefersReducedMotion();
  const finePointer = useFinePointer();

  return (
    <TiltFrame>
      <article
        className={cn(
          'group/new-card bg-surface-muted',
          !reduced && 'motion-safe:animate-card-snap',
        )}
        style={
          reduced
            ? undefined
            : {
                animationDelay: `${index * 90}ms`,
                '--entry-rot': ENTRY_ROT[index % ENTRY_ROT.length],
              }
        }
      >
        <div className="relative aspect-[4/3] min-h-[13.5rem] overflow-hidden sm:min-h-[15.5rem] lg:min-h-[16.5rem]">
          {preview.src ? (
            <img
              src={preview.src}
              alt={preview.alt}
              width={preview.width}
              height={preview.height}
              loading="lazy"
              decoding="async"
              className={cn(
                'h-full w-full object-cover',
                finePointer &&
                  !reduced &&
                  'transition-transform duration-500 ease-out hover-capable:group-hover/new-card:scale-[1.03]',
              )}
              style={{ objectPosition: preview.objectPosition || 'center top' }}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-surface-muted text-[13px] text-muted-foreground">
              Preview unavailable
            </div>
          )}
        </div>

        <div className="fx-card-glow relative z-10 mx-3 -mt-[4.5rem] bg-brand-navy-deep px-5 py-4 shadow-lg sm:mx-4">
          <h3 className="text-[15px] font-semibold uppercase tracking-[0.08em] text-brand-yellow">
            {panelTitle}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-white/90">
            {project.description}
          </p>
          {project.technologies ? (
            <p className="mt-2.5 text-[11px] font-semibold text-brand-yellow">{project.technologies}</p>
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
            <div className="flex shrink-0 flex-col items-end gap-2">
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="fx-nav-link text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Live Preview
              </a>
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${project.title} live preview`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition-[transform,border-color,box-shadow] duration-300 hover-capable:group-hover/new-card:border-brand-yellow/50 hover-capable:group-hover/new-card:shadow-[0_0_16px_rgb(255_194_14_/_0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <ArrowUpRightIcon
                  className={cn(
                    'h-3.5 w-3.5 transition-transform duration-300 ease-out',
                    'hover-capable:group-hover/new-card:translate-x-[3px] hover-capable:group-hover/new-card:-translate-y-[2px]',
                    reduced && 'transform-none',
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
