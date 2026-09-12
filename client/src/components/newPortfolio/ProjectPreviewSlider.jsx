import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';

/**
 * One image at a time, with arrows, dots, keyboard, and swipe. No autoplay.
 *
 * @param {{
 *   images: Array<{ src: string; alt: string; width?: number; height?: number; objectPosition: string; zoom?: number }>;
 *   reduced?: boolean;
 *   label?: string;
 * }} props
 */
export function ProjectPreviewSlider({ images, reduced = false, label = 'Project previews' }) {
  const slides = images.slice(0, 5);
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);
  const labelId = useId();

  const goTo = useCallback(
    (next) => {
      if (count < 2) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  const onKeyDown = (event) => {
    if (count < 2) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    } else if (event.key === 'Home') {
      event.preventDefault();
      goTo(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      goTo(count - 1);
    }
  };

  const onPointerDown = (event) => {
    if (count < 2) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    tracking.current = true;
    startX.current = event.clientX;
    startY.current = event.clientY;
  };

  const onPointerUp = (event) => {
    if (!tracking.current) return;
    tracking.current = false;
    const dx = event.clientX - startX.current;
    const dy = event.clientY - startY.current;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) next();
    else prev();
  };

  if (!count) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-surface-muted text-[13px] text-muted-foreground">
        Preview unavailable
      </div>
    );
  }

  const current = slides[index] ?? slides[0];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="relative z-0 touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow/80 focus-visible:ring-offset-2"
    >
      <p id={labelId} className="sr-only">
        {label}
      </p>

      <div
        className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface-muted"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          tracking.current = false;
        }}
      >
        {slides.map((image, slideIndex) => {
          const active = slideIndex === index;
          return (
            <img
              key={`${image.src}-${image.objectPosition}-${slideIndex}`}
              src={image.src}
              alt={active ? image.alt : ''}
              width={image.width}
              height={image.height}
              loading={slideIndex === 0 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
              className={cn(
                'absolute inset-0 h-full w-full object-contain object-center',
                reduced ? 'transition-none' : 'transition-opacity duration-500 ease-out',
                active ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
              style={{ objectPosition: image.objectPosition || 'center top' }}
            />
          );
        })}

        {count > 1 ? (
          <>
            <SliderArrow direction="prev" onClick={prev} />
            <SliderArrow direction="next" onClick={next} />
            <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center">
              <div className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1.5">
                {slides.map((_, slideIndex) => (
                  <button
                    key={`dot-${slideIndex}`}
                    type="button"
                    aria-label={`Show image ${slideIndex + 1} of ${count}`}
                    aria-current={slideIndex === index ? 'true' : undefined}
                    onClick={(event) => {
                      event.stopPropagation();
                      goTo(slideIndex);
                    }}
                    className={cn(
                      'h-1.5 rounded-full transition-[width,background-color] duration-300',
                      slideIndex === index ? 'w-4 bg-brand-yellow' : 'w-1.5 bg-white/75 hover:bg-white',
                    )}
                  />
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>

      <p className="sr-only" aria-live="polite">
        Image {index + 1} of {count}: {current.alt}
      </p>
    </div>
  );
}

/**
 * @param {{ direction: 'prev' | 'next'; onClick: () => void }} props
 */
function SliderArrow({ direction, onClick }) {
  const isPrev = direction === 'prev';
  return (
    <button
      type="button"
      aria-label={isPrev ? 'Previous image' : 'Next image'}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        'absolute top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center',
        'rounded-full bg-black/50 text-white',
        'transition-colors duration-300 hover:bg-black/70',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow',
        isPrev ? 'left-3' : 'right-3',
      )}
    >
      {isPrev ? <ArrowLeftIcon className="h-4 w-4" /> : <ArrowRightIcon className="h-4 w-4" />}
    </button>
  );
}
