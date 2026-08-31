import { useSiteContent } from '@/hooks/useSiteContent';

/**
 * Public announcement strip. Visibility is decided by the API; this only
 * renders the first featured (else first) currently visible update.
 */
export function UpdatesBanner() {
  const { content } = useSiteContent();
  const updates = Array.isArray(content?.updates) ? content.updates : [];
  if (updates.length === 0) return null;

  const update = updates.find((item) => item.featured) || updates[0];
  if (!update?.title) return null;

  return (
    <div className="bg-brand-navy text-white">
      <div className="mx-auto flex max-w-[80rem] items-center justify-between gap-4 px-4 py-2.5 text-[13px] sm:px-6">
        <p className="min-w-0 truncate">
          <span className="mr-2 font-medium uppercase tracking-[0.14em] text-brand-yellow">
            {update.category || 'Update'}
          </span>
          {update.shortDescription || update.title}
        </p>
        {update.ctaUrl && update.ctaText ? (
          <a
            href={update.ctaUrl}
            className="shrink-0 font-medium text-brand-yellow underline-offset-2 hover:underline"
          >
            {update.ctaText}
          </a>
        ) : null}
      </div>
    </div>
  );
}
