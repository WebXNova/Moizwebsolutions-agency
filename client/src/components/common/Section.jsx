import styles from '@/components/common/Section.module.css';

/**
 * @param {import('react').HTMLAttributes<HTMLElement> & { as?: keyof JSX.IntrinsicElements; id?: string; children?: import('react').ReactNode }} props
 */
export function Section({ as: Tag = 'section', children, className, ...props }) {
  return (
    <Tag className={[styles.root, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </Tag>
  );
}
