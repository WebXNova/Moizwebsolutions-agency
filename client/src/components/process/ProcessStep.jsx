/**
 * @param {{ step: import('@/types').ProcessStep }} props
 */
export function ProcessStep({ step }) {
  return (
    <li className="border-t border-border-subtle pt-6">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{step.number}</p>
      <h3 className="mt-7 text-[17px] font-normal tracking-[-0.02em] text-foreground md:text-[18px]">
        {step.title}
      </h3>
      <p className="mt-4 text-[13px] leading-[1.8] text-muted-foreground">{step.description}</p>
    </li>
  );
}
