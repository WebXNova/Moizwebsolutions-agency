import { cn } from '@/lib/cn';

/**
 * “Fries” menu glyph — three centered rounded bars (short / full / medium).
 * Morphs into a close (×) when `open` is true.
 *
 * @param {{
 *   open?: boolean;
 *   className?: string;
 * }} props
 */
export function FriesMenuIcon({ open = false, className }) {
  return (
    <span
      aria-hidden="true"
      className={cn('fx-fries relative inline-flex h-5 w-6 items-center justify-center', className)}
      data-open={open ? 'true' : 'false'}
    >
      <span className="fx-fries-bar fx-fries-bar--top" />
      <span className="fx-fries-bar fx-fries-bar--mid" />
      <span className="fx-fries-bar fx-fries-bar--bot" />
    </span>
  );
}
