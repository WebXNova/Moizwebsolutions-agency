/** Default CMS content mirrored from client static data files. */

export const defaultHero = {
  titleLines: ['Let\u2019s create', 'something', 'great', 'together'],
  paragraph:
    'Moiz Web Solutions is an independent studio building fast, considered websites for founders and growing teams. Strategy, interface design and engineering handled end to end.',
  cta: { label: 'Let\u2019s talk', url: '' },
  secondaryCta: { label: '', url: '' },
  badge: '',
  availability: 'Currently taking projects',
  stat: { value: '40+', label: 'Projects delivered' },
  imageUrl: '',
  imageAlt: 'Moiz Web Solutions hero visual',
  imagePosition: 'center',
  visible: true,
  video: { title: 'Moiz Web Solutions showreel', embedUrl: '' },
};

export const defaultServicesContent = {
  title: 'Our services\nthat we provide',
  subtitle:
    'From full-stack web development to creative design and digital marketing, we build complete digital experiences designed to help brands grow.',
};

export const defaultServiceGroups = [
  {
    slug: 'design',
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
    ctaText: '',
    ctaUrl: '',
    categoryLabel: 'Design',
    active: true,
    featured: false,
    displayOrder: 1,
  },
  {
    slug: 'development',
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
    ctaText: '',
    ctaUrl: '',
    categoryLabel: 'Development',
    active: true,
    featured: false,
    displayOrder: 2,
  },
  {
    slug: 'marketing',
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
    ctaText: '',
    ctaUrl: '',
    categoryLabel: 'Marketing',
    active: true,
    featured: false,
    displayOrder: 3,
  },
  {
    slug: 'graphic-designing',
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
    ctaText: '',
    ctaUrl: '',
    categoryLabel: 'Graphic Designing',
    active: true,
    featured: false,
    displayOrder: 4,
  },
];

export const defaultTestimonials = [
  {
    quote:
      'Working with this team was a game-changer for our business. Their attention to detail and creative approach exceeded our expectations.',
    author: 'Secta Marth',
    role: 'CEO',
    company: 'Tech Solutions Inc.',
    avatarUrl: 'https://i.pravatar.cc/96?img=32',
    verified: true,
    featured: false,
    published: true,
    displayOrder: 1,
  },
  {
    quote:
      'The website they built for us has significantly improved our online presence. Professional, responsive, and delivered on time.',
    author: 'John Smith',
    role: 'Marketing Director',
    company: 'Digital Agency',
    avatarUrl: 'https://i.pravatar.cc/96?img=11',
    verified: true,
    featured: false,
    published: true,
    displayOrder: 2,
  },
  {
    quote:
      'Outstanding work from start to finish. They understood our vision and brought it to life with exceptional quality and support.',
    author: 'Jane Doe',
    role: 'Product Manager',
    company: 'Startup Inc.',
    avatarUrl: 'https://i.pravatar.cc/96?img=5',
    verified: true,
    featured: false,
    published: true,
    displayOrder: 3,
  },
];

export const defaultTrustedCompanies = [
  { name: 'UpBeat', logoUrl: '/assets/logos/upbeat.svg', websiteUrl: '', logoAlt: 'UpBeat', active: true, displayOrder: 1 },
  { name: 'Google', logoUrl: '/assets/logos/google.svg', websiteUrl: '', logoAlt: 'Google', active: true, displayOrder: 2 },
  { name: 'Netflix', logoUrl: '/assets/logos/netflix.svg', websiteUrl: '', logoAlt: 'Netflix', active: true, displayOrder: 3 },
  { name: 'Slack', logoUrl: '/assets/logos/slack.svg', websiteUrl: '', logoAlt: 'Slack', active: true, displayOrder: 4 },
  { name: 'Intercom', logoUrl: '/assets/logos/intercom.svg', websiteUrl: '', logoAlt: 'Intercom', active: true, displayOrder: 5 },
];

export const defaultTechnologies = [
  { slug: 'react', name: 'React', category: 'Frontend', logoUrl: '/assets/tech/react.svg', color: '#61DAFB', invertOnDark: false, active: true, featured: false, displayOrder: 1 },
  { slug: 'javascript', name: 'JavaScript', category: 'Language', logoUrl: '/assets/tech/javascript.svg', color: '#F7DF1E', invertOnDark: false, active: true, featured: false, displayOrder: 2 },
  { slug: 'node', name: 'Node.js', category: 'Runtime', logoUrl: '/assets/tech/nodedotjs.svg', color: '#339933', invertOnDark: false, active: true, featured: false, displayOrder: 3 },
  { slug: 'express', name: 'Express', category: 'Backend', logoUrl: '/assets/tech/express.svg', color: '#888888', invertOnDark: true, active: true, featured: false, displayOrder: 4 },
  { slug: 'tailwind', name: 'Tailwind CSS', category: 'Styling', logoUrl: '/assets/tech/tailwindcss.svg', color: '#06B6D4', invertOnDark: false, active: true, featured: false, displayOrder: 5 },
  { slug: 'mysql', name: 'MySQL', category: 'Database', logoUrl: '/assets/tech/mysql.svg', color: '#4479A1', invertOnDark: false, active: true, featured: false, displayOrder: 6 },
  { slug: 'mongodb', name: 'MongoDB', category: 'Database', logoUrl: '/assets/tech/mongodb.svg', color: '#47A248', invertOnDark: false, active: true, featured: false, displayOrder: 7 },
  { slug: 'vite', name: 'Vite', category: 'Tooling', logoUrl: '/assets/tech/vite.svg', color: '#BD34FE', invertOnDark: false, active: true, featured: false, displayOrder: 8 },
  { slug: 'aws', name: 'AWS', category: 'Cloud', logoUrl: '/assets/tech/amazonaws.svg', color: '#FF9900', invertOnDark: false, active: true, featured: false, displayOrder: 9 },
  { slug: 'shopify', name: 'Shopify', category: 'Commerce', logoUrl: '/assets/tech/shopify.svg', color: '#95BF47', invertOnDark: false, active: true, featured: false, displayOrder: 10 },
];

