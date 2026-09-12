import { ClosingFooter } from '@/components/closing/ClosingFooter';

/**
 * Compact navy footer for pages that do not use PublicLayout.
 */
export function Footer() {
  return (
    <div className="w-full bg-closing-panel">
      <div className="mx-auto max-w-site px-6 py-14 sm:px-10 sm:py-16 md:px-14 md:py-20 lg:px-16">
        <ClosingFooter />
      </div>
    </div>
  );
}
