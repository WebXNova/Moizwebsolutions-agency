import { ProcessStep } from '@/components/process/ProcessStep';

/**
 * @param {{ steps?: import('@/types').ProcessStep[] }} props
 */
export function ProcessGrid({ steps = [] }) {
  return (
    <div>
      {steps.map((step) => (
        <ProcessStep key={step.id} step={step} />
      ))}
    </div>
  );
}
