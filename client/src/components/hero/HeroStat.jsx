import { cn } from '@/lib/cn';
import { useCountUp } from '@/hooks/useCountUp';

const NUMERIC = /^(\d+)(.*)$/;

/**
 * @param {{ value: string; label: string; className?: string }} props
 */
export function HeroStat({ value, label, className }) {
  const match = String(value).match(NUMERIC);
  const target = match ? Number(match[1]) : null;
  const suffix = match ? match[2] : '';
  const [ref, counted] = useCountUp(target ?? 0);

  return (
    <div className={cn('text-left', className)}>
      <p
        ref={ref}
        className="font-display text-[36px] font-light leading-none tracking-[-0.03em] text-foreground md:text-[44px]"
      >
        {target === null ? value : `${counted}${suffix}`}
      </p>
      <p className="mt-3 text-meta uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
    </div>
  );
}
