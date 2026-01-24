'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { AgentAvatar, AgentType, AGENT_TYPES } from './agent-avatar';

export interface ActivityItem {
  id: string;
  agentType: AgentType;
  action: string;
  details?: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface AgentActivityFeedProps {
  activities: ActivityItem[];
  groupByAgent?: boolean;
  showTimestamp?: boolean;
  maxItems?: number;
  className?: string;
  onActivityClick?: (activity: ActivityItem) => void;
}

export function AgentActivityFeed({
  activities,
  groupByAgent = false,
  showTimestamp = true,
  maxItems = 50,
  className,
  onActivityClick,
}: AgentActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  if (groupByAgent) {
    // Group activities by agent
    const grouped = displayActivities.reduce(
      (acc, activity) => {
        if (!acc[activity.agentType]) {
          acc[activity.agentType] = [];
        }
        acc[activity.agentType].push(activity);
        return acc;
      },
      {} as Record<AgentType, ActivityItem[]>,
    );

    return (
      <div className={cn('space-y-4', className)}>
        {Object.entries(grouped).map(([agentType, agentActivities]) => (
          <div key={agentType}>
            <div className="mb-2 flex items-center gap-2">
              <AgentAvatar
                type={agentType as AgentType}
                size="sm"
                showTooltip={false}
              />
              <span className="text-sm font-medium">
                {AGENT_TYPES[agentType as AgentType].name}
              </span>
            </div>
            <div className="ml-8 space-y-1">
              {agentActivities.map((activity) => (
                <ActivityItemRow
                  key={activity.id}
                  activity={activity}
                  showTimestamp={showTimestamp}
                  showAgent={false}
                  onClick={onActivityClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {displayActivities.map((activity) => (
        <ActivityItemRow
          key={activity.id}
          activity={activity}
          showTimestamp={showTimestamp}
          showAgent
          onClick={onActivityClick}
        />
      ))}
    </div>
  );
}

function ActivityItemRow({
  activity,
  showTimestamp,
  showAgent,
  onClick,
}: {
  activity: ActivityItem;
  showTimestamp: boolean;
  showAgent: boolean;
  onClick?: (activity: ActivityItem) => void;
}) {
  const typeColors = {
    info: 'text-muted-foreground',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
  };

  return (
    <div
      onClick={() => onClick?.(activity)}
      className={cn(
        'flex items-start gap-2 rounded-md p-2 transition-colors',
        onClick && 'cursor-pointer hover:bg-muted',
      )}
    >
      {showAgent && (
        <AgentAvatar type={activity.agentType} size="sm" showTooltip />
      )}
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm', typeColors[activity.type])}>
          {activity.action}
        </p>
        {activity.details && (
          <p className="truncate text-xs text-muted-foreground">
            {activity.details}
          </p>
        )}
      </div>
      {showTimestamp && (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatTimeAgo(activity.timestamp)}
        </span>
      )}
    </div>
  );
}

// Simple time ago function
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString();
}

// Live activity indicator
export function ActivityIndicator({
  isActive,
  className,
}: {
  isActive: boolean;
  className?: string;
}) {
  if (!isActive) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
      </span>
      <span className="text-xs text-muted-foreground">Live</span>
    </div>
  );
}
