/**
 * Homepage testimonial split layout: static intro + scrolling reviews.
 *
 * @typedef {Object} TestimonialIntroContent
 * @property {string} heading
 * @property {string} brand
 * @property {string} proofLabel
 * @property {string} ctaLabel
 * @property {string[]} avatars
 *
 * @typedef {Object} TestimonialReview
 * @property {string} id
 * @property {string} quote
 * @property {string} name
 * @property {string} company
 * @property {string} avatar
 */

export const testimonialIntro = {
  heading: "We've delivered 30+ projects for 20+ startup founders.",
  brand: 'MoizWebSolutions',
  proofLabel: 'Trusted by founders worldwide',
  ctaLabel: 'Leave a review',
  avatars: [
    'https://i.pravatar.cc/96?img=12',
    'https://i.pravatar.cc/96?img=32',
    'https://i.pravatar.cc/96?img=47',
    'https://i.pravatar.cc/96?img=5',
  ],
};

/** @type {TestimonialReview[]} */
export const testimonialReviews = [
  {
    id: 'review-krzysztof',
    quote:
      'They turned a messy brief into a product our team is proud to ship. Clear thinking, beautiful execution, zero drama.',
    name: 'Krzysztof Hejna',
    company: 'Vectura',
    avatar: 'https://i.pravatar.cc/96?img=12',
  },
  {
    id: 'review-amina',
    quote:
      'The site feels as sharp as the strategy behind it. We launched faster than expected and started converting immediately.',
    name: 'Amina Rahman',
    company: 'Northline',
    avatar: 'https://i.pravatar.cc/96?img=47',
  },
  {
    id: 'review-daniel',
    quote:
      'Rare mix of taste and technical depth. Every screen was considered, and the handoff to our engineers was effortless.',
    name: 'Daniel Cho',
    company: 'Lumen Studio',
    avatar: 'https://i.pravatar.cc/96?img=32',
  },
  {
    id: 'review-sofia',
    quote:
      'Our brand finally looks like the company we are becoming. Investors noticed. Customers noticed. That was the point.',
    name: 'Sofia Alvarez',
    company: 'Harbor & Co',
    avatar: 'https://i.pravatar.cc/96?img=5',
  },
  {
    id: 'review-james',
    quote:
      'From kickoff to launch they stayed close to the details that actually move a product. The work still feels premium months later.',
    name: 'James Okonkwo',
    company: 'Peakline',
    avatar: 'https://i.pravatar.cc/96?img=11',
  },
  {
    id: 'review-elena',
    quote:
      'A calm, senior team that makes hard product decisions look simple. The result is a website that sells without shouting.',
    name: 'Elena Voss',
    company: 'Brightfold',
    avatar: 'https://i.pravatar.cc/96?img=20',
  },
];
