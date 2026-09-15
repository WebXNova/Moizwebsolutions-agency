/**
 * Survives remounts for the lifetime of the page, so a CSS entrance would play
 * on load and refresh but not again on a client-side route change.
 */
let hasCompleted = false;

/**
 * Drives a one-shot header-logo entrance.
 *
 * The first-load intro is the HTML boot loader. This stays idle so the
 * navbar mark does not jump after the overlay fades.
 * `onComplete` remains for the wrapper's animationend hook.
 *
 * @returns {{ isPlaying: boolean; onComplete: () => void }}
 */
export function useIntroAnimation() {
  return {
    isPlaying: false,
    onComplete: () => {
      hasCompleted = true;
    },
  };
}
