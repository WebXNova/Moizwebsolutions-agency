import { useMouseTilt } from '@/hooks/useMouseTilt';
import { cn } from '@/lib/cn';

/**
 * Desktop-only 3D tilt wrapper. Layout and children stay unchanged.
 *
 * @param {{ children: import('react').ReactNode; className?: string }} props
 */
export function TiltFrame({ children, className }) {
  const { nodeRef, onPointerMove, onPointerLeave, enabled } = useMouseTilt({ max: 5 });

  return (
    <div
      ref={nodeRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn(
        enabled && 'will-change-transform transition-transform duration-200 ease-out',
        className,
      )}
    >
      {children}
    </div>
  );
}
