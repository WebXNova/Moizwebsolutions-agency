/** @type {import('@/types').ProcessStep[]} */
export const processSteps = [
  {
    id: 'discovery',
    step: 1,
    number: '1',
    title: 'Discovery & Strategy',
    icon: 'discovery',
    description: 'Goals, audience and constraints. We agree on what success looks like before anything is designed.',
  },
  {
    id: 'design',
    step: 2,
    number: '2',
    title: 'Iterative Design',
    icon: 'iterate',
    description: 'Type, layout and art direction, reviewed in the browser rather than in static mockups.',
  },
  {
    id: 'development',
    step: 3,
    number: '3',
    title: 'Agile Development',
    icon: 'agile',
    description: 'Component build, integrations and accessibility work, with staged previews throughout.',
  },
  {
    id: 'launch',
    step: 4,
    number: '4',
    title: 'Launch & Growth',
    icon: 'launch',
    description: 'Performance passes, analytics, handover documentation and post-release support.',
  },
];

export const processContent = {
  eyebrow: 'Process',
  title: 'Our process: the blueprint for success',
};
