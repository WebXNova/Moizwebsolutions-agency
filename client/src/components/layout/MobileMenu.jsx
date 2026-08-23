import { Navigation } from '@/components/navigation/Navigation';
import { SocialLinks } from '@/components/navigation/SocialLinks';

/**
 * @param {{ isOpen?: boolean; onClose?: () => void }} props
 */
export function MobileMenu({ isOpen = false, onClose }) {
  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true">
      <button type="button" onClick={onClose}>
        Close
      </button>
      <Navigation />
      <SocialLinks />
    </div>
  );
}
