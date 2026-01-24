'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  backButton?: {
    label?: string;
    onClick: () => void;
  };
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  tabs?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  backButton,
  actions,
  badge,
  tabs,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('border-b bg-background', className)}>
      <div className="px-6 py-4">
        {/* Back button */}
        {backButton && (
          <button
            onClick={backButton.onClick}
            className="mb-2 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            {backButton.label || 'Back'}
          </button>
        )}

        <div className="flex items-start justify-between gap-4">
          {/* Title and description */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="truncate text-2xl font-bold tracking-tight">
                {title}
              </h1>
              {badge}
            </div>
            {description && (
              <p className="mt-1 line-clamp-2 text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex flex-shrink-0 items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      {tabs && <div className="px-6">{tabs}</div>}
    </div>
  );
}

// Compact page header variant
export function PageHeaderCompact({
  title,
  actions,
  className,
}: {
  title: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex h-12 items-center justify-between border-b bg-background px-4',
        className,
      )}
    >
      <h1 className="truncate text-sm font-medium">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
