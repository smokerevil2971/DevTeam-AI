'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { AgentAvatar, AgentType, AGENT_TYPES } from './agent-avatar';

interface AgentSelectorProps {
  selectedAgents?: AgentType[];
  onSelect?: (agent: AgentType) => void;
  onDeselect?: (agent: AgentType) => void;
  filter?: string;
  multiSelect?: boolean;
  showDescription?: boolean;
  className?: string;
}

export function AgentSelector({
  selectedAgents = [],
  onSelect,
  onDeselect,
  filter = '',
  multiSelect = true,
  showDescription = true,
  className,
}: AgentSelectorProps) {
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);

  const agents = Object.entries(AGENT_TYPES).filter(([key, agent]) => {
    const searchTerm = filter.toLowerCase();
    return (
      agent.name.toLowerCase().includes(searchTerm) ||
      agent.shortName.toLowerCase().includes(searchTerm) ||
      key.toLowerCase().includes(searchTerm)
    );
  });

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((i) => Math.min(i + 1, agents.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (agents[highlightedIndex]) {
            const [key] = agents[highlightedIndex];
            handleToggle(key as AgentType);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [agents, highlightedIndex]);

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('[data-agent-item]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  // Reset highlight when filter changes
  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [filter]);

  const handleToggle = (agentType: AgentType) => {
    const isSelected = selectedAgents.includes(agentType);
    if (isSelected) {
      onDeselect?.(agentType);
    } else {
      if (!multiSelect) {
        // Clear previous selections for single select
        selectedAgents.forEach((a) => onDeselect?.(a));
      }
      onSelect?.(agentType);
    }
  };

  if (agents.length === 0) {
    return (
      <div className={cn('p-4 text-center text-muted-foreground', className)}>
        No agents found
      </div>
    );
  }

  return (
    <div ref={listRef} className={cn('py-1', className)}>
      {agents.map(([key, agent], index) => {
        const agentType = key as AgentType;
        const isSelected = selectedAgents.includes(agentType);
        const isHighlighted = index === highlightedIndex;

        return (
          <button
            key={key}
            data-agent-item
            onClick={() => handleToggle(agentType)}
            onMouseEnter={() => setHighlightedIndex(index)}
            className={cn(
              'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
              isHighlighted && 'bg-muted',
              isSelected && 'bg-primary/10',
            )}
          >
            <AgentAvatar type={agentType} size="sm" showTooltip={false} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{agent.name}</span>
                <span className="text-xs text-muted-foreground">
                  @{agent.shortName.toLowerCase()}
                </span>
              </div>
              {showDescription && (
                <p className="truncate text-xs text-muted-foreground">
                  {agent.description}
                </p>
              )}
            </div>
            {isSelected && <span className="text-sm text-primary">✓</span>}
          </button>
        );
      })}
    </div>
  );
}

// Inline mention component for text
export function AgentMention({
  type,
  onClick,
  className,
}: {
  type: AgentType;
  onClick?: () => void;
  className?: string;
}) {
  const agent = AGENT_TYPES[type];

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-sm font-medium',
        'bg-primary/10 text-primary transition-colors hover:bg-primary/20',
        className,
      )}
    >
      <span>{agent.icon}</span>
      <span>@{agent.shortName}</span>
    </button>
  );
}
