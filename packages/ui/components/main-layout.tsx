'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

// Resize handle component for panel resizing
function ResizableHandle({
  direction,
  onResize,
  onDoubleClick,
}: {
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
  onDoubleClick?: () => void;
}) {
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
      onResize(delta);
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
        'flex-shrink-0 transition-colors hover:bg-primary/30',
        direction === 'horizontal'
          ? 'w-1 cursor-col-resize'
          : 'h-1 cursor-row-resize',
        isDragging && 'bg-primary/50',
      )}
    />
  );
}

interface MainLayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  bottomPanel?: React.ReactNode;
  sidebarDefaultWidth?: number;
  sidebarMinWidth?: number;
  sidebarMaxWidth?: number;
  rightPanelDefaultWidth?: number;
  bottomPanelDefaultHeight?: number;
  showSidebar?: boolean;
  showRightPanel?: boolean;
  showBottomPanel?: boolean;
  className?: string;
}

export function MainLayout({
  header,
  sidebar,
  children,
  rightPanel,
  bottomPanel,
  sidebarDefaultWidth = 240,
  sidebarMinWidth = 180,
  sidebarMaxWidth = 400,
  rightPanelDefaultWidth = 320,
  bottomPanelDefaultHeight = 200,
  showSidebar = true,
  showRightPanel = false,
  showBottomPanel = false,
  className,
}: MainLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = React.useState(sidebarDefaultWidth);
  const [rightPanelWidth, setRightPanelWidth] = React.useState(
    rightPanelDefaultWidth,
  );
  const [bottomPanelHeight, setBottomPanelHeight] = React.useState(
    bottomPanelDefaultHeight,
  );
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className={cn('flex h-screen flex-col overflow-hidden', className)}>
      {/* Header */}
      {header && (
        <header className="z-10 flex-shrink-0 border-b bg-background">
          {header}
        </header>
      )}

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && sidebar && (
          <>
            <aside
              className={cn(
                'bg-sidebar-background flex-shrink-0 overflow-y-auto border-r transition-all duration-200',
                sidebarCollapsed && 'w-0 overflow-hidden',
              )}
              style={{ width: sidebarCollapsed ? 0 : sidebarWidth }}
            >
              {sidebar}
            </aside>
            {!sidebarCollapsed && (
              <ResizableHandle
                direction="horizontal"
                onResize={(delta) => {
                  const newWidth = Math.min(
                    sidebarMaxWidth,
                    Math.max(sidebarMinWidth, sidebarWidth + delta),
                  );
                  setSidebarWidth(newWidth);
                }}
                onDoubleClick={() => setSidebarCollapsed(true)}
              />
            )}
          </>
        )}

        {/* Center content area with optional bottom panel */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Main content */}
          <main className="flex-1 overflow-auto">{children}</main>

          {/* Bottom panel */}
          {showBottomPanel && bottomPanel && (
            <>
              <ResizableHandle
                direction="vertical"
                onResize={(delta) => {
                  const newHeight = Math.min(
                    400,
                    Math.max(100, bottomPanelHeight - delta),
                  );
                  setBottomPanelHeight(newHeight);
                }}
              />
              <div
                className="flex-shrink-0 overflow-hidden border-t"
                style={{ height: bottomPanelHeight }}
              >
                {bottomPanel}
              </div>
            </>
          )}
        </div>

        {/* Right panel */}
        {showRightPanel && rightPanel && (
          <>
            <ResizableHandle
              direction="horizontal"
              onResize={(delta) => {
                const newWidth = Math.min(
                  500,
                  Math.max(200, rightPanelWidth - delta),
                );
                setRightPanelWidth(newWidth);
              }}
            />
            <aside
              className="flex-shrink-0 overflow-y-auto border-l bg-background"
              style={{ width: rightPanelWidth }}
            >
              {rightPanel}
            </aside>
          </>
        )}
      </div>
    </div>
  );
}

// Simple app shell with fixed sidebar and header
export function AppShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex h-screen flex-col bg-background', className)}>
      {children}
    </div>
  );
}

// Content wrapper with padding and max-width
export function ContentArea({
  children,
  className,
  maxWidth = 'max-w-6xl',
}: {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}) {
  return (
    <div className={cn('flex-1 overflow-auto', className)}>
      <div className={cn('mx-auto px-4 py-6', maxWidth)}>{children}</div>
    </div>
  );
}
