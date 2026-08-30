import heroVisualImage from '@/components/logo and animation/ChatGPT Image Aug 26, 2026, 01_51_15 PM.png';
import mrbClassesPreview from '@/components/logo and animation/Screenshot (2).png';

/**
 * Single source of truth for image paths so artwork can be swapped without
 * touching component code. Brand files live in `client/public/assets`; the hero
 * visual is imported from source so Vite serves it without duplicating the file.
 */
export const assets = {
  /**
   * Derived from the master logo in `client/src/components/logo and animation`
   * by `client/scripts/prepare-brand-assets.ps1`. Intrinsic sizes are recorded
   * so the header can reserve the exact box and never shift on load.
   */
  brand: {
    lockup: { src: '/assets/mws-logo.png', width: 538, height: 206 },
    monogram: { src: '/assets/mws-monogram.png', width: 210, height: 206 },
  },
  heroVisual: {
    src: heroVisualImage,
    alt: 'Moiz Web Solutions workspace with laptop, branding, and creative tools on a desk',
    width: 1448,
    height: 1086,
  },
  work: {
    commerce: '/assets/work-commerce.svg',
    dashboard: '/assets/work-dashboard.svg',
    identity: '/assets/work-identity.svg',
    editorial: '/assets/work-editorial.svg',
    /**
     * Source file: `client/src/components/logo and animation/Screenshot (2).png`
     * Intrinsic size 1074×627 — central MRB Classes webpage (no OS/browser chrome).
     */
    mrbClasses: {
      src: mrbClassesPreview,
      width: 1074,
      height: 627,
      alt: 'MRB Classes website project preview',
    },
  },
};
