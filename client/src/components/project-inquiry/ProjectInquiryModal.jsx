import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { contactConfig } from '@/config/contact';
import { inquiryContent, inquirySteps } from '@/data/projectInquiry';
import { ContactDetailsStep } from '@/components/project-inquiry/ContactDetailsStep';
import { GhostAction, PrimaryAction } from '@/components/project-inquiry/InquiryActions';
import { InquiryProgress } from '@/components/project-inquiry/InquiryProgress';
import { InquiryErrorNotice } from '@/components/project-inquiry/InquiryErrorNotice';
import { ProjectDetailsStep } from '@/components/project-inquiry/ProjectDetailsStep';
import { ProjectReview } from '@/components/project-inquiry/ProjectReview';
import { ProjectSuccess } from '@/components/project-inquiry/ProjectSuccess';
import { ServiceSelector } from '@/components/project-inquiry/ServiceSelector';
import { useOverlay } from '@/hooks/useOverlay';
import {
  buildProjectInquiryMailto,
  buildProjectInquiryWhatsApp,
} from '@/lib/buildProjectInquiryMessage';
import { ProjectInquiryError, sendProjectInquiry } from '@/services/projectInquiry';
import { ArrowLeftIcon, CheckIcon, CloseIcon, MailIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';

const EXIT_DURATION = 260;

const EMPTY_FORM = {
  services: /** @type {string[]} */ ([]),
  projectTypes: /** @type {Record<string, string[]>} */ ({}),
  description: '',
  currency: 'PKR',
  budget: '',
  timeline: '',
  name: '',
  business: '',
  email: '',
  phone: '',
  website: '',
  social: '',
};

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Required-field rules for one wizard step. Kept as a pure function so the
 * final submit can re-run every step's rules before anything leaves the
 * browser, and land the visitor on the first step that still needs attention.
 *
 * @param {number} index
 * @param {typeof EMPTY_FORM} form
 * @returns {Record<string, string>}
 */
function collectStepErrors(index, form) {
  /** @type {Record<string, string>} */
  const next = {};

  if (index === 0 && form.services.length === 0) {
    next.services = 'Select at least one service to continue.';
  }

  if (index === 1 && form.description.trim().length < 10) {
    next.description = 'A sentence or two about the project helps us respond properly.';
  }

  if (index === 2) {
    if (!form.name.trim()) next.name = 'Please tell us your name.';
    if (!form.email.trim()) next.email = 'An email address is required.';
    else if (!EMAIL_PATTERN.test(form.email.trim())) {
      next.email = 'Please enter a valid email address.';
    }
  }

  return next;
}

/** Maps a server-side field error back to the step that owns the field. */
const FIELD_STEP = {
  services: 0,
  description: 1,
  currency: 1,
  budget: 1,
  timeline: 1,
  name: 2,
  email: 2,
};

/**
 * Progressive project brief workspace: services → project → contact → review.
 *
 * @param {{ isOpen: boolean; onClose: () => void }} props
 */
export function ProjectInquiryModal({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(isOpen);
  const [closing, setClosing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [direction, setDirection] = useState(/** @type {'forward' | 'back'} */ ('forward'));
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState(/** @type {Record<string, string>} */ ({}));

  /** idle → sending → sent → success | error. `success` is only ever set by the server. */
  const [status, setStatus] = useState(
    /** @type {'idle' | 'sending' | 'sent' | 'success' | 'error'} */ ('idle'),
  );
  const [sendError, setSendError] = useState('');
  const [receipt, setReceipt] = useState(
    /** @type {{ inquiryId: string; submittedAtLabel: string; confirmationSent: boolean } | null} */ (
      null
    ),
  );

  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const headingRef = useRef(/** @type {HTMLHeadingElement | null} */ (null));
  const honeypotRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  /** Second guard behind the disabled button, for Enter-key repeats. */
  const inFlightRef = useRef(false);

  const submitted = status === 'success';
  const sending = status === 'sending';

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setClosing(false);
      return undefined;
    }

    if (!mounted) return undefined;

    setClosing(true);
    const timer = window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
      setStepIndex(0);
      setMaxReached(0);
      setDirection('forward');
      setForm(EMPTY_FORM);
      setErrors({});
      setStatus('idle');
      setSendError('');
      setReceipt(null);
      inFlightRef.current = false;
    }, EXIT_DURATION);

    return () => window.clearTimeout(timer);
  }, [isOpen, mounted]);

  // A brief mid-flight (including the short SENT confirmation) must survive
  // an accidental Escape or backdrop click.
  const requestClose = useCallback(() => {
    if (inFlightRef.current) return;
    onClose();
  }, [onClose]);

  useOverlay({ isOpen: mounted, onClose: requestClose });

  useEffect(() => {
    if (!mounted || closing) return;
    const target = headingRef.current ?? panelRef.current;
    target?.focus({ preventScroll: true });
  }, [mounted, closing, stepIndex, submitted]);

  const handleTabKey = useCallback((event) => {
    if (event.key !== 'Tab' || !panelRef.current) return;

    const focusable = Array.from(panelRef.current.querySelectorAll(FOCUSABLE)).filter(
      (node) => node instanceof HTMLElement && node.offsetParent !== null,
    );
    if (focusable.length === 0) return;

    const first = /** @type {HTMLElement} */ (focusable[0]);
    const last = /** @type {HTMLElement} */ (focusable[focusable.length - 1]);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  const toggleService = useCallback((id) => {
    setForm((prev) => {
      const services = prev.services.includes(id)
        ? prev.services.filter((service) => service !== id)
        : [...prev.services, id];

      const projectTypes = { ...prev.projectTypes };
      if (!services.includes(id)) delete projectTypes[id];

      return { ...prev, services, projectTypes };
    });
    setErrors((prev) => ({ ...prev, services: '' }));
  }, []);

  const toggleProjectType = useCallback((serviceId, type) => {
    setForm((prev) => {
      const current = prev.projectTypes[serviceId] ?? [];
      const next = current.includes(type)
        ? current.filter((value) => value !== type)
        : [...current, type];

      return { ...prev, projectTypes: { ...prev.projectTypes, [serviceId]: next } };
    });
  }, []);

  const updateField = useCallback((field, value) => {
    setForm((prev) => {
      if (field === 'currency' && prev.currency !== value) {
        return { ...prev, currency: value, budget: '' };
      }
      return { ...prev, [field]: value };
    });
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const validateStep = useCallback(
    (index) => {
      const next = collectStepErrors(index, form);
      setErrors(next);
      return Object.keys(next).length === 0;
    },
    [form],
  );

  const goToStep = useCallback(
    (index) => {
      setDirection(index > stepIndex ? 'forward' : 'back');
      setStepIndex(index);
      setMaxReached((prev) => Math.max(prev, index));
    },
    [stepIndex],
  );

  const handleContinue = useCallback(() => {
    if (!validateStep(stepIndex)) return;
    if (stepIndex < inquirySteps.length - 1) goToStep(stepIndex + 1);
  }, [goToStep, stepIndex, validateStep]);

  const handleBack = useCallback(() => {
    if (stepIndex > 0) goToStep(stepIndex - 1);
  }, [goToStep, stepIndex]);

  const handleSubmit = useCallback(async () => {
    if (inFlightRef.current) return;

    // Re-run every step's rules, not just the review step's.
    for (let index = 0; index < inquirySteps.length - 1; index += 1) {
      const stepErrors = collectStepErrors(index, form);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        setStatus('idle');
        setSendError('');
        goToStep(index);
        return;
      }
    }

    inFlightRef.current = true;
    setErrors({});
    setSendError('');
    setStatus('sending');

    try {
      const result = await sendProjectInquiry(form, {
        honeypot: honeypotRef.current?.value ?? '',
      });

      // Success is set here and nowhere else — only the server can produce it.
      setReceipt({
        inquiryId: result.inquiryId,
        submittedAtLabel: result.submittedAtLabel,
        confirmationSent: result.confirmationSent,
      });
      setStatus('sent');
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduceMotion) {
        await new Promise((resolve) => window.setTimeout(resolve, 700));
      }
      setStatus('success');
    } catch (error) {
      const message =
        error instanceof ProjectInquiryError
          ? error.message
          : 'Something went wrong while sending your project brief. Please try again.';

      if (error instanceof ProjectInquiryError && Object.keys(error.fieldErrors).length > 0) {
        setErrors(error.fieldErrors);
        const firstStep = Math.min(
          ...Object.keys(error.fieldErrors).map((field) => FIELD_STEP[field] ?? 2),
        );
        goToStep(firstStep);
      }

      setSendError(message);
      setStatus('error');
    } finally {
      inFlightRef.current = false;
    }
  }, [form, goToStep]);

  const whatsappDigits = useMemo(() => contactConfig.phone?.replace(/\D/g, '') ?? '', []);

  // Fallback routes offered when the API cannot be reached.
  const whatsappHref = useMemo(
    () => (whatsappDigits ? buildProjectInquiryWhatsApp(form, whatsappDigits) : undefined),
    [form, whatsappDigits],
  );
  const mailtoHref = useMemo(
    () => (contactConfig.email ? buildProjectInquiryMailto(form, contactConfig.email) : undefined),
    [form],
  );

  if (!mounted) return null;

  const activeStep = inquirySteps[stepIndex];
  const stepCopy = inquiryContent.steps[activeStep.id];
  const isReview = stepIndex === inquirySteps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-stretch justify-center sm:items-center sm:p-4 md:p-6 lg:p-8"
      onKeyDown={handleTabKey}
    >
      <div
        aria-hidden="true"
        onClick={requestClose}
        className={cn(
          'absolute inset-0 bg-panel-backdrop backdrop-blur-[6px]',
          closing
            ? 'motion-safe:animate-backdrop-out motion-reduce:animate-none'
            : 'motion-safe:animate-backdrop-in motion-reduce:animate-none',
        )}
      />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute left-1/2 top-[12%] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-brand-yellow/12 blur-[130px]" />
        <span className="absolute bottom-[6%] right-[14%] h-[24rem] w-[24rem] rounded-full bg-brand-blue/12 blur-[130px]" />
      </div>

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-title"
        tabIndex={-1}
        className={cn(
          'relative flex h-full w-full flex-col overflow-hidden border-hairline bg-panel outline-none',
          'sm:h-auto sm:max-h-[92vh] sm:rounded-xl sm:border',
          'max-w-none sm:max-w-3xl lg:max-w-5xl xl:max-w-[74rem]',
          'shadow-elevated',
          closing
            ? 'motion-safe:animate-panel-exit motion-reduce:animate-none'
            : 'motion-safe:animate-panel-enter motion-reduce:animate-none',
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-yellow to-transparent opacity-70"
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-35"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--hairline) 1px, transparent 1px), linear-gradient(to bottom, var(--hairline) 1px, transparent 1px)',
            backgroundSize: '58px 58px',
            maskImage: 'radial-gradient(115% 70% at 50% 0%, black, transparent 68%)',
            WebkitMaskImage: 'radial-gradient(115% 70% at 50% 0%, black, transparent 68%)',
          }}
        />

        <header className="relative shrink-0 border-b border-hairline px-5 pb-4 pt-5 sm:px-8 sm:pb-5 sm:pt-8 lg:px-10">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[0.5625rem] font-medium uppercase tracking-[0.24em] text-brand-yellow-deep dark:text-brand-yellow">
                Start a project
              </p>
              <h2
                id="inquiry-title"
                className="mt-2 text-[1.1875rem] font-medium leading-[1.15] tracking-[-0.03em] text-ink sm:mt-2.5 sm:text-[1.75rem] lg:text-[2rem]"
              >
                {inquiryContent.title}
              </h2>
              <p className="mt-2.5 hidden max-w-xl text-[0.8125rem] leading-relaxed text-ink-muted sm:block">
                {inquiryContent.subtitle}
              </p>
            </div>

            <button
              type="button"
              aria-label="Close project brief"
              onClick={requestClose}
              disabled={sending || status === 'sent'}
              className="-mr-1.5 -mt-1.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-transparent text-ink-muted transition-[color,background-color,border-color,transform,opacity] duration-200 hover:border-hairline hover:bg-panel-soft hover:text-ink motion-safe:hover:rotate-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:rotate-0 disabled:hover:border-transparent disabled:hover:bg-transparent"
            >
              <CloseIcon className="h-4.5 w-4.5" />
            </button>
          </div>

          {submitted ? null : (
            <div className="mt-5 sm:mt-6">
              <InquiryProgress
                activeIndex={stepIndex}
                maxReached={maxReached}
                onStepSelect={goToStep}
              />
            </div>
          )}
        </header>

        <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-7 sm:px-8 sm:py-8 lg:px-10">
          {submitted ? (
            <ProjectSuccess
              form={form}
              receipt={receipt}
              whatsappHref={whatsappHref}
              onClose={onClose}
            />
          ) : (
            <div
              key={activeStep.id}
              className={cn(
                'motion-reduce:animate-none',
                direction === 'forward'
                  ? 'motion-safe:animate-step-forward'
                  : 'motion-safe:animate-step-back',
              )}
            >
              <div className="mb-7">
                <h3
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-[1.0625rem] font-medium tracking-[-0.015em] text-ink outline-none sm:text-[1.1875rem]"
                >
                  {stepCopy.heading}
                </h3>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-muted">
                  {stepCopy.hint}
                </p>
              </div>

              {stepIndex === 0 ? (
                <ServiceSelector
                  selected={form.services}
                  onToggle={toggleService}
                  error={errors.services}
                />
              ) : null}

              {stepIndex === 1 ? (
                <ProjectDetailsStep
                  form={form}
                  errors={errors}
                  onFieldChange={updateField}
                  onProjectTypeToggle={toggleProjectType}
                />
              ) : null}

              {stepIndex === 2 ? (
                <ContactDetailsStep form={form} errors={errors} onFieldChange={updateField} />
              ) : null}

              {stepIndex === 3 ? (
                <>
                  {status === 'error' ? (
                    <InquiryErrorNotice
                      message={sendError}
                      whatsappHref={whatsappHref}
                      mailtoHref={mailtoHref}
                    />
                  ) : null}
                  <ProjectReview form={form} onEditStep={goToStep} />
                </>
              ) : null}
            </div>
          )}
        </div>

        {submitted ? null : (
          <footer className="relative shrink-0 border-t border-hairline bg-panel-soft px-5 py-4 sm:px-8 lg:px-10">
            {/* Bots fill this in; people never see or tab into it. */}
            <input
              ref={honeypotRef}
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              defaultValue=""
              className="pointer-events-none absolute left-[-9999px] h-px w-px opacity-0"
            />

            <p aria-live="polite" className="sr-only">
              {sending
                ? 'Sending your project brief.'
                : status === 'sent'
                  ? 'Project brief sent.'
                  : ''}
            </p>

            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                {stepIndex > 0 ? (
                  <GhostAction
                    onClick={handleBack}
                    disabled={sending || status === 'sent'}
                    icon={
                      <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform duration-300 motion-safe:group-hover:-translate-x-0.5" />
                    }
                  >
                    Back
                  </GhostAction>
                ) : (
                  <p className="hidden text-[0.6875rem] text-ink-faint sm:block">
                    Step {activeStep.index} of {inquirySteps.length.toString().padStart(2, '0')}
                  </p>
                )}
              </div>

              {isReview ? (
                <PrimaryAction
                  onClick={handleSubmit}
                  loading={sending}
                  disabled={status === 'sent'}
                  withArrow={!sending && status !== 'sent'}
                  icon={
                    sending ? null : status === 'sent' ? (
                      <CheckIcon className="relative h-3.5 w-3.5" />
                    ) : (
                      <MailIcon className="relative h-3.5 w-3.5" />
                    )
                  }
                >
                  {sending
                    ? inquiryContent.sendingLabel
                    : status === 'sent'
                      ? inquiryContent.sentLabel
                      : status === 'error'
                        ? inquiryContent.retryLabel
                        : inquiryContent.submitLabel}
                </PrimaryAction>
              ) : (
                <PrimaryAction onClick={handleContinue}>Continue</PrimaryAction>
              )}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
