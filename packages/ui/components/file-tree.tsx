'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Search,
  Plus,
  FolderPlus,
  MoreHorizontal,
  RefreshCw,
} from 'lucide-react';
import { AgentIcon, AgentType } from './agent-avatar';
import { Input } from './input';
import { Button } from './button';

export interface FileTreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
  language?: string;
  workingAgent?: AgentType;
  isExpanded?: boolean;
}

interface FileTreeProps {
  root: FileTreeNode;
  selectedId?: string;
  onSelect?: (node: FileTreeNode) => void;
  onToggle?: (node: FileTreeNode) => void;
  onCreateFile?: (parentId: string, name: string) => void;
  onCreateFolder?: (parentId: string, name: string) => void;
  onDelete?: (node: FileTreeNode) => void;
  onRename?: (node: FileTreeNode, newName: string) => void;
  onRefresh?: () => void;
  showSearch?: boolean;
  className?: string;
}

export function FileTree({
  root,
  selectedId,
  onSelect,
  onToggle,
  onCreateFile,
  onCreateFolder,
  onRefresh,
  showSearch = true,
  className,
}: FileTreeProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
    new Set([root.id]),
  );

  const handleToggle = (node: FileTreeNode) => {
    if (node.type === 'folder') {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) {
          next.delete(node.id);
        } else {
          next.add(node.id);
        }
        return next;
      });
      onToggle?.(node);
    }
  };

  // Filter nodes by search query
  const filterNodes = React.useCallback(
    (node: FileTreeNode): FileTreeNode | null => {
      if (!searchQuery) return node;

      const matchesSearch = node.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (node.type === 'file') {
        return matchesSearch ? node : null;
      }

      const filteredChildren = node.children
        ?.map(filterNodes)
        .filter(Boolean) as FileTreeNode[];

      if (matchesSearch || (filteredChildren && filteredChildren.length > 0)) {
        return { ...node, children: filteredChildren };
      }

      return null;
    },
    [searchQuery],
  );

  const filteredRoot = filterNodes(root);

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-2 py-2">
        <span className="text-xs font-semibold uppercase text-muted-foreground">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onCreateFile?.(root.id, 'untitled')}
            title="New File"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onCreateFolder?.(root.id, 'new-folder')}
            title="New Folder"
          >
            <FolderPlus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onRefresh}
            title="Refresh"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="border-b px-2 py-1.5">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full rounded border bg-muted/50 py-1 pl-7 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      )}

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {filteredRoot ? (
          <TreeNodeItem
            node={filteredRoot}
            depth={0}
            expandedIds={expandedIds}
            selectedId={selectedId}
            onSelect={onSelect}
            onToggle={handleToggle}
          />
        ) : (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No files found
          </div>
        )}
      </div>
    </div>
  );
}

// Recursive tree node item
function TreeNodeItem({
  node,
  depth,
  expandedIds,
  selectedId,
  onSelect,
  onToggle,
}: {
  node: FileTreeNode;
  depth: number;
  expandedIds: Set<string>;
  selectedId?: string;
  onSelect?: (node: FileTreeNode) => void;
  onToggle: (node: FileTreeNode) => void;
}) {
  const isFolder = node.type === 'folder';
  const isExpanded = expandedIds.has(node.id);
  const isSelected = node.id === selectedId;

  const handleClick = () => {
    if (isFolder) {
      onToggle(node);
    } else {
      onSelect?.(node);
    }
  };

  const handleDoubleClick = () => {
    if (!isFolder) {
      onSelect?.(node);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        className={cn(
          'flex cursor-pointer items-center gap-1 px-2 py-0.5 transition-colors hover:bg-muted/50',
          isSelected && 'bg-primary/10 text-primary',
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {/* Expand/collapse icon for folders */}
        {isFolder ? (
          <span className="flex h-4 w-4 items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </span>
        ) : (
          <span className="w-4" />
        )}

        {/* Folder/File icon */}
        {isFolder ? (
          isExpanded ? (
            <FolderOpen className="h-4 w-4 text-yellow-500" />
          ) : (
            <Folder className="h-4 w-4 text-yellow-500" />
          )
        ) : (
          <FileTypeIcon language={node.language} />
        )}

        {/* Name */}
        <span className="flex-1 truncate text-sm">{node.name}</span>

        {/* Working agent indicator */}
        {node.workingAgent && (
          <div className="animate-pulse">
            <AgentIcon type={node.workingAgent} className="text-xs" />
          </div>
        )}
      </div>

      {/* Children */}
      {isFolder && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              selectedId={selectedId}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// File type icon with colors
function FileTypeIcon({ language }: { language?: string }) {
  const colors: Record<string, string> = {
    typescript: 'text-blue-500',
    javascript: 'text-yellow-500',
    python: 'text-green-600',
    html: 'text-orange-500',
    css: 'text-purple-500',
    json: 'text-yellow-600',
    markdown: 'text-gray-400',
    tsx: 'text-blue-400',
    jsx: 'text-blue-300',
  };

  return (
    <File
      className={cn(
        'h-4 w-4',
        colors[language || ''] || 'text-muted-foreground',
      )}
    />
  );
}
