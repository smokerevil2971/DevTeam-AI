'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import {
  GripVertical,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  direction?: 'horizontal' | 'vertical';
  collapsible?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onResize?: (size: number) => void;
  className?: string;
}

export function ResizablePanel({
  children,
  defaultSize = 300,
  minSize = 100,
  maxSize = 600,
  direction = 'horizontal',
  collapsible = false,
  collapsed = false,
  onCollapsedChange,
  onResize,
  className,
}: ResizablePanelProps) {
  const [size, setSize] = React.useState(defaultSize);

  const handleResize = (delta: number) => {
    const newSize = Math.min(maxSize, Math.max(minSize, size + delta));
    setSize(newSize);
    onResize?.(newSize);
  };

  const toggleCollapse = () => {
    onCollapsedChange?.(!collapsed);
  };

  if (collapsed) {
    return (
      <div
        className={cn(
          'flex flex-shrink-0 cursor-pointer items-center justify-center bg-muted/30 transition-colors hover:bg-muted/50',
          direction === 'horizontal' ? 'h-full w-3' : 'h-3 w-full',
        )}
        onClick={toggleCollapse}
      >
        {direction === 'horizontal' ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex-shrink-0 overflow-hidden',
        direction === 'horizontal' ? 'flex' : 'flex flex-col',
        className,
      )}
      style={{
        [direction === 'horizontal' ? 'width' : 'height']: size,
      }}
    >
      <div className="flex-1 overflow-auto">{children}</div>

      {collapsible && (
        <button
          onClick={toggleCollapse}
          className={cn(
            'flex flex-shrink-0 items-center justify-center bg-muted/30 transition-colors hover:bg-muted/50',
            direction === 'horizontal' ? 'h-full w-3' : 'h-3 w-full',
          )}
        >
          {direction === 'horizontal' ? (
            <ChevronLeft className="h-3 w-3" />
          ) : (
            <ChevronUp className="h-3 w-3" />
          )}
        </button>
      )}
    </div>
  );
}

// Resize handle between panels
interface ResizableHandleProps {
  direction?: 'horizontal' | 'vertical';
  onResize?: (delta: number) => void;
  onDoubleClick?: () => void;
  className?: string;
}

export function ResizableHandle({
  direction = 'horizontal',
  onResize,
  onDoubleClick,
  className,
}: ResizableHandleProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const startPos = React.useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startPos.current = direction === 'horizontal' ? e.clientX : e.clientY;
    e.preventDefault();
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
      const delta = currentPos - startPos.current;
      startPos.current = currentPos;
      onResize?.(delta);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, direction, onResize]);

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
      className={cn(
        'group flex flex-shrink-0 items-center justify-center transition-colors',
        direction === 'horizontal'
          ? 'w-1 cursor-col-resize hover:bg-primary/30'
          : 'h-1 cursor-row-resize hover:bg-primary/30',
        isDragging && 'bg-primary/50',
        className,
      )}
    >
      <GripVertical
        className={cn(
          'text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100',
          direction === 'horizontal' ? 'h-6 w-3' : 'h-3 w-6 rotate-90',
        )}
      />
    </div>
  );
}

// Split panel layout
export function SplitPanel({
  left,
  right,
  defaultLeftWidth = 50,
  minLeftWidth = 20,
  maxLeftWidth = 80,
  className,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultLeftWidth?: number; // percentage
  minLeftWidth?: number;
  maxLeftWidth?: number;
  className?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = React.useState(defaultLeftWidth);

  const handleResize = (delta: number) => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const deltaPercent = (delta / containerWidth) * 100;
    const newWidth = Math.min(
      maxLeftWidth,
      Math.max(minLeftWidth, leftWidth + deltaPercent),
    );
    setLeftWidth(newWidth);
  };

  return (
    <div ref={containerRef} className={cn('flex h-full', className)}>
      <div style={{ width: `${leftWidth}%` }} className="overflow-auto">
        {left}
      </div>
      <ResizableHandle direction="horizontal" onResize={handleResize} />
      <div style={{ width: `${100 - leftWidth}%` }} className="overflow-auto">
        {right}
      </div>
    </div>
  );
}
