import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ActiveSectionDot } from '@/components/navigation/ActiveSectionDot';
import { SIDEBAR_RAIL } from '@/components/navigation/sidebarConfig';
import {
  getSectionLabel,
  HOME_SECTION_IDS,
  HOME_SECTIONS,
  sectionIndexToPosition,
} from '@/components/navigation/sectionConfig';
import { useActiveSection } from '@/hooks/useActiveSection';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { cn } from '@/lib/cn';

/**
 * Right-side section rail — one blue vertical line, one moving yellow dot.
 */
export function SidebarLine() {
  const location = useLocation();
  const reduced = usePrefersReducedMotion();
  const scrollProgress = useScrollProgress();
  const isHome = location.pathname === '/';
  const activeSectionId = useActiveSection(HOME_SECTION_IDS, { enabled: isHome });

  const activeIndex = useMemo(() => {
    const index = HOME_SECTIONS.findIndex((section) => section.id === activeSectionId);
    return index >= 0 ? index : 0;
  }, [activeSectionId]);

  const dotPosition = useMemo(
    () => sectionIndexToPosition(activeIndex, HOME_SECTIONS.length),
    [activeIndex],
  );

  const activeLabel = getSectionLabel(activeSectionId) ?? HOME_SECTIONS[0].label;

  const scrollToActive = () => {
    const targetId = activeSectionId ?? HOME_SECTIONS[0].id;
    const node = document.getElementById(targetId);
    if (!node) return;
    node.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  const scrollToSection = (sectionId) => {
    const node = document.getElementById(sectionId);
    if (!node) return;
    node.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  if (!isHome) return null;

  return (
    <nav
      aria-label="Page sections"
      className={cn('pointer-events-none', SIDEBAR_RAIL.positionClass)}
    >
      <div className={cn('relative', SIDEBAR_RAIL.trackClass)}>
        {/* Base line */}
        <span aria-hidden="true" className={cn('absolute inset-0 rounded-full', SIDEBAR_RAIL.lineClass)} />

        {/* Scroll progress segment */}
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-x-0 top-0 rounded-full',
            SIDEBAR_RAIL.progressClass,
            reduced ? '' : 'transition-[height] duration-200 ease-out',
          )}
          style={{ height: `${scrollProgress * 100}%` }}
        />

        {/* Active dot */}
        <ActiveSectionDot
          position={dotPosition}
          label={activeLabel}
          labelSide="left"
          onActivate={scrollToActive}
        />

        {/* Screen-reader section navigation */}
        <ul className="sr-only">
          {HOME_SECTIONS.map((section) => (
            <li key={section.id}>
              <button type="button" onClick={() => scrollToSection(section.id)}>
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
