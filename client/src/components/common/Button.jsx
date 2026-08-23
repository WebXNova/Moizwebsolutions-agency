import styles from '@/components/common/Button.module.css';

/**
 * @param {import('react').ButtonHTMLAttributes<HTMLButtonElement> & { children?: import('react').ReactNode }} props
 */
export function Button({ children, className, ...props }) {
  return (
    <button type="button" className={[styles.root, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </button>
  );
}
