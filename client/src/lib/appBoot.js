/**
 * HTML boot loader lifecycle — single source of truth for initial app reveal.
 * The loader lives outside #root (see index.html). Idempotent and safe to call often.
 *
 * Visual phases (cinematic path):
 *   INITIAL_LOADING → LOGO_VISIBLE → APPLICATION_READY → LOGO_TRANSITION → SITE_REVEAL → COMPLETE
 *
 * Readiness is still driven by the real application-ready signal. This module only
 * choreographs the MW monogram from the loader into the live header mark.
 */

import { assets } from '@/config/assets';

const BODY_LOADING = 'is-loading';
const BODY_HANDOFF = 'is-handoff';
const BODY_LOGO_HANDOFF = 'is-logo-handoff';
const HTML_BOOTING = 'is-booting';
const LOADER_ID = 'loading-screen';
const LOGO_ID = 'boot-logo';
const NAV_LOGO = 'header [data-nav-logo]';
const HIDING = 'is-hiding';
const BOOT_COMPLETE = 'mws:boot-complete';

/** Overlay fade after the traveler has landed. */
const FADE_MS = 420;
/** Shared-element flight — matches the site ease, within 700–1200ms. */
const FLIGHT_MS = 920;
const SETTLE_MS = 160;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const { monogram } = assets.brand;
const MONOGRAM_RATIO = monogram.width / monogram.height;

let dismissed = false;
let revealed = false;
let failsafeTimer = 0;

/**
 * Schedule a hard failsafe so a failed init never traps the visitor on the loader.
 * @param {number} [ms]
 */
export function armBootFailsafe(ms = 12000) {
  if (typeof window === 'undefined') return;
  window.clearTimeout(failsafeTimer);
  failsafeTimer = window.setTimeout(() => {
    dismissBootLoader();
  }, ms);
}

/**
 * Begin the boot-exit sequence. Public pages with a header mark get the
 * shared-element flight; admin, reduced-motion, and missing-target cases fade.
 */
export function dismissBootLoader() {
  if (typeof document === 'undefined' || dismissed) return;
  dismissed = true;
  window.clearTimeout(failsafeTimer);

  const loader = document.getElementById(LOADER_ID);
  const logo = document.getElementById(LOGO_ID);
  const nav = document.querySelector(NAV_LOGO);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced || !loader || !logo || !nav) {
    finishReveal(loader);
    return;
  }

  startHandoff(loader, logo, nav);
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
 * @param {HTMLElement} loader
 * @param {HTMLElement} logo
 * @param {Element} nav
 */
function startHandoff(loader, logo, nav) {
  const body = document.body;

  freezeMotion(loader, logo);
  body.classList.add(BODY_HANDOFF, BODY_LOGO_HANDOFF);

  Promise.all([whenImageReady(logo), whenImageReady(nav)]).then(() => {
    afterLayout(() => {
      const start = logo.getBoundingClientRect();
      const dest = destinationRect(nav);

      if (!start.width || !start.height || !dest.width || !dest.height) {
        finishReveal(loader);
        return;
      }

      flyLogo(loader, logo, nav, start, dest);
    });
  });
}

/**
 * @param {Element} node
 * @returns {Promise<void>}
 */
function whenImageReady(node) {
  if (!(node instanceof HTMLImageElement)) return Promise.resolve();
  if (node.complete && node.naturalWidth) return Promise.resolve();
  if (typeof node.decode === 'function') {
    return node.decode().then(() => undefined, () => undefined);
  }
  return new Promise((resolve) => {
    node.addEventListener('load', () => resolve(), { once: true });
    node.addEventListener('error', () => resolve(), { once: true });
    window.setTimeout(() => resolve(), 400);
  });
}

/**
 * @param {HTMLElement} loader
 * @param {HTMLElement} logo
 */
function freezeMotion(loader, logo) {
  loader.querySelector('.boot-stage')?.classList.add('is-frozen');
  logo.classList.add('is-frozen');
  loader.querySelector('.boot-text')?.classList.add('is-hidden');
}

