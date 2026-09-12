/** @type {import('@/types').Service[]} */
export const services = [
  {
    id: 'web-design',
    number: '01',
    title: 'Web Design',
    description:
      'Editorial layouts, type systems and art direction built around what the business actually needs to say.',
  },
  {
    id: 'frontend-development',
    number: '02',
    title: 'Frontend Development',
    description:
      'Accessible, responsive interfaces in React with careful attention to performance and detail.',
  },
  {
    id: 'full-stack-development',
    number: '03',
    title: 'Full-Stack Development',
    description:
      'Node and Express services, database modelling and integrations that keep the product coherent.',
  },
  {
    id: 'ecommerce',
    number: '04',
    title: 'E-Commerce',
    description:
      'Storefronts, catalogues and checkout flows designed to reduce friction and increase conversion.',
  },
  {
    id: 'ui-ux',
    number: '05',
    title: 'UI/UX Design',
    description:
      'Research, flows and prototypes that resolve product questions before engineering begins.',
  },
  {
    id: 'marketing',
    number: '06',
    title: 'Digital Marketing',
    description:
      'SEO, social campaigns and performance work that help the products we build actually get found.',
  },
];

/** @type {import('@/types').ServiceGroup[]} */
export const serviceGroups = [
  {
    id: 'design',
    icon: 'design',
    label: 'Design',
    title: 'Design',
    description:
      'Product interfaces, type systems and brand-led UI — shaped for how people actually use the work.',
    details: [
      'UI Visual Design',
      'Product Interfaces',
      'Design Systems',
      'Responsive Layouts',
      'Prototypes',
      'Art Direction',
    ],
  },
  {
    id: 'development',
    icon: 'development',
    label: 'Development',
    title: 'Development',
    description:
      'Full-stack products in React and Node — APIs, databases, dashboards and portals built to last.',
    details: [
      'React / Frontend',
      'Node / Backend',
      'API Integration',
      'Databases',
      'Dashboards & Admin Panels',
      'Client Portals',
      'E-commerce',
      'Custom Web Applications',
    ],
  },
  {
    id: 'marketing',
    icon: 'marketing',
    label: 'Marketing',
    title: 'Marketing',
    description:
      'SEO, social and performance campaigns that help the work we design and develop get seen.',
    details: [
      'Digital Marketing',
      'Social Media Marketing',
      'SEO',
      'Content Strategy',
      'Performance Marketing',
      'Campaign Creatives',
      'Brand Promotion',
    ],
  },
  {
    id: 'graphic-designing',
    icon: 'graphic',
    label: 'Graphic Designing',
    title: 'Graphic Designing',
    description:
      'Visual identities, campaign assets and creative systems with a distinctive presence across digital and print.',
    details: [
      'Logo Design',
      'Brand Identity',
      'Posters & Banners',
      'Social Graphics',
      'Print Collateral',
      'Packaging',
    ],
  },
];

export const servicesContent = {
  title: 'Our services\nthat we provide',
  subtitle:
    'From full-stack web development to creative design and digital marketing, we build complete digital experiences designed to help brands grow.',
};
