'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import {
  AgentAvatar,
  AgentType,
  AgentStatus,
  AGENT_TYPES,
} from './agent-avatar';
import { Progress } from './progress';
import { Button } from './button';
import { Pause, Play, MessageSquare, MoreHorizontal } from 'lucide-react';

interface AgentStatusCardProps {
  type: AgentType;
  status: AgentStatus;
  currentTask?: string;
  progress?: number;
  recentActivity?: string[];
  onPause?: () => void;
  onResume?: () => void;
  onMessage?: () => void;
  className?: string;
}

export function AgentStatusCard({
  type,
  status,
  currentTask,
  progress,
  recentActivity = [],
  onPause,
  onResume,
  onMessage,
  className,
}: AgentStatusCardProps) {
  const agent = AGENT_TYPES[type];
  const isPaused = status === 'idle';

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 transition-all hover:shadow-md',
        status === 'error' && 'border-destructive/50',
        status === 'working' && 'border-primary/50',
        className,
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <AgentAvatar
            type={type}
            size="lg"
            status={status}
            showTooltip={false}
          />
          <div>
            <h3 className="font-semibold">{agent.name}</h3>
            <p className={cn('text-xs capitalize', agent.textColor)}>
              {status}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Current Task */}
      {currentTask && (
        <div className="mb-3">
          <p className="mb-1 text-xs text-muted-foreground">Current Task</p>
          <p className="line-clamp-2 text-sm">{currentTask}</p>
        </div>
      )}

      {/* Progress */}
      {typeof progress === 'number' && status === 'working' && (
        <div className="mb-3">
          <Progress value={progress} showLabel size="sm" />
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-xs text-muted-foreground">Recent Activity</p>
          <ul className="space-y-1">
            {recentActivity.slice(0, 3).map((activity, i) => (
              <li key={i} className="truncate text-xs text-muted-foreground">
                • {activity}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 border-t pt-2">
        {isPaused ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onResume}
            className="flex-1"
          >
            <Play className="mr-1 h-3 w-3" />
            Resume
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onPause}
            className="flex-1"
          >
            <Pause className="mr-1 h-3 w-3" />
            Pause
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onMessage}>
          <MessageSquare className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// Compact version for sidebars
export function AgentStatusCompact({
  type,
  status,
  currentTask,
  onClick,
  className,
}: {
  type: AgentType;
  status: AgentStatus;
  currentTask?: string;
  onClick?: () => void;
  className?: string;
}) {
  const agent = AGENT_TYPES[type];

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted',
        className,
      )}
    >
      <AgentAvatar type={type} size="sm" status={status} showTooltip={false} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{agent.shortName}</p>
        {currentTask && (
          <p className="truncate text-xs text-muted-foreground">
            {currentTask}
          </p>
        )}
      </div>
    </button>
  );
}
