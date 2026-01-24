'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { X, Circle, MoreHorizontal, Plus } from 'lucide-react';
import { AgentIcon, AgentType } from './agent-avatar';

export interface EditorTab {
  id: string;
  filename: string;
  filepath: string;
  language?: string;
  isModified?: boolean;
  isActive?: boolean;
  workingAgent?: AgentType;
}

interface EditorTabsProps {
  tabs: EditorTab[];
  activeTabId?: string;
  onTabClick?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onTabReorder?: (fromIndex: number, toIndex: number) => void;
  onNewTab?: () => void;
  className?: string;
}

export function EditorTabs({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onTabReorder,
  onNewTab,
  className,
}: EditorTabsProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onTabReorder?.(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Scroll active tab into view
  React.useEffect(() => {
    if (activeTabId && containerRef.current) {
      const activeTab = containerRef.current.querySelector(
        `[data-tab-id="${activeTabId}"]`,
      );
      activeTab?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeTabId]);

  return (
    <div className={cn('flex items-center border-b bg-muted/30', className)}>
      {/* Tab list container with horizontal scroll */}
      <div
        ref={containerRef}
        className="scrollbar-hide flex flex-1 items-center overflow-x-auto"
      >
        {tabs.map((tab, index) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            isDragging={draggedIndex === index}
            onClick={() => onTabClick?.(tab.id)}
            onClose={() => onTabClose?.(tab.id)}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      {/* New tab button */}
      {onNewTab && (
        <button
          onClick={onNewTab}
          className="flex-shrink-0 p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          title="New file"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Individual tab item
function TabItem({
  tab,
  isActive,
  isDragging,
  onClick,
  onClose,
  onDragStart,
  onDragOver,
  onDragEnd,
}: {
  tab: EditorTab;
  isActive: boolean;
  isDragging: boolean;
  onClick: () => void;
  onClose: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      data-tab-id={tab.id}
      draggable
      onClick={onClick}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={cn(
        'group flex min-w-0 cursor-pointer items-center gap-2 border-r px-3 py-2 transition-colors',
        isActive
          ? 'border-b-2 border-b-primary bg-background text-foreground'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
        isDragging && 'opacity-50',
      )}
    >
      {/* File icon based on language */}
      <FileIcon language={tab.language} />

      {/* Filename */}
      <span className="max-w-[120px] truncate text-sm">{tab.filename}</span>

      {/* Modified indicator */}
      {tab.isModified && !tab.workingAgent && (
        <Circle className="h-2 w-2 fill-current text-muted-foreground" />
      )}

      {/* Working agent indicator */}
      {tab.workingAgent && (
        <div className="animate-pulse">
          <AgentIcon type={tab.workingAgent} className="text-sm" />
        </div>
      )}

      {/* Close button */}
      <button
        onClick={handleCloseClick}
        className={cn(
          'rounded p-0.5 transition-colors hover:bg-muted',
          !isActive && 'opacity-0 group-hover:opacity-100',
        )}
        title="Close"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

// Simple file icon based on language
function FileIcon({ language }: { language?: string }) {
  const iconColors: Record<string, string> = {
    typescript: 'text-blue-500',
    javascript: 'text-yellow-500',
    python: 'text-green-500',
    html: 'text-orange-500',
    css: 'text-purple-500',
    json: 'text-gray-500',
    markdown: 'text-gray-400',
  };

  const color = language
    ? iconColors[language] || 'text-muted-foreground'
    : 'text-muted-foreground';

  return (
    <div className={cn('font-mono text-xs', color)}>
      {language?.slice(0, 2).toUpperCase() || 'FI'}
    </div>
  );
}
