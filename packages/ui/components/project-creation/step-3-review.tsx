import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Users,
  CheckCircle2,
  Edit,
} from 'lucide-react';
import { Button } from '../button';
import { Badge } from '../badge';
import { cn } from '../../lib/utils';

interface ProjectPlan {
  summary: string;
  techStack: string[];
  tasks: TaskSection[];
  team: TeamMember[];
}

interface TaskSection {
  agent: string;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
}

interface TeamMember {
  role: string;
  agent: string;
  responsibilities: string[];
}

interface Step3ReviewProps {
  projectPlan: ProjectPlan;
  onApprove: () => void;
  onEdit: () => void;
  onBack: () => void;
}

// Generate mock project plan
export function generateMockPlan(description: string): ProjectPlan {
  return {
    summary: `Based on your description, we'll build a modern web application with a focus on user experience and scalability. The project will follow industry best practices and be deployed on cloud infrastructure.`,
    techStack: [
      'React',
      'TypeScript',
      'Node.js',
      'PostgreSQL',
      'Redis',
      'Docker',
      'AWS',
    ],
    tasks: [
      {
        agent: 'Frontend Developer',
        tasks: [
          {
            id: 'fe-1',
            title: 'Setup React + TypeScript project',
            description:
              'Initialize project with Vite, configure ESLint and Prettier',
            estimatedHours: 4,
          },
          {
            id: 'fe-2',
            title: 'Build core UI components',
            description: 'Create reusable component library with Tailwind CSS',
            estimatedHours: 12,
          },
          {
            id: 'fe-3',
            title: 'Implement main features',
            description: 'Develop key user-facing features and workflows',
            estimatedHours: 24,
          },
        ],
      },
      {
        agent: 'Backend Developer',
        tasks: [
          {
            id: 'be-1',
            title: 'Setup Node.js API server',
            description:
              'Initialize Express.js with TypeScript, logging, and error handling',
            estimatedHours: 6,
          },
          {
            id: 'be-2',
            title: 'Implement authentication',
            description: 'Setup JWT authentication with refresh tokens',
            estimatedHours: 8,
          },
          {
            id: 'be-3',
            title: 'Build API endpoints',
            description: 'Create RESTful API with validation and documentation',
            estimatedHours: 20,
          },
        ],
      },
      {
        agent: 'Database Engineer',
        tasks: [
          {
            id: 'db-1',
            title: 'Design database schema',
            description: 'Create ERD and normalize tables',
            estimatedHours: 6,
          },
          {
            id: 'db-2',
            title: 'Setup PostgreSQL with migrations',
            description:
              'Configure database with version-controlled migrations',
            estimatedHours: 4,
          },
        ],
      },
      {
        agent: 'DevOps Engineer',
        tasks: [
          {
            id: 'do-1',
            title: 'Setup CI/CD pipeline',
            description: 'Configure GitHub Actions for testing and deployment',
            estimatedHours: 8,
          },
          {
            id: 'do-2',
            title: 'Configure cloud infrastructure',
            description: 'Setup AWS resources with Infrastructure as Code',
            estimatedHours: 12,
          },
        ],
      },
    ],
    team: [
      {
        role: 'Frontend Developer',
        agent: 'FE Agent',
        responsibilities: [
          'UI/UX implementation',
          'State management',
          'Client-side routing',
        ],
      },
      {
        role: 'Backend Developer',
        agent: 'BE Agent',
        responsibilities: [
          'API development',
          'Business logic',
          'Data validation',
        ],
      },
      {
        role: 'Database Engineer',
        agent: 'DB Agent',
        responsibilities: [
          'Schema design',
          'Query optimization',
          'Data migration',
        ],
      },
      {
        role: 'DevOps Engineer',
        agent: 'DevOps Agent',
        responsibilities: ['CI/CD', 'Infrastructure', 'Monitoring'],
      },
      {
        role: 'QA Engineer',
        agent: 'QA Agent',
        responsibilities: [
          'Test automation',
          'Quality assurance',
          'Bug tracking',
        ],
      },
    ],
  };
}

export function Step3Review({
  projectPlan,
  onApprove,
  onEdit,
  onBack,
}: Step3ReviewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['Frontend Developer']),
  );

  const toggleSection = (agent: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(agent)) {
        next.delete(agent);
      } else {
        next.add(agent);
      }
      return next;
    });
  };

  const totalHours = projectPlan.tasks.reduce(
    (sum, section) =>
      sum + section.tasks.reduce((s, task) => s + task.estimatedHours, 0),
    0,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold">Review Your Project Plan</h2>
        <p className="mt-2 text-muted-foreground">
          Review the plan created by our PM. You can edit or approve to start
          building.
        </p>
      </div>

      {/* Project Summary */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-3 text-lg font-semibold">Project Summary</h3>
        <p className="text-muted-foreground">{projectPlan.summary}</p>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{projectPlan.team.length} team members</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {projectPlan.tasks.reduce((sum, s) => sum + s.tasks.length, 0)}{' '}
              tasks
            </span>
          </div>
          <div>Estimated: ~{totalHours} hours</div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-3 text-lg font-semibold">Tech Stack</h3>
        <div className="flex flex-wrap gap-2">
          {projectPlan.techStack.map((tech) => (
            <Badge key={tech} variant="secondary">
              {tech}
            </Badge>
          ))}
        </div>
      </div>

      {/* Task Breakdown */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Task Breakdown</h3>
        <div className="space-y-3">
          {projectPlan.tasks.map((section) => {
            const isExpanded = expandedSections.has(section.agent);
            const sectionHours = section.tasks.reduce(
              (sum, t) => sum + t.estimatedHours,
              0,
            );

            return (
              <div key={section.agent} className="border-b last:border-0">
                <button
                  onClick={() => toggleSection(section.agent)}
                  className="flex w-full items-center justify-between py-3 text-left hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'rounded-full p-1.5 transition-colors',
                        isExpanded
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted',
                      )}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{section.agent}</p>
                      <p className="text-sm text-muted-foreground">
                        {section.tasks.length} tasks • ~{sectionHours}h
                      </p>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="ml-10 space-y-2 pb-3">
                    {section.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-md border bg-muted/30 p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{task.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {task.description}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="ml-2 whitespace-nowrap"
                          >
                            ~{task.estimatedHours}h
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Assignment */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Team Assignments</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {projectPlan.team.map((member) => (
            <div key={member.role} className="rounded-md border p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {member.agent.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{member.role}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.agent}
                  </p>
                </div>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {member.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 text-xs">•</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button onClick={onBack} variant="outline">
            Back
          </Button>
          <Button onClick={onEdit} variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Plan
          </Button>
        </div>
        <Button onClick={onApprove} size="lg">
          Approve & Start Building
        </Button>
      </div>
    </div>
  );
}
