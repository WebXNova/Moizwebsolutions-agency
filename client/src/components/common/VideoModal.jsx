import { IconButton } from '@/components/common/IconButton';
import { CloseIcon } from '@/lib/icons';
import { useOverlay } from '@/hooks/useOverlay';

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   title: string;
 *   embedUrl?: string;
 * }} props
 */
export function VideoModal({ isOpen, onClose, title, embedUrl }) {
  useOverlay({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[80] flex items-center justify-center px-6 py-10"
    >
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-overlay" />

      <div className="relative z-10 w-full max-w-[1000px] shadow-elevated">
        <div className="mb-4 flex items-center justify-between gap-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-secondary-foreground">{title}</p>
          <IconButton autoFocus label="Close video" onClick={onClose}>
            <CloseIcon className="h-5 w-5" />
          </IconButton>
        </div>

        <div className="aspect-video w-full border border-border bg-surface-elevated shadow-lg">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-[12px] uppercase tracking-[0.22em] text-secondary-foreground">
                Showreel coming soon
              </p>
              <p className="max-w-[420px] text-[13px] leading-[1.8] text-muted-foreground">
                The player is wired up and ready. Add an embed URL to the hero video config to play
                the film here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
