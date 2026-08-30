import { useEffect } from 'react';

/**
 * Shared behaviour for full-screen overlays: locks background scrolling,
 * closes on Escape and returns focus to the trigger on unmount.
 *
 * @param {{ isOpen: boolean; onClose?: () => void }} options
 */
export function useOverlay({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);

      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, onClose]);
}
