import { TiltFrame } from '@/components/effects/TiltFrame';
import { HeroCTA } from '@/components/hero/HeroCTA';
import { ProjectPreviewSlider } from '@/components/newPortfolio/ProjectPreviewSlider';
import { resolveProjectGallery } from '@/data/projectPreviews';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Self-contained project card: image slider, caption overlay, preview CTA.
 *
 * @param {{
 *   project: import('@/types').PortfolioProject;
 *   index?: number;
 * }} props
 */
export function NewProjectCard({ project, index = 0 }) {
  const gallery = resolveProjectGallery(project);
  const liveUrl = project.liveUrl;
  const panelTitle = project.title.toUpperCase();
  const reduced = usePrefersReducedMotion();

  return (
    <TiltFrame max={9}>
      <article
        className={cn(
          'flex flex-col rounded-[20px] bg-white p-3 shadow-[0_12px_32px_rgb(0_0_0_/_0.1)]',
          'dark:bg-surface-elevated',
          !reduced && 'motion-safe:animate-reveal-up',
        )}
        style={reduced ? undefined : { animationDelay: `${index * 90}ms` }}
      >
        <ProjectPreviewSlider
          images={gallery}
          reduced={reduced}
          label={`${project.title} previews`}
        />

        <div className="relative z-10 mx-2 mt-3 rounded-2xl bg-[rgb(0_0_0_/_0.88)] px-5 py-5 shadow-[0_10px_28px_rgb(0_0_0_/_0.12)] sm:px-6 sm:py-6">
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[15px] font-bold uppercase tracking-[0.08em] text-brand-yellow">
              {panelTitle}
            </h3>
            <p className="line-clamp-2 text-[13px] leading-relaxed text-white/95">
              {project.description}
            </p>
            {project.technologies ? (
              <p className="text-[11px] font-bold text-brand-yellow">{project.technologies}</p>
            ) : null}
          </div>
          {liveUrl ? (
            <HeroCTA
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${project.title} live preview`}
              className="mt-4 w-full"
            >
              Preview
            </HeroCTA>
          ) : null}
        </div>
      </article>
    </TiltFrame>
  );
}
