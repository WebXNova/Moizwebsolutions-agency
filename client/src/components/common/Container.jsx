import styles from '@/components/common/Container.module.css';

/**
 * @param {import('react').HTMLAttributes<HTMLDivElement> & { as?: keyof JSX.IntrinsicElements; children?: import('react').ReactNode }} props
 */
export function Container({ as: Tag = 'div', children, className, ...props }) {
  return (
    <Tag className={[styles.root, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </Tag>
  );
}
