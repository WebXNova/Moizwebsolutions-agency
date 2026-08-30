import { cn } from '@/lib/cn';

/**
 * Shared control surface for inputs, textareas and selects inside the inquiry
 * workspace. Focus uses the brand yellow ring; errors use a muted red hairline.
 *
 * @param {string} [error]
 */
export function inquiryControlClass(error) {
  return cn(
    'w-full rounded-md border bg-panel px-3.5 py-3 text-[0.875rem] text-ink',
    'placeholder:text-ink-faint',
    'transition-[border-color,box-shadow,background-color] duration-200 ease-out',
    'focus:outline-none focus:border-brand-yellow focus:bg-panel-soft',
    'focus:shadow-[0_0_0_3px_rgb(255_194_14_/_0.18)]',
    error
      ? 'border-danger/55 shadow-[0_0_0_3px_rgb(180_35_24_/_0.08)]'
      : 'border-hairline hover:border-hairline-strong',
  );
}

/**
 * @param {{
 *   id: string;
 *   label: string;
 *   optional?: boolean;
 *   error?: string;
 *   hint?: string;
 *   className?: string;
 *   style?: import('react').CSSProperties;
 *   children: import('react').ReactNode;
 * }} props
 */
export function InquiryField({ id, label, optional, error, hint, className, style, children }) {
  return (
    <div className={className} style={style}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="text-[0.625rem] font-medium uppercase tracking-[0.16em] text-ink-muted"
        >
          {label}
        </label>
        {optional ? (
          <span className="text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
            Optional
          </span>
        ) : null}
      </div>

      {children}

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 text-[0.75rem] leading-snug text-danger"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="mt-2 text-[0.6875rem] leading-snug text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

/**
 * Groups a label above a set of chips or a custom control.
 *
 * @param {{
 *   label: string;
 *   hint?: string;
 *   error?: string;
 *   action?: import('react').ReactNode;
 *   children: import('react').ReactNode;
 *   className?: string;
 * }} props
 */
export function InquiryGroup({ label, hint, error, action, children, className }) {
  return (
    <fieldset className={cn('border-0 p-0', className)}>
      <div className="mb-3 flex items-center justify-between gap-4">
        <legend className="text-[0.625rem] font-medium uppercase tracking-[0.16em] text-ink-muted">
          {label}
        </legend>
        {action}
      </div>

      {children}

      {error ? (
        <p role="alert" className="mt-2 text-[0.75rem] leading-snug text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-2.5 text-[0.6875rem] leading-snug text-ink-faint">{hint}</p>
      ) : null}
    </fieldset>
  );
}
