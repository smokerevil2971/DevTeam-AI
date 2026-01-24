'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Tooltip } from './tooltip';
import {
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  Code2,
  Settings,
  Users,
  FileText,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: number | string;
}

interface SidebarProps {
  items?: NavItem[];
  activeId?: string;
  bottomItems?: NavItem[];
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const defaultNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  { id: 'chat', label: 'Chat', icon: <MessageSquare className="h-5 w-5" /> },
  {
    id: 'projects',
    label: 'Projects',
    icon: <FolderKanban className="h-5 w-5" />,
  },
  { id: 'editor', label: 'Editor', icon: <Code2 className="h-5 w-5" /> },
  { id: 'files', label: 'Files', icon: <FileText className="h-5 w-5" /> },
  { id: 'team', label: 'Team', icon: <Users className="h-5 w-5" /> },
];

const defaultBottomItems: NavItem[] = [
  { id: 'automation', label: 'Automation', icon: <Zap className="h-5 w-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

export function Sidebar({
  items = defaultNavItems,
  activeId,
  bottomItems = defaultBottomItems,
  collapsed = false,
  onCollapsedChange,
  header,
  footer,
  className,
}: SidebarProps) {
  return (
    <div
      className={cn(
        'bg-sidebar-background flex h-full flex-col transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
        className,
      )}
    >
      {/* Header */}
      {header && <div className="flex-shrink-0 border-b p-4">{header}</div>}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1 px-2">
          {items.map((item) => (
            <NavItemComponent
              key={item.id}
              item={item}
              isActive={item.id === activeId}
              collapsed={collapsed}
            />
          ))}
        </ul>
      </nav>

      {/* Bottom items */}
      <div className="border-t py-2">
        <ul className="space-y-1 px-2">
          {bottomItems.map((item) => (
            <NavItemComponent
              key={item.id}
              item={item}
              isActive={item.id === activeId}
              collapsed={collapsed}
            />
          ))}
        </ul>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => onCollapsedChange?.(!collapsed)}
        className="flex h-10 items-center justify-center border-t text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Footer */}
      {footer && !collapsed && (
        <div className="flex-shrink-0 border-t p-4">{footer}</div>
      )}
    </div>
  );
}

// Individual nav item
function NavItemComponent({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  const content = (
    <li>
      <button
        onClick={item.onClick}
        className={cn(
          'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
          isActive
            ? 'bg-primary/10 font-medium text-primary'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          collapsed && 'justify-center px-0',
        )}
      >
        <span className="flex-shrink-0">{item.icon}</span>
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left">{item.label}</span>
            {item.badge && (
              <span className="flex-shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                {item.badge}
              </span>
            )}
          </>
        )}
      </button>
    </li>
  );

  if (collapsed) {
    return (
      <Tooltip content={item.label} side="right">
        {content}
      </Tooltip>
    );
  }

  return content;
}

// Icon-only mini sidebar
export function MiniSidebar({
  items = defaultNavItems,
  activeId,
  bottomItems = defaultBottomItems,
  className,
}: {
  items?: NavItem[];
  activeId?: string;
  bottomItems?: NavItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-sidebar-background flex h-full w-14 flex-col border-r',
        className,
      )}
    >
      <nav className="flex-1 py-2">
        <ul className="space-y-1 px-1">
          {items.map((item) => (
            <Tooltip key={item.id} content={item.label} side="right">
              <li>
                <button
                  onClick={item.onClick}
                  className={cn(
                    'flex h-10 w-12 items-center justify-center rounded-md transition-colors',
                    item.id === activeId
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {item.icon}
                </button>
              </li>
            </Tooltip>
          ))}
        </ul>
      </nav>

      <div className="border-t py-2">
        <ul className="space-y-1 px-1">
          {bottomItems.map((item) => (
            <Tooltip key={item.id} content={item.label} side="right">
              <li>
                <button
                  onClick={item.onClick}
                  className={cn(
                    'flex h-10 w-12 items-center justify-center rounded-md transition-colors',
                    item.id === activeId
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {item.icon}
                </button>
              </li>
            </Tooltip>
          ))}
        </ul>
      </div>
    </div>
  );
}
