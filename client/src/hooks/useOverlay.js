import { useEffect } from 'react';

/**
 * Shared behaviour for full-screen overlays: Escape to close, optional scroll lock
 * (can outlive `isOpen` for exit animations), and focus return when closing.
 *
 * @param {{
 *   isOpen: boolean;
 *   onClose?: () => void;
 *   lockScroll?: boolean;
 * }} options
 */
export function useOverlay({ isOpen, onClose, lockScroll = isOpen }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!lockScroll) return undefined;

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;

    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [lockScroll]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement;

    return () => {
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);
}
