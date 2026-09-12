import { SectionLabel } from '@/components/common/SectionLabel';

/**
 * Centered uppercase heading flanked by hairline rules.
 *
 * @param {{ title: string }} props
 */
export function TechnologiesHeader({ title }) {
  return <SectionLabel>{title}</SectionLabel>;
}