export const defaultProcessSteps = [
  { stepNumber: 1, title: 'Discovery & Strategy', description: 'Goals, audience and constraints. We agree on what success looks like before anything is designed.', icon: 'discovery', active: true, displayOrder: 1 },
  { stepNumber: 2, title: 'Iterative Design', description: 'Type, layout and art direction, reviewed in the browser rather than in static mockups.', icon: 'iterate', active: true, displayOrder: 2 },
  { stepNumber: 3, title: 'Agile Development', description: 'Component build, integrations and accessibility work, with staged previews throughout.', icon: 'agile', active: true, displayOrder: 3 },
  { stepNumber: 4, title: 'Launch & Growth', description: 'Performance passes, analytics, handover documentation and post-release support.', icon: 'launch', active: true, displayOrder: 4 },
];

export const defaultSocialLinks = [
  { platform: 'facebook', href: 'https://facebook.com/', label: 'Facebook', icon: 'facebook', active: true, displayOrder: 1 },
  { platform: 'instagram', href: 'https://instagram.com/', label: 'Instagram', icon: 'instagram', active: true, displayOrder: 2 },
  { platform: 'linkedin', href: 'https://linkedin.com/', label: 'LinkedIn', icon: 'linkedin', active: true, displayOrder: 3 },
];

export const defaultSiteSettings = {
  site: {
    name: 'Moiz Web Solutions',
    shortName: 'MWS',
    tagline: 'Let\u2019s create something great together',
    description: 'Premium web design and development studio.',
    url: '',
    locale: 'en',
    timezone: 'UTC',
    copyright: `\u00a9 ${new Date().getFullYear()} Moiz Web Solutions. All rights reserved.`,
  },
  contact: {
    email: 'moizwebsolutions@gmail.com',
    phone: '',
    whatsapp: '',
    address: 'Remote \u2014 working with clients worldwide',
    officeLocation: '',
    businessHours: '',
    contactCta: 'Start Your Project',
    mapsUrl: '',
    availability: 'Currently taking projects',
  },
  cta: {
    eyebrow: 'Contact',
    headline: 'READY TO BUILD / SOMETHING / EXCEPTIONAL?',
    title: 'Ready to build something exceptional?',
    subtitle:
      'Tell us about the project, the timeline and what success looks like. We reply to every enquiry within two working days.',
    cta: { label: 'Start Your Project', url: '' },
    secondaryText: '',
    visible: true,
  },
  heroCta: {
    heading: 'Let\u2019s create something great together',
    description:
      'From strategy to launch, we help brands build digital products that look exceptional and perform reliably.',
    primaryCta: { label: 'Start a project', url: '' },
    secondaryCta: { label: '', url: '' },
    label: '',
    backgroundImageUrl: '',
    visible: true,
  },
  footer: {
    tagline: 'Let\u2019s create something great together',
    description: 'Premium web design and development studio.',
    visible: true,
    quickLinks: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Refund Policy', href: '/refund' },
    ],
  },
  seo: {
    homeTitle: 'Moiz Web Solutions | Web Design & Development Agency',
    homeDescription: 'Premium web design and development studio building fast, considered websites.',
    defaultKeywords: 'web design, web development, graphic design, digital marketing',
    ogTitle: 'Moiz Web Solutions',
    ogDescription: 'Premium web design and development studio.',
    ogImage: '',
    twitterCard: 'summary_large_image',
    canonicalUrl: '',
    robots: 'index,follow',
  },
  sectionLabels: {
    testimonials: 'Client testimonials',
    trustedCompanies: 'Trusted companies',
    technologiesEyebrow: 'Technologies',
    technologiesTitle: 'Technologies we master',
    technologiesSubtitle:
      'Tools chosen because they are stable, well documented and fast to maintain years after launch.',
    processEyebrow: 'Process',
    processTitle: 'Our process: the blueprint for success',
  },
  servicesContent: {
    title: 'Our services\nthat we provide',
    subtitle:
      'From full-stack web development to creative design and digital marketing, we build complete digital experiences designed to help brands grow.',
  },
};
