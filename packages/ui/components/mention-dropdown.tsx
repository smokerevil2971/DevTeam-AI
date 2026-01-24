'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { AgentAvatar, AgentType, AGENT_TYPES } from './agent-avatar';

interface MentionDropdownProps {
  query: string;
  onSelect: (agentType: AgentType) => void;
  onClose: () => void;
  position?: { top: number; left: number };
  className?: string;
}

export function MentionDropdown({
  query,
  onSelect,
  onClose,
  position,
  className,
}: MentionDropdownProps) {
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Filter agents by query
  const filteredAgents = React.useMemo(() => {
    const searchTerm = query.toLowerCase();
    return Object.entries(AGENT_TYPES).filter(
      ([key, agent]) =>
        agent.name.toLowerCase().includes(searchTerm) ||
        agent.shortName.toLowerCase().includes(searchTerm) ||
        key.toLowerCase().includes(searchTerm),
    );
  }, [query]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((i) =>
            Math.min(i + 1, filteredAgents.length - 1),
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          if (filteredAgents[highlightedIndex]) {
            onSelect(filteredAgents[highlightedIndex][0] as AgentType);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredAgents, highlightedIndex, onSelect, onClose]);

  // Reset highlight when query changes
  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  // Scroll selected item into view
  React.useEffect(() => {
    const items = listRef.current?.querySelectorAll('[data-mention-item]');
    items?.[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  if (filteredAgents.length === 0) {
    return (
      <div
        className={cn(
          'absolute z-50 w-64 rounded-md border bg-popover shadow-lg',
          className,
        )}
        style={
          position ? { top: position.top, left: position.left } : undefined
        }
      >
        <div className="p-3 text-sm text-muted-foreground">No agents found</div>
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className={cn(
        'absolute z-50 max-h-60 w-64 overflow-y-auto rounded-md border bg-popover shadow-lg',
        className,
      )}
      style={position ? { top: position.top, left: position.left } : undefined}
    >
      <div className="py-1">
        {filteredAgents.map(([key, agent], index) => (
          <button
            key={key}
            data-mention-item
            onClick={() => onSelect(key as AgentType)}
            onMouseEnter={() => setHighlightedIndex(index)}
            className={cn(
              'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
              highlightedIndex === index && 'bg-muted',
            )}
          >
            <AgentAvatar
              type={key as AgentType}
              size="sm"
              showTooltip={false}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{agent.name}</p>
              <p className="text-xs text-muted-foreground">
                @{agent.shortName.toLowerCase()}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
