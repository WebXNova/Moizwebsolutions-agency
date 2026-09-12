/**
 * Survives remounts for the lifetime of the page, so a CSS entrance would play
 * on load and refresh but not again on a client-side route change.
 */
let hasCompleted = false;

/**
 * Drives a one-shot header-logo entrance.
 *
 * The cinematic boot flight is the first-load intro. Playing brand-settle or
 * brand-reveal on the navbar mark after the monogram lands would make it jump,
 * so this stays idle. `onComplete` remains for the wrapper's animationend hook.
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
