'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';
import {
  ChevronDown,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  HelpCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './dropdown-menu';

interface HeaderProps {
  logo?: React.ReactNode;
  projectName?: string;
  projects?: Array<{ id: string; name: string }>;
  onProjectSelect?: (projectId: string) => void;
  onCommandPalette?: () => void;
  showNotifications?: boolean;
  notificationCount?: number;
  onNotificationClick?: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onSettings?: () => void;
  onHelp?: () => void;
  onLogout?: () => void;
  className?: string;
}

export function Header({
  logo,
  projectName = 'DevTeam AI',
  projects = [],
  onProjectSelect,
  onCommandPalette,
  showNotifications = true,
  notificationCount = 0,
  onNotificationClick,
  user,
  onSettings,
  onHelp,
  onLogout,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between bg-background px-4',
        className,
      )}
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        {logo || (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-white">D</span>
            </div>
            <span className="hidden font-semibold sm:block">DevTeam AI</span>
          </div>
        )}

        {/* Project selector */}
        {projects.length > 0 ? (
          <DropdownMenu
            trigger={
              <Button variant="ghost" className="gap-2">
                <span className="max-w-[150px] truncate">{projectName}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            }
            align="start"
          >
            {projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => onProjectSelect?.(project.id)}
              >
                {project.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenu>
        ) : (
          <span className="text-sm text-muted-foreground">{projectName}</span>
        )}
      </div>

      {/* Center - Command palette trigger */}
      <div className="mx-4 hidden max-w-md flex-1 md:flex">
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground"
          onClick={onCommandPalette}
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="flex-1 text-left">Search or type a command...</span>
          <kbd className="ml-2 rounded bg-muted px-2 py-0.5 text-xs">⌘K</kbd>
        </Button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Mobile search */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onCommandPalette}
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        {showNotifications && (
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={onNotificationClick}
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Button>
        )}

        {/* User menu */}
        <DropdownMenu
          trigger={
            <Button variant="ghost" size="icon" className="rounded-full">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4" />
                </div>
              )}
            </Button>
          }
          align="end"
        >
          {user && (
            <>
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={onSettings}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onHelp}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Help & Support
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} destructive>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </header>
  );
}

// Simple breadcrumb header
export function BreadcrumbHeader({
  items,
  actions,
  className,
}: {
  items: Array<{ label: string; href?: string; onClick?: () => void }>;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'flex h-12 items-center justify-between border-b px-4',
        className,
      )}
    >
      <nav className="flex items-center gap-1 text-sm">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-muted-foreground">/</span>}
            {item.onClick ? (
              <button
                onClick={item.onClick}
                className={cn(
                  'transition-colors hover:text-foreground',
                  index === items.length - 1
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {item.label}
              </button>
            ) : (
              <span
                className={cn(
                  index === items.length - 1
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
