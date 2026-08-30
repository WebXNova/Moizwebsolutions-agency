import { useEffect } from 'react';
import { Container } from '@/components/common/Container';
import { IconButton } from '@/components/common/IconButton';
import { Logo } from '@/components/navigation/Logo';
import { Navigation } from '@/components/navigation/Navigation';
import { SocialLinks } from '@/components/navigation/SocialLinks';
import { CloseIcon } from '@/lib/icons';
import { useOverlay } from '@/hooks/useOverlay';

const DIALOG_ID = 'mobile-navigation';

/**
 * @param {{ isOpen?: boolean; onClose?: () => void }} props
 */
export function MobileMenu({ isOpen = false, onClose }) {
  useOverlay({ isOpen, onClose });

  useEffect(() => {
    if (!isOpen) return undefined;

    const desktopQuery = window.matchMedia('(min-width: 1024px)');

    const handleDesktopChange = (event) => {
      if (event.matches) onClose?.();
    };

    const handleTab = (event) => {
      if (event.key !== 'Tab') return;

      const focusable = document
        .getElementById(DIALOG_ID)
        ?.querySelectorAll('a[href], button:not([disabled])');

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

    desktopQuery.addEventListener('change', handleDesktopChange);
    document.addEventListener('keydown', handleTab);

    return () => {
      desktopQuery.removeEventListener('change', handleDesktopChange);
      document.removeEventListener('keydown', handleTab);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id={DIALOG_ID}
      className="fixed inset-0 z-[70] bg-background lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
    >
      <Container className="flex h-full flex-col">
        <div className="flex items-center justify-between py-7">
          <Logo />
          <IconButton autoFocus className="-mr-2" label="Close menu" onClick={onClose}>
            <CloseIcon className="h-5 w-5" />
          </IconButton>
        </div>

        <Navigation orientation="vertical" size="lg" className="mt-10 flex-1" onNavigate={onClose} />

        <div className="flex items-center justify-between pb-12">
          <SocialLinks />
        </div>
      </Container>
    </div>
  );
}
