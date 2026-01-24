'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Dialog, DialogContent } from './dialog';
import { Input } from './input';
import {
  Search,
  FileText,
  Settings,
  Users,
  FolderOpen,
  MessageSquare,
  Zap,
  HelpCircle,
  LogOut,
  Plus,
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  category?: string;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands?: CommandItem[];
  placeholder?: string;
  className?: string;
}

// Default commands
const defaultCommands: CommandItem[] = [
  {
    id: 'new-project',
    label: 'Create New Project',
    description: 'Start a new AI-powered project',
    icon: <Plus className="h-4 w-4" />,
    shortcut: '⌘N',
    category: 'Projects',
    action: () => {},
  },
  {
    id: 'open-project',
    label: 'Open Project',
    description: 'Switch to another project',
    icon: <FolderOpen className="h-4 w-4" />,
    shortcut: '⌘O',
    category: 'Projects',
    action: () => {},
  },
  {
    id: 'quick-message',
    label: 'Quick Message',
    description: 'Send a message to an agent',
    icon: <MessageSquare className="h-4 w-4" />,
    shortcut: '⌘M',
    category: 'Communication',
    action: () => {},
  },
  {
    id: 'run-task',
    label: 'Run Task',
    description: 'Execute a predefined task',
    icon: <Zap className="h-4 w-4" />,
    shortcut: '⌘R',
    category: 'Tasks',
    action: () => {},
  },
  {
    id: 'view-files',
    label: 'View Files',
    description: 'Browse project files',
    icon: <FileText className="h-4 w-4" />,
    shortcut: '⌘F',
    category: 'Navigation',
    action: () => {},
  },
  {
    id: 'team-members',
    label: 'Team Members',
    description: 'View and manage team',
    icon: <Users className="h-4 w-4" />,
    category: 'Team',
    action: () => {},
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Application settings',
    icon: <Settings className="h-4 w-4" />,
    shortcut: '⌘,',
    category: 'System',
    action: () => {},
  },
  {
    id: 'help',
    label: 'Help & Documentation',
    description: 'View guides and documentation',
    icon: <HelpCircle className="h-4 w-4" />,
    shortcut: '⌘?',
    category: 'System',
    action: () => {},
  },
  {
    id: 'logout',
    label: 'Log Out',
    description: 'Sign out of your account',
    icon: <LogOut className="h-4 w-4" />,
    category: 'System',
    action: () => {},
  },
];

export function CommandPalette({
  open,
  onOpenChange,
  commands = defaultCommands,
  placeholder = 'Type a command or search...',
  className,
}: CommandPaletteProps) {
  const [query, setQuery] = React.useState('');
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Filter commands by query
  const filteredCommands = React.useMemo(() => {
    if (!query) return commands;
    const searchTerm = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(searchTerm) ||
        cmd.description?.toLowerCase().includes(searchTerm) ||
        cmd.category?.toLowerCase().includes(searchTerm),
    );
  }, [commands, query]);

  // Group commands by category
  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      const category = cmd.category || 'General';
      if (!groups[category]) groups[category] = [];
      groups[category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Flat list for keyboard navigation
  const flatList = React.useMemo(() => filteredCommands, [filteredCommands]);

  // Reset on open/close
  React.useEffect(() => {
    if (open) {
      setQuery('');
      setHighlightedIndex(0);
    }
  }, [open]);

  // Reset highlight on query change
  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, flatList.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatList[highlightedIndex]) {
          flatList[highlightedIndex].action();
          onOpenChange(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onOpenChange(false);
        break;
    }
  };

  // Scroll highlighted item into view
  React.useEffect(() => {
    const items = listRef.current?.querySelectorAll('[data-command-item]');
    items?.[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  let itemIndex = 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-lg p-0', className)}>
        {/* Search input */}
        <div className="flex items-center border-b px-4">
          <Search className="mr-2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="h-12 flex-1 border-0 bg-transparent text-sm focus:outline-none focus:ring-0"
            autoFocus
          />
          <kbd className="rounded bg-muted px-2 py-1 text-xs">ESC</kbd>
        </div>

        {/* Commands list */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {flatList.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No commands found
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  {category}
                </div>
                {items.map((item) => {
                  const currentIndex = itemIndex++;
                  return (
                    <button
                      key={item.id}
                      data-command-item
                      onClick={() => {
                        item.action();
                        onOpenChange(false);
                      }}
                      onMouseEnter={() => setHighlightedIndex(currentIndex)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors',
                        currentIndex === highlightedIndex && 'bg-muted',
                      )}
                    >
                      <span className="text-muted-foreground">{item.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{item.label}</p>
                        {item.description && (
                          <p className="truncate text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.shortcut && (
                        <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {item.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="rounded bg-muted px-1 py-0.5">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="rounded bg-muted px-1 py-0.5">↵</kbd> select
            </span>
          </div>
          <span>DevTeam AI</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to open command palette with ⌘K
export function useCommandPalette() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { open, setOpen };
}
