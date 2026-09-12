/**
 * Technology marks shown in the homepage strip.
 *
 * Logos are official Simple Icons SVGs (CC0 paths; trademarks remain with
 * their owners), with brand fills applied. Vite uses the official gradient
 * mark; JavaScript uses the two-colour ECMAScript square.
 */
export const technologies = [
  {
    id: 'react',
    name: 'React',
    category: 'Frontend',
    logo: '/assets/tech/react.svg',
    color: '#61DAFB',
    width: 24,
    height: 24,
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'Language',
    logo: '/assets/tech/javascript.svg',
    color: '#F7DF1E',
    width: 256,
    height: 256,
  },
  {
    id: 'node',
    name: 'Node.js',
    category: 'Runtime',
    logo: '/assets/tech/nodedotjs.svg',
    color: '#339933',
    width: 24,
    height: 24,
  },
  {
    id: 'express',
    name: 'Express',
    category: 'Backend',
    logo: '/assets/tech/express.svg',
    color: '#888888',
    invertOnDark: true,
    width: 24,
    height: 24,
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    category: 'Styling',
    logo: '/assets/tech/tailwindcss.svg',
    color: '#06B6D4',
    width: 24,
    height: 24,
  },
  {
    id: 'mysql',
    name: 'MySQL',
    category: 'Database',
    logo: '/assets/tech/mysql.svg',
    color: '#4479A1',
    width: 24,
    height: 24,
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'Database',
    logo: '/assets/tech/mongodb.svg',
    color: '#47A248',
    width: 24,
    height: 24,
  },
  {
    id: 'vite',
    name: 'Vite',
    category: 'Tooling',
    logo: '/assets/tech/vite.svg',
    color: '#BD34FE',
    width: 410,
    height: 404,
  },
  {
    id: 'aws',
    name: 'AWS',
    category: 'Cloud',
    logo: '/assets/tech/amazonaws.svg',
    color: '#FF9900',
    width: 24,
    height: 24,
  },
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'Commerce',
    logo: '/assets/tech/shopify.svg',
    color: '#95BF47',
    width: 24,
    height: 24,
  },
];

export const technologiesContent = {
  eyebrow: 'Technologies',
  title: 'Technologies we master',
  subtitle:
    'Tools chosen because they are stable, well documented and fast to maintain years after launch.',
};
