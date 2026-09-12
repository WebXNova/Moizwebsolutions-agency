/**
 * @param {{ label: string; value: number | string }} props
 */
export function StatsCard({ label, value }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-5 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-[28px] font-light tracking-tight text-foreground">{value}</p>
    </div>
  );
}
