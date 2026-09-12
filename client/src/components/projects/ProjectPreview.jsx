import { cn } from '@/lib/cn';

/**
 * Premium website-preview window. The outer frame stays still; crop, scale,
 * and parallax are applied only to the screenshot via CSS custom properties.
 *
 * @param {{
 *   src: string;
 *   alt: string;
 *   width?: number;
 *   height?: number;
 *   mode?: 'website' | 'cover';
 *   objectPosition?: string;
 *   objectPositionMd?: string;
 *   objectPositionLg?: string;
 *   scale?: number;
 *   shiftY?: string;
 *   shiftYMd?: string;
 *   shiftYLg?: string;
 *   parallax?: number;
 *   revealed?: boolean;
 *   reduced?: boolean;
 * }} props
 */
export function ProjectPreview({
  src,
  alt,
  width,
  height,
  mode = 'cover',
  objectPosition = 'center top',
  objectPositionMd,
  objectPositionLg,
  scale = 1,
  shiftY = '0px',
  shiftYMd,
  shiftYLg,
  parallax = 8,
  revealed = true,
  reduced = false,
}) {
  const play = revealed && !reduced;
  const website = mode === 'website';

  return (
    <div
      className={cn(
        'preview-frame relative h-full w-full overflow-hidden rounded-t-[6px]',
        'bg-[#f6f7f9] shadow-[inset_0_0_0_1px_rgb(20_26_34_/_0.06)]',
        play && 'animate-preview-frame',
        !play && !reduced && 'opacity-0',
      )}
      style={{
        '--preview-pos': objectPosition,
        '--preview-pos-md': objectPositionMd || objectPosition,
        '--preview-pos-lg': objectPositionLg || objectPositionMd || objectPosition,
        '--preview-base-scale': String(scale),
        '--preview-shift': shiftY,
        '--preview-shift-md': shiftYMd || shiftY,
        '--preview-shift-lg': shiftYLg || shiftYMd || shiftY,
        '--preview-parallax-max': reduced ? '0px' : `${parallax}px`,
      }}
    >
      <div
        className={cn(
          'preview-window absolute inset-0 overflow-hidden',
          play && 'animate-preview-unveil',
        )}
      >
        <div className="preview-parallax">
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            className={cn(
              'project-preview-image',
              website
                ? 'relative block h-auto w-full max-w-none'
                : 'absolute inset-0 h-full w-full object-cover',
            )}
          />
        </div>
      </div>
      <span aria-hidden="true" className="preview-frame-light" />
    </div>
  );
}
