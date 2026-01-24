'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Tooltip } from './tooltip';

// Agent type definitions
export const AGENT_TYPES = {
  project_manager: {
    name: 'Project Manager',
    shortName: 'PM',
    icon: '📋',
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    description: 'Coordinates tasks and manages project workflow',
  },
  frontend_dev: {
    name: 'Frontend Developer',
    shortName: 'FE',
    icon: '🎨',
    color: 'bg-purple-500',
    textColor: 'text-purple-500',
    description: 'Builds user interfaces and client-side logic',
  },
  backend_dev: {
    name: 'Backend Developer',
    shortName: 'BE',
    icon: '⚙️',
    color: 'bg-green-500',
    textColor: 'text-green-500',
    description: 'Develops server-side logic and APIs',
  },
  designer: {
    name: 'UI/UX Designer',
    shortName: 'UX',
    icon: '✨',
    color: 'bg-pink-500',
    textColor: 'text-pink-500',
    description: 'Creates visual designs and user experiences',
  },
  qa_engineer: {
    name: 'QA Engineer',
    shortName: 'QA',
    icon: '🔍',
    color: 'bg-orange-500',
    textColor: 'text-orange-500',
    description: 'Tests and ensures quality of the software',
  },
  devops: {
    name: 'DevOps Engineer',
    shortName: 'DO',
    icon: '🚀',
    color: 'bg-cyan-500',
    textColor: 'text-cyan-500',
    description: 'Manages deployment and infrastructure',
  },
  architect: {
    name: 'Solution Architect',
    shortName: 'SA',
    icon: '🏗️',
    color: 'bg-amber-500',
    textColor: 'text-amber-500',
    description: 'Designs system architecture and technical decisions',
  },
  security: {
    name: 'Security Specialist',
    shortName: 'SS',
    icon: '🛡️',
    color: 'bg-red-500',
    textColor: 'text-red-500',
    description: 'Ensures application security and compliance',
  },
} as const;

export type AgentType = keyof typeof AGENT_TYPES;

export type AgentStatus = 'active' | 'idle' | 'working' | 'error' | 'offline';

interface AgentAvatarProps {
  type: AgentType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: AgentStatus;
  showTooltip?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
  xl: 'h-14 w-14 text-lg',
};

const statusClasses = {
  active: 'bg-green-500',
  idle: 'bg-gray-400',
  working: 'bg-yellow-500 animate-pulse',
  error: 'bg-red-500',
  offline: 'bg-gray-600',
};

const statusIndicatorSizes = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
  lg: 'h-2.5 w-2.5',
  xl: 'h-3 w-3',
};

export function AgentAvatar({
  type,
  size = 'md',
  status,
  showTooltip = true,
  className,
}: AgentAvatarProps) {
  const agent = AGENT_TYPES[type];

  const avatar = (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full font-semibold',
        agent.color,
        sizeClasses[size],
        className,
      )}
    >
      <span className="text-white">{agent.icon}</span>

      {/* Status indicator */}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-background',
            statusClasses[status],
            statusIndicatorSizes[size],
          )}
        />
      )}
    </div>
  );

  if (showTooltip) {
    return (
      <Tooltip content={`${agent.name}${status ? ` (${status})` : ''}`}>
        {avatar}
      </Tooltip>
    );
  }

  return avatar;
}

// Agent badge (for inline mentions)
export function AgentBadge({
  type,
  className,
}: {
  type: AgentType;
  className?: string;
}) {
  const agent = AGENT_TYPES[type];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        agent.color,
        'text-white',
        className,
      )}
    >
      <span>{agent.icon}</span>
      <span>{agent.shortName}</span>
    </span>
  );
}

// Agent icon only
export function AgentIcon({
  type,
  className,
}: {
  type: AgentType;
  className?: string;
}) {
  const agent = AGENT_TYPES[type];
  return <span className={cn('text-lg', className)}>{agent.icon}</span>;
}
