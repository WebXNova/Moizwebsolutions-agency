import { useEffect, useState } from 'react';

/**
 * Tracks which homepage section sits in the viewport trigger band.
 *
 * @param {string[]} sectionIds
 * @param {{ enabled?: boolean }} [options]
 */
export function useActiveSection(sectionIds, { enabled = true } = {}) {
  const [activeId, setActiveId] = useState(/** @type {string | null} */ (sectionIds[0] ?? null));

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;

    const ratios = new Map();
    const nodes = sectionIds
      .map((id) => document.getElementById(id))
      .filter((node) => node instanceof HTMLElement);

    if (!nodes.length) return undefined;

    const pickActive = () => {
      let bestId = null;
      let bestRatio = 0;

      ratios.forEach((ratio, id) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      });

      if (bestId) {
        setActiveId(bestId);
        return;
      }

      // Fallback when no section intersects the trigger band yet.
      const marker = window.scrollY + window.innerHeight * 0.38;
      let nearestId = sectionIds[0] ?? null;
      let nearestDistance = Infinity;

      sectionIds.forEach((id) => {
        const node = document.getElementById(id);
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const center = window.scrollY + rect.top + rect.height / 2;
        const distance = Math.abs(marker - center);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestId = id;
        }
      });

      if (nearestId) setActiveId(nearestId);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.intersectionRatio);
        });
        pickActive();
      },
      {
        root: null,
        rootMargin: '-32% 0px -32% 0px',
        threshold: [0, 0.05, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    nodes.forEach((node) => observer.observe(node));
    pickActive();

    return () => observer.disconnect();
  }, [sectionIds, enabled]);

  return activeId;
}
