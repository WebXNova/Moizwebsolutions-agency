import { ProcessStep } from '@/components/process/ProcessStep';

/**
 * @param {{ steps?: import('@/types').ProcessStep[] }} props
 */
export function ProcessGrid({ steps = [] }) {
  return (
    <ol className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6">
      {steps.map((step) => (
        <ProcessStep key={step.id} step={step} />
      ))}
    </ol>
  );
}
