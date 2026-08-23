/**
 * @param {{ step: import('@/types').ProcessStep }} props
 */
export function ProcessStep({ step }) {
  return (
    <article>
      <span>{step.step}</span>
      <h3>{step.title}</h3>
      <p>{step.description}</p>
    </article>
  );
}
