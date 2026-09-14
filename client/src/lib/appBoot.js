/**
 * HTML boot loader lifecycle — single source of truth for initial app reveal.
 * The loader lives outside #root (see index.html). Idempotent and safe to call often.
 *
 * Dismiss is timer-driven (usePublicLoading + failsafe). Entrance animations are
 * visual only and never gate the overlay hide.
 */

const BODY_LOADING = 'is-loading';
const BODY_HANDOFF = 'is-handoff';
const BODY_LOGO_HANDOFF = 'is-logo-handoff';
const HTML_BOOTING = 'is-booting';
const LOADER_ID = 'loading-screen';
const HIDING = 'is-hiding';
const BOOT_COMPLETE = 'mws:boot-complete';

/** Overlay fade before the node is removed. */
const FADE_MS = 450;

let dismissed = false;
let revealed = false;
let failsafeTimer = 0;

/**
 * Schedule a hard failsafe so a failed init never traps the visitor on the loader.
 * @param {number} [ms]
 */
export function armBootFailsafe(ms = 2600) {
  if (typeof window === 'undefined') return;
  window.clearTimeout(failsafeTimer);
  failsafeTimer = window.setTimeout(() => {
    dismissBootLoader();
  }, ms);
}

/**
 * Fade the overlay out and restore the app. Safe to call often.
 */
export function dismissBootLoader() {
  if (typeof document === 'undefined' || dismissed) return;
  dismissed = true;
  window.__mwsBootDismissed = true;
  window.clearTimeout(failsafeTimer);

  finishReveal(document.getElementById(LOADER_ID));
}

/**
 * @returns {boolean}
 */
export function isBootDismissed() {
  return dismissed;
}

/**
 * True after scroll, pointer, and inert have been restored.
 * @returns {boolean}
 */
export function isBootRevealed() {
  return revealed;
}

/**
 * Restore interaction and fade the overlay. Safe to call once.
 * @param {HTMLElement | null} loader
 */
function finishReveal(loader) {
  if (revealed) {
    hideLoader(loader);
    return;
  }
  revealed = true;

  const body = document.body;
  const root = document.getElementById('root');
  const html = document.documentElement;

  html.classList.remove(HTML_BOOTING);
  body.classList.remove(BODY_LOADING, BODY_HANDOFF, BODY_LOGO_HANDOFF);
  body.style.overflow = '';

  if (root) {
    root.removeAttribute('inert');
    root.style.visibility = '';
    root.style.pointerEvents = '';
  }

  window.dispatchEvent(new Event(BOOT_COMPLETE));
  hideLoader(loader);
}

/**
 * @param {HTMLElement | null} loader
 */
function hideLoader(loader) {
  if (!loader || loader.dataset.bootHidden === '1') return;

  loader.dataset.bootHidden = '1';
  loader.classList.add(HIDING);
  loader.style.opacity = '0';
  loader.style.visibility = 'hidden';
  loader.style.pointerEvents = 'none';
  loader.setAttribute('aria-busy', 'false');
  loader.setAttribute('aria-hidden', 'true');

  window.setTimeout(() => {
    loader.remove();
  }, FADE_MS);
}
