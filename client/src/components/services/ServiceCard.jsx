/**
 * @param {{ service: import('@/types').Service }} props
 */
export function ServiceCard({ service }) {
  return (
    <article>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
    </article>
  );
}
