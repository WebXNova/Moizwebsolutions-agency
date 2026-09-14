import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '@/lib/icons';
import { useOverlay } from '@/hooks/useOverlay';
import { cn } from '@/lib/cn';
import { REVIEW_CHAR_LIMIT, REVIEW_CTA_CLASS } from '@/components/testimonials/reviewCta';

const emptyForm = {
  name: '',
  projectName: '',
  website: '',
  contactNumber: '',
  rating: 0,
  review: '',
};

const fieldClass =
  'w-full border-0 border-b border-black/20 bg-transparent py-2.5 text-[0.9375rem] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-black dark:border-white/25 dark:focus:border-white';

const labelClass =
  'mb-1 block text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-foreground';

/**
 * @param {{
 *   htmlFor: string;
 *   children: string;
 * }} props
 */
function RequiredLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className={labelClass}>
      {children}
      <span className="ml-0.5 text-red-500" aria-hidden="true">
        *
      </span>
    </label>
  );
}

/**
 * @param {{ value: number; onChange: (value: number) => void }} props
 */
function RatingStars({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div
      className="flex items-center gap-1.5"
      onMouseLeave={() => setHovered(0)}
      role="radiogroup"
      aria-label="Rating"
    >
      {Array.from({ length: 5 }, (_, index) => {
        const rating = index + 1;
        const filled = rating <= active;

        return (
          <button
            key={rating}
            type="button"
            role="radio"
            aria-checked={value === rating}
            aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
            onMouseEnter={() => setHovered(rating)}
            onClick={() => onChange(rating)}
            className="rounded-sm p-0.5 text-[#FFC107] transition-transform hover-capable:hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7"
              fill={filled ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path
                strokeLinejoin="round"
                d="M12 3.4 14.6 9l6.4.7-4.8 4.3 1.4 6.3L12 17.3 6.4 20.3l1.4-6.3L3 9.7 9.4 9z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onSubmit: (review: import('@/data/testimonialSlider').TestimonialReview) => void;
 * }} props
 */
export function LeaveReviewModal({ isOpen, onClose, onSubmit }) {
  const formId = useId();
  const [form, setForm] = useState(emptyForm);
  const [ratingError, setRatingError] = useState(false);

  useOverlay({ isOpen, onClose });

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm);
      setRatingError(false);
    }
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const remaining = REVIEW_CHAR_LIMIT - form.review.length;

  /**
   * @param {import('react').ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} event
   */
  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'review' ? value.slice(0, REVIEW_CHAR_LIMIT) : value,
    }));
  }

  /**
   * @param {import('react').FormEvent<HTMLFormElement>} event
   */
  function handleSubmit(event) {
    event.preventDefault();
    if (form.rating < 1) {
      setRatingError(true);
      return;
    }

    onSubmit({
      id: `review-${Date.now()}`,
      quote: form.review.trim(),
      name: form.name.trim(),
      company: form.projectName.trim(),
      avatar: `https://i.pravatar.cc/96?u=${encodeURIComponent(form.name.trim())}`,
    });

    setForm(emptyForm);
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-6 sm:px-6">
      <button
        type="button"
        aria-label="Close review form"
        onClick={onClose}
        className="absolute inset-0 bg-black/55"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
        className="relative z-10 flex max-h-[min(90vh,44rem)] w-full max-w-[34rem] flex-col overflow-hidden rounded-3xl bg-white shadow-[0_24px_64px_-24px_rgb(0_0_0_/_0.45)] dark:bg-surface-elevated"
      >
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <header className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-white px-6 pb-4 pt-6 sm:px-8 dark:bg-surface-elevated">
            <div className="min-w-0 pr-8">
              <h2
                id={`${formId}-title`}
                className="text-[1.65rem] font-bold leading-tight tracking-[-0.03em] text-foreground sm:text-[1.85rem]"
              >
                Leave a review
              </h2>
              <p className="mt-1.5 text-[0.9375rem] text-muted-foreground">
                Worked with us? Tell founders what it was like.
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-black/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </header>

          <div
            className={cn(
              'min-h-0 flex-1 overflow-y-auto px-6 py-2 sm:px-8',
              '[&::-webkit-scrollbar]:w-1.5',
              '[&::-webkit-scrollbar-track]:bg-transparent',
              '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/25',
              '[scrollbar-width:thin] [scrollbar-color:rgb(0_0_0_/_0.28)_transparent]',
            )}
          >
            <div className="flex flex-col gap-6 pb-4">
              <div>
                <RequiredLabel htmlFor={`${formId}-name`}>Your name</RequiredLabel>
                <input
                  id={`${formId}-name`}
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  autoComplete="name"
                  required
                  className={fieldClass}
                />
              </div>

              <div>
                <RequiredLabel htmlFor={`${formId}-project`}>Project name</RequiredLabel>
                <input
                  id={`${formId}-project`}
                  name="projectName"
                  value={form.projectName}
                  onChange={updateField}
                  required
                  className={fieldClass}
                />
              </div>

              <div>
                <RequiredLabel htmlFor={`${formId}-website`}>Website or app store link</RequiredLabel>
                <input
                  id={`${formId}-website`}
                  name="website"
                  type="text"
                  inputMode="url"
                  value={form.website}
                  onChange={updateField}
                  placeholder="https://"
                  required
                  className={fieldClass}
                />
              </div>

              <div>
                <RequiredLabel htmlFor={`${formId}-contact`}>Contact number</RequiredLabel>
                <input
                  id={`${formId}-contact`}
                  name="contactNumber"
                  type="tel"
                  value={form.contactNumber}
                  onChange={updateField}
                  autoComplete="tel"
                  required
                  className={fieldClass}
                />
              </div>

              <div>
                <p className={labelClass}>Rating</p>
                <RatingStars
                  value={form.rating}
                  onChange={(rating) => {
                    setForm((current) => ({ ...current, rating }));
                    setRatingError(false);
                  }}
                />
                {ratingError ? (
                  <p role="alert" className="mt-2 text-[0.75rem] text-red-500">
                    Please choose a star rating.
                  </p>
                ) : null}
              </div>

              <div>
                <RequiredLabel htmlFor={`${formId}-review`}>Your review</RequiredLabel>
                <textarea
                  id={`${formId}-review`}
                  name="review"
                  value={form.review}
                  onChange={updateField}
                  required
                  rows={4}
                  maxLength={REVIEW_CHAR_LIMIT}
                  className="w-full resize-none rounded-[20px] border border-border-subtle bg-transparent px-4 py-3 text-[0.9375rem] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-border-interactive"
                />
                <p className="mt-2 text-right text-[0.75rem] text-muted-foreground">
                  {remaining} characters left
                </p>
              </div>
            </div>
          </div>

          <footer className="flex flex-wrap items-end justify-between gap-4 bg-white px-6 py-5 sm:px-8 dark:bg-surface-elevated">
            <p className="max-w-[14.5rem] text-[0.75rem] leading-snug text-muted-foreground">
              Reviews are checked before they appear. Your number stays private.
            </p>
            <button type="submit" className={cn(REVIEW_CTA_CLASS, 'shrink-0 px-6')}>
              Submit
            </button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
