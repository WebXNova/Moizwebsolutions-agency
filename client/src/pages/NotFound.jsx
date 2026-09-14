import { Logo } from '@/components/navigation/Logo';
import { HeroCTA } from '@/components/hero/HeroCTA';

export function NotFoundPage() {
  return (
    <main className="relative flex min-h-[calc(100svh-var(--header-offset,4.5rem))] flex-col items-center justify-center overflow-hidden px-6 py-16 sm:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.4] [background-image:linear-gradient(to_right,rgb(17_24_32_/_0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(17_24_32_/_0.05)_1px,transparent_1px)] [background-size:4.5rem_4.5rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-brand-yellow/15 blur-[90px] dark:bg-brand-yellow/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-brand-blue/10 blur-[100px]"
      />

      <div className="relative z-[1] flex w-full max-w-[32rem] flex-col items-center text-center">
        <Logo compact />

        <h1 className="mt-10 font-display text-[clamp(4.5rem,18vw,9rem)] font-bold leading-none tracking-[-0.05em] text-foreground">
          4<span className="text-brand-yellow">0</span>4
        </h1>
        <span
          aria-hidden="true"
          className="mt-3 block h-[3px] w-16 rounded-full bg-brand-yellow"
        />

        <p className="mt-6 max-w-[22rem] text-body leading-relaxed text-secondary-foreground">
          Oops! This page could not be found.
        </p>

        <HeroCTA href="/" className="mt-10">
          Back to home
        </HeroCTA>
      </div>
    </main>
  );
}
