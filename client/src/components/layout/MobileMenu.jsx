import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Container } from '@/components/common/Container';
import { IconButton } from '@/components/common/IconButton';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Logo } from '@/components/navigation/Logo';
import { FriesMenuIcon } from '@/components/navigation/FriesMenuIcon';
import { Navigation } from '@/components/navigation/Navigation';
import { SocialLinks } from '@/components/navigation/SocialLinks';
import { HeroCTA } from '@/components/hero/HeroCTA';
import { useInquiry } from '@/context/InquiryProvider';
import { useOverlay } from '@/hooks/useOverlay';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useSiteContent } from '@/hooks/useSiteContent';
import { resolveHero } from '@/lib/contentAdapters';
import { heroContent as fallbackHero } from '@/data/hero';
import { cn } from '@/lib/cn';

const DIALOG_ID = 'mobile-navigation';
const EXIT_MS = 360;
const SITE_SHELL = '[data-site-shell]';

/**
 * Full-viewport site menu. Portaled to document.body so it is not
 * trapped by header backdrop-filter or the page shell’s overflow/stacking context.
 *
 * @param {{ isOpen?: boolean; onClose?: () => void }} props
 */
export function MobileMenu({ isOpen = false, onClose }) {
  const reduced = usePrefersReducedMotion();
  const titleId = useId();
  const closeRef = useRef(null);
  const wasMountedRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const { open: openInquiry } = useInquiry();
  const { content } = useSiteContent();
  const heroContent = resolveHero(content?.hero) || fallbackHero;
  const talkLabel = heroContent.cta?.label || 'Let\u2019s talk';

  useOverlay({ isOpen, onClose, lockScroll: mounted });

  useEffect(() => {
    if (isOpen) {
      wasMountedRef.current = true;
      setMounted(true);
      const outer = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setEntered(true));
      });
      return () => window.cancelAnimationFrame(outer);
    }

    setEntered(false);

    if (!wasMountedRef.current) return undefined;

    if (reduced) {
      wasMountedRef.current = false;
      setMounted(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      wasMountedRef.current = false;
      setMounted(false);
    }, EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen, reduced]);

  useEffect(() => {
    const shell = document.querySelector(SITE_SHELL);
    if (!(shell instanceof HTMLElement)) return undefined;

    if (isOpen) {
      shell.setAttribute('inert', '');
      shell.setAttribute('aria-hidden', 'true');
    } else {
      shell.removeAttribute('inert');
      shell.removeAttribute('aria-hidden');
    }

    return () => {
      shell.removeAttribute('inert');
      shell.removeAttribute('aria-hidden');
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !entered) return undefined;
    closeRef.current?.focus();
    return undefined;
  }, [isOpen, entered]);

  useEffect(() => {
    if (!isOpen || !mounted) return undefined;

    const handleTab = (event) => {
      if (event.key !== 'Tab') return;

      const root = document.getElementById(DIALOG_ID);
      const focusable = root?.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen, mounted]);

  const handleTalkClick = () => {
    onClose?.();
    // Inquiry modal is z-90; wait for this z-100 overlay to exit so it is not covered.
    window.setTimeout(() => openInquiry(), reduced ? 0 : EXIT_MS);
  };

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div
      id={DIALOG_ID}
      className={cn(
        'fx-mobile-menu fixed inset-0 z-[100]',
        'flex flex-col bg-background',
      )}
      data-open={entered ? 'true' : 'false'}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-background" />

      <Container className="fx-mobile-menu-inner relative z-[1] flex h-full min-h-0 flex-col">
        <div className="flex items-center justify-between gap-3 py-2.5 sm:py-3">
          <Logo />
          <IconButton
            ref={closeRef}
            className="h-11 w-11 text-brand-blue"
            label="Close menu"
            aria-controls={DIALOG_ID}
            aria-expanded={isOpen}
            onClick={onClose}
          >
            <FriesMenuIcon open />
          </IconButton>
        </div>

        <p id={titleId} className="sr-only">
          Site navigation
        </p>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="mt-8 flex flex-col items-start gap-3">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Theme
            </p>
            <ThemeToggle />
          </div>

          <Navigation orientation="vertical" size="lg" className="mt-10" onNavigate={onClose} />

          <div className="fx-mobile-menu-cta mt-auto flex flex-col items-stretch gap-8 pb-12 pt-12 sm:items-start">
            <SocialLinks />
            <HeroCTA onClick={handleTalkClick} className="mt-0 w-full max-w-full sm:w-auto">
              {talkLabel}
            </HeroCTA>
          </div>
        </div>
      </Container>
    </div>,
    document.body,
  );
}
