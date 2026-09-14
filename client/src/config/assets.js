import heroVisualImage from '@/components/logo and animation/ChatGPT Image Aug 26, 2026, 01_51_15 PM.png';
import mrbClassesPreview from '@/components/logo and animation/Screenshot (2).png';
import founderPortrait from '@/assets/images/founder.png';
import mainLogo from '@/assets/images/main-logo.png';

/**
 * Single source of truth for image paths so artwork can be swapped without
 * touching component code. The brand mark is imported from source so Vite
 * fingerprints it; the hero visual is imported the same way.
 */
export const assets = {
  /**
   * Primary brand mark (`client/src/assets/images/main-logo.png`),
   * white background removed. Height is constrained in each placement.
   */
  brand: {
    lockup: { src: mainLogo, width: 1293, height: 935 },
    monogram: { src: mainLogo, width: 1293, height: 935 },
  },
  heroVisual: {
    src: heroVisualImage,
    alt: 'Moiz Web Solutions workspace with laptop, branding, and creative tools on a desk',
    width: 1408,
    height: 1086,
  },
  founderPortrait: {
    src: founderPortrait,
    alt: 'Portrait of Muhammad Moiz',
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
