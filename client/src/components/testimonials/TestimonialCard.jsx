/**
 * @param {{ testimonial: import('@/types').Testimonial }} props
 */
export function TestimonialCard({ testimonial }) {
  return (
    <figure>
      <blockquote>{testimonial.quote}</blockquote>
      <figcaption>
        <span>{testimonial.author}</span>
        {testimonial.role ? <span>{testimonial.role}</span> : null}
        {testimonial.company ? <span>{testimonial.company}</span> : null}
      </figcaption>
    </figure>
  );
}