/**
 * Navbar lockup is wider than the monogram. Land on the MW portion (left,
 * uniform scale by height) so the traveler never stretches.
 *
 * @param {Element} nav
 */
function destinationRect(nav) {
  const rect = nav.getBoundingClientRect();
  let { left, top, width, height } = rect;

  if ((!width || !height) && nav instanceof HTMLImageElement) {
    const intrinsicW = nav.naturalWidth || Number(nav.getAttribute('width')) || monogram.width;
    const intrinsicH = nav.naturalHeight || Number(nav.getAttribute('height')) || monogram.height;
    const computedWidth = Number.parseFloat(getComputedStyle(nav).width);
    width = width || computedWidth || 0;
    height = height || (width && intrinsicW ? width * (intrinsicH / intrinsicW) : 0);
  }

  if (nav.getAttribute('data-brand-mark') === 'lockup') {
    const destHeight = height;
    const destWidth = destHeight * MONOGRAM_RATIO;
    return { left, top, width: destWidth, height: destHeight };
  }

  return { left, top, width, height };
}

/**
 * FLIP: pin the monogram at its current box, then interpolate translate + uniform scale.
 *
 * @param {HTMLElement} loader
 * @param {HTMLElement} logo
 * @param {Element} nav
 * @param {DOMRect} start
 * @param {{ left: number; top: number; width: number; height: number }} dest
 */
function flyLogo(loader, logo, nav, start, dest) {
  loader.classList.add('is-handoff');
  document.documentElement.classList.remove(HTML_BOOTING);

  document.body.appendChild(logo);
  logo.classList.add('is-traveling');
  logo.setAttribute('aria-hidden', 'true');

  Object.assign(logo.style, {
    position: 'fixed',
    left: `${start.left}px`,
    top: `${start.top}px`,
    width: `${start.width}px`,
    height: `${start.height}px`,
    maxWidth: 'none',
    margin: '0',
    zIndex: '100000',
    transformOrigin: 'top left',
    transform: 'translate3d(0,0,0) scale(1)',
    transition: 'none',
    willChange: 'transform',
    pointerEvents: 'none',
  });

  void logo.offsetWidth;

  const applyFlight = (nextDest) => {
    const dx = nextDest.left - start.left;
    const dy = nextDest.top - start.top;
    const scale = nextDest.width / start.width;
    logo.style.transition = `transform ${FLIGHT_MS}ms ${EASE}`;
    logo.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`;
  };

  applyFlight(dest);

  const onResize = () => {
    applyFlight(destinationRect(nav));
  };
  window.addEventListener('resize', onResize, { passive: true });

  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    window.removeEventListener('resize', onResize);
    logo.removeEventListener('transitionend', onEnd);
    completeHandoff(loader, logo);
  };

  /** @param {TransitionEvent} event */
  const onEnd = (event) => {
    if (event.propertyName !== 'transform') return;
    settle();
  };

  logo.addEventListener('transitionend', onEnd);
  window.setTimeout(settle, FLIGHT_MS + SETTLE_MS);
}

/**
 * @param {HTMLElement} loader
 * @param {HTMLElement} logo
 */
function completeHandoff(loader, logo) {
  document.body.classList.remove(BODY_LOGO_HANDOFF);
  announceBootComplete();

  logo.style.transition = `opacity ${SETTLE_MS}ms ${EASE}`;
  logo.style.opacity = '0';

  window.setTimeout(() => {
    logo.remove();
    finishReveal(loader);
  }, SETTLE_MS);
}

/**
 * Restore interaction and fade the overlay. Safe to call once.
 * @param {HTMLElement | null} loader
 */
function finishReveal(loader) {
  if (revealed) return;
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

  announceBootComplete();

  if (!loader) return;

  loader.classList.add(HIDING);
  loader.setAttribute('aria-busy', 'false');
  loader.setAttribute('aria-hidden', 'true');

  window.setTimeout(() => {
    loader.remove();
  }, FADE_MS);
}

function announceBootComplete() {
  window.dispatchEvent(new Event(BOOT_COMPLETE));
}

/** Two frames so visibility/layout and the frozen transform have committed. */
function afterLayout(callback) {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
}
