import styles from '@/components/common/SectionHeading.module.css';

/**
 * @param {{ eyebrow?: string; title?: string; subtitle?: string; className?: string }} props
 */
export function SectionHeading({ eyebrow, title, subtitle, className }) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      {eyebrow ? <p>{eyebrow}</p> : null}
      {title ? <h2>{title}</h2> : null}
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  );
}
