'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

interface ProgressProps {
  value?: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Progress({
  value = 0,
  max = 100,
  className,
  indicatorClassName,
  showLabel = false,
  size = 'md',
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-secondary',
          sizeClasses[size],
          className,
        )}
      >
        <div
          className={cn(
            'h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out',
            indicatorClassName,
          )}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-right text-xs text-muted-foreground">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

// Indeterminate progress (loading)
export function ProgressIndeterminate({
  className,
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div
      role="progressbar"
      aria-label="Loading"
      className={cn(
        'relative w-full overflow-hidden rounded-full bg-secondary',
        sizeClasses[size],
        className,
      )}
    >
      <div className="absolute inset-0 w-1/3 animate-[shimmer_1s_ease-in-out_infinite] rounded-full bg-primary" />
    </div>
  );
}
