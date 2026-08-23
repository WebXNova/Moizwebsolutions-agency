import styles from '@/components/common/IconButton.module.css';

/**
 * @param {import('react').ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children?: import('react').ReactNode }} props
 */
export function IconButton({ label, children, className, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={[styles.root, className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
