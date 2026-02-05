import { Card } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Progress } from './progress';
import Link from 'next/link';

export interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  progress: number;
  status: 'building' | 'ready' | 'error' | 'idle';
  lastActivity: string;
  onDelete?: () => void;
}

export function ProjectCard({
  id,
  name,
  description,
  techStack,
  progress,
  status,
  lastActivity,
  onDelete,
}: ProjectCardProps) {
  const statusConfig = {
    building: { label: 'Building', color: 'bg-blue-500' },
    ready: { label: 'Ready', color: 'bg-green-500' },
    error: { label: 'Error', color: 'bg-red-500' },
    idle: { label: 'Idle', color: 'bg-gray-500' },
  };

  const statusInfo = statusConfig[status];

  return (
    <Card className="group transition-all duration-200 hover:border-primary/50 hover:shadow-lg">
      <div className="space-y-4 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold transition-colors group-hover:text-primary">
              {name}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="ml-4 flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${statusInfo.color}`} />
            <Badge variant="secondary" className="text-xs">
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2">
          {techStack.slice(0, 3).map((tech) => (
            <Badge key={tech} variant="outline" className="text-xs">
              {tech}
            </Badge>
          ))}
          {techStack.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{techStack.length - 3}
            </Badge>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Last Activity */}
        <p className="text-xs text-muted-foreground">
          Last activity: {lastActivity}
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link href={`/workspace/${id}`} className="flex-1">
            <Button variant="default" className="w-full" size="sm">
              Open
            </Button>
          </Link>
          <Link href={`/dashboard/projects/${id}/settings`}>
            <Button variant="outline" size="sm">
              Settings
            </Button>
          </Link>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
