import { cn } from '@/lib/cn';

const PREVIEW_COUNT = 3;

/**
 * Expandable offering list. A concise preview appears on hover or focus;
 * the full list locks in when the parent service is active.
 *
 * @param {{
 *   details?: string[];
 *   active?: boolean;
 *   labelledBy: string;
 * }} props
 */
export function ServiceDetails({ details = [], active = false, labelledBy }) {
  if (details.length === 0) return null;

  const preview = details.slice(0, PREVIEW_COUNT);
  const extra = details.slice(PREVIEW_COUNT);

  return (
    <div
      id={`${labelledBy}-details`}
      className={cn(
        'relative grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        'motion-reduce:transition-none',
        active
          ? 'grid-rows-[1fr] opacity-100'
          : 'grid-rows-[0fr] opacity-0 hover-capable:group-hover:grid-rows-[1fr] hover-capable:group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100',
      )}
    >
      <div className="overflow-hidden">
        <ul className="mt-8 space-y-3 border-t border-border-subtle pt-6">
          {preview.map((detail) => (
            <li
              key={detail}
              className="flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-300 group-hover:text-secondary-foreground"
            >
              <span
                aria-hidden="true"
                className="h-px w-4 bg-border transition-colors duration-300 group-hover:bg-brand-yellow/70"
              />
              {detail}
            </li>
          ))}
        </ul>

        {extra.length > 0 ? (
          <div
            className={cn(
              'grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
              active ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
            )}
          >
            <ul className="space-y-3 overflow-hidden pt-3">
              {extra.map((detail, index) => (
                <li
                  key={detail}
                  style={{ transitionDelay: active ? `${index * 45}ms` : '0ms' }}
                  className={cn(
                    'flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground',
                    'transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none',
                    active
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-1 opacity-0 motion-reduce:translate-y-0',
                  )}
                >
                  <span aria-hidden="true" className="h-px w-4 bg-brand-yellow/70" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
