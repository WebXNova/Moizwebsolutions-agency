import { cn } from '@/lib/cn';

/**
 * @param {{ label: string; children: import('react').ReactNode; error?: string; className?: string; required?: boolean }} props
 */
export function FormField({ label, children, error, className, required }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-[12px] font-medium text-foreground">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      {children}
      {error ? <p className="mt-1 text-[12px] text-danger">{error}</p> : null}
    </label>
  );
}

export const inputClass =
  'w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring';

export const textareaClass =
  'w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]';

/**
 * @param {{ status: string; className?: string }} props
 */
export function StatusBadge({ status, className }) {
  const normalized = status.toLowerCase();
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide',
        normalized === 'published' || normalized === 'active' || normalized === 'new' || normalized === 'sent'
          ? 'bg-brand-navy/10 text-brand-navy'
          : '',
        normalized === 'draft' || normalized === 'pending' || normalized === 'archived' ? 'bg-surface-muted text-muted-foreground' : '',
        normalized === 'featured' || normalized === 'won' ? 'bg-brand-yellow/20 text-brand-ink' : '',
        normalized === 'scheduled' || normalized === 'contacted' || normalized === 'qualified' || normalized === 'proposal'
          ? 'bg-brand-blue/10 text-brand-blue'
          : '',
        normalized === 'expired' || normalized === 'inactive' || normalized === 'lost' || normalized === 'failed'
          ? 'bg-danger/10 text-danger'
          : '',
        className,
      )}
    >
      {status}
    </span>
  );
}

/**
 * @param {{ open: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void; loading?: boolean }} props
 */
export function ConfirmModal({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-overlay" onClick={onCancel} aria-label="Close" />
      <div className="relative w-full max-w-md rounded-xl border border-border-subtle bg-surface p-6 shadow-elevated">
        <h3 className="text-[16px] font-medium text-foreground">{title}</h3>
        <p className="mt-2 text-[13px] text-muted-foreground">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border-subtle px-4 py-2 text-[12px] text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-danger px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-50"
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * @param {{ title: string; description?: string; actions?: import('react').ReactNode; children: import('react').ReactNode }} props
 */
export function AdminPanel({ title, description, actions, children }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border-subtle px-4 py-4 sm:px-6">
        <div>
          <h2 className="text-[15px] font-medium text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 text-[12px] text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

/**
 * @param {{ onSelect: (file: File) => void; uploading?: boolean; previewUrl?: string; label?: string }} props
 */
export function ImageUploadField({ onSelect, uploading, previewUrl, label = 'Upload image' }) {
  return (
    <div className="space-y-3">
      {previewUrl ? (
        <img src={previewUrl} alt="" className="max-h-40 rounded-lg border border-border-subtle object-contain" />
      ) : null}
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border-subtle px-4 py-2 text-[12px] font-medium text-foreground hover:bg-surface-muted">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onSelect(file);
            e.target.value = '';
          }}
        />
        {uploading ? 'Uploading…' : label}
      </label>
    </div>
  );
}
