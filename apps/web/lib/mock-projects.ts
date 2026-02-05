export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  progress: number;
  status: 'building' | 'ready' | 'error' | 'idle';
  lastActivity: string;
  createdAt: Date;
}

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Platform',
    description:
      'Full-stack e-commerce application with product management, cart, and checkout',
    techStack: ['Next.js', 'PostgreSQL', 'Tailwind', 'Stripe'],
    progress: 75,
    status: 'building',
    lastActivity: '2 minutes ago',
    createdAt: new Date('2026-02-05'),
  },
  {
    id: '2',
    name: 'Task Management App',
    description: 'Collaborative task management tool with real-time updates',
    techStack: ['React', 'Firebase', 'Material-UI'],
    progress: 100,
    status: 'ready',
    lastActivity: '1 hour ago',
    createdAt: new Date('2026-02-04'),
  },
  {
    id: '3',
    name: 'Analytics Dashboard',
    description:
      'Business intelligence dashboard with charts and data visualization',
    techStack: ['Vue.js', 'MongoDB', 'Chart.js', 'Express'],
    progress: 45,
    status: 'building',
    lastActivity: '5 hours ago',
    createdAt: new Date('2026-02-03'),
  },
  {
    id: '4',
    name: 'Social Media API',
    description: 'RESTful API for a social networking platform',
    techStack: ['Node.js', 'PostgreSQL', 'Redis', 'GraphQL'],
    progress: 30,
    status: 'error',
    lastActivity: '1 day ago',
    createdAt: new Date('2026-02-02'),
  },
  {
    id: '5',
    name: 'Blog Platform',
    description: 'Content management system for bloggers and writers',
    techStack: ['Next.js', 'Prisma', 'Tailwind', 'Vercel'],
    progress: 90,
    status: 'building',
    lastActivity: '30 minutes ago',
    createdAt: new Date('2026-02-05'),
  },
  {
    id: '6',
    name: 'Portfolio Website',
    description: 'Personal portfolio with animations and modern design',
    techStack: ['Astro', 'Tailwind', 'Framer Motion'],
    progress: 100,
    status: 'ready',
    lastActivity: '3 days ago',
    createdAt: new Date('2026-01-30'),
  },
];
