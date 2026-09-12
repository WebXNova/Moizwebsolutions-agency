/**
 * @param {{
 *   open: boolean;
 *   projectTitle?: string;
 *   loading?: boolean;
 *   onCancel: () => void;
 *   onConfirm: () => void;
 * }} props
 */
export function DeleteProjectModal({ open, projectTitle, loading, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-overlay"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="relative w-full max-w-md rounded-xl border border-border-subtle bg-surface p-6 shadow-elevated"
      >
        <h2 id="delete-dialog-title" className="text-[16px] font-medium text-foreground">
          Delete this project?
        </h2>
        {projectTitle ? (
          <p className="mt-2 text-[13px] text-muted-foreground">
            <strong className="text-foreground">{projectTitle}</strong> will be permanently removed.
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-border-subtle px-4 py-2 text-[13px] text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-danger px-4 py-2 text-[13px] font-medium text-white transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
