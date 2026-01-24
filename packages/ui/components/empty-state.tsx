'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';
import {
  FileText,
  FolderOpen,
  MessageSquare,
  Users,
  Zap,
  Search,
  Plus,
  InboxIcon,
} from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[300px] flex-col items-center justify-center p-8 text-center',
        className,
      )}
    >
      {/* Icon */}
      <div className="mb-4 rounded-full bg-muted p-4">
        {icon || <InboxIcon className="h-8 w-8 text-muted-foreground" />}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>

      {/* Description */}
      {description && (
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button onClick={action.onClick}>
              <Plus className="mr-2 h-4 w-4" />
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Pre-built empty states for common use cases
export function EmptyProjects({
  onCreateProject,
}: {
  onCreateProject?: () => void;
}) {
  return (
    <EmptyState
      icon={<FolderOpen className="h-8 w-8 text-muted-foreground" />}
      title="No projects yet"
      description="Create your first project to start building with your AI development team."
      action={{
        label: 'Create Project',
        onClick: onCreateProject,
      }}
    />
  );
}

export function EmptyMessages({ onStartChat }: { onStartChat?: () => void }) {
  return (
    <EmptyState
      icon={<MessageSquare className="h-8 w-8 text-muted-foreground" />}
      title="No messages yet"
      description="Start a conversation with your AI agents to collaborate on your project."
      action={{
        label: 'Start Chat',
        onClick: onStartChat,
      }}
    />
  );
}

export function EmptyFiles({ onUploadFile }: { onUploadFile?: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="h-8 w-8 text-muted-foreground" />}
      title="No files yet"
      description="Upload files or create new ones to build your project."
      action={{
        label: 'Upload File',
        onClick: onUploadFile,
      }}
    />
  );
}

export function EmptyTeam({ onInviteMember }: { onInviteMember?: () => void }) {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8 text-muted-foreground" />}
      title="No team members"
      description="Invite collaborators to work together on your projects."
      action={{
        label: 'Invite Member',
        onClick: onInviteMember,
      }}
    />
  );
}

export function EmptySearch({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8 text-muted-foreground" />}
      title="No results found"
      description={
        query
          ? `No results for "${query}". Try a different search term.`
          : 'Try searching for something.'
      }
    />
  );
}

export function EmptyTasks({ onCreateTask }: { onCreateTask?: () => void }) {
  return (
    <EmptyState
      icon={<Zap className="h-8 w-8 text-muted-foreground" />}
      title="No tasks yet"
      description="Create tasks to track work and assign them to AI agents."
      action={{
        label: 'Create Task',
        onClick: onCreateTask,
      }}
    />
  );
}
