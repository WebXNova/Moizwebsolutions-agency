import { useMouseTilt } from '@/hooks/useMouseTilt';
import { cn } from '@/lib/cn';

/**
 * Desktop-only 3D tilt wrapper. Layout and children stay unchanged.
 * The outer frame is measured so the tilt itself does not jitter the hit box.
 *
 * @param {{
 *   children: import('react').ReactNode;
 *   className?: string;
 *   max?: number;
 * }} props
 */
export function TiltFrame({ children, className, max = 5 }) {
  const { nodeRef, onPointerMove, onPointerLeave, onPointerCancel, enabled } = useMouseTilt({
    max,
    perspective: 1000,
  });

  return (
    <div
      onPointerMove={enabled ? onPointerMove : undefined}
      onPointerLeave={enabled ? onPointerLeave : undefined}
      onPointerCancel={enabled ? onPointerCancel : undefined}
      className={cn('w-full', className)}
    >
      <div
        ref={nodeRef}
        className={cn('w-full', enabled && 'will-change-transform [transform-style:preserve-3d]')}
        style={
          enabled
            ? { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)', transformOrigin: 'center center' }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}
