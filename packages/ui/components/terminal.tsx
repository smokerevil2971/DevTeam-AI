'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import {
  Plus,
  X,
  Terminal as TerminalIcon,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Button } from './button';

// Note: This is a wrapper component for xterm.js
// The actual Terminal integration requires xterm and xterm-addon packages

export interface TerminalTab {
  id: string;
  name: string;
  isActive?: boolean;
}

interface TerminalProps {
  tabs?: TerminalTab[];
  activeTabId?: string;
  onTabClick?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onNewTab?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
  className?: string;
}

export function Terminal({
  tabs = [{ id: '1', name: 'Terminal 1', isActive: true }],
  activeTabId = '1',
  onTabClick,
  onTabClose,
  onNewTab,
  onMaximize,
  isMaximized = false,
  className,
}: TerminalProps) {
  const terminalRef = React.useRef<HTMLDivElement>(null);
  const [lines, setLines] = React.useState<string[]>([
    '\x1b[32m➜\x1b[0m \x1b[36m~/devteam-ai\x1b[0m',
    '',
  ]);
  const [inputValue, setInputValue] = React.useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const command = inputValue.trim();
      if (command) {
        // Simulate command execution
        setLines((prev) => [
          ...prev,
          `\x1b[32m➜\x1b[0m \x1b[36m~/devteam-ai\x1b[0m ${command}`,
          getCommandOutput(command),
          '',
        ]);
        setInputValue('');
      }
    }
  };

  // Simple command simulation
  const getCommandOutput = (cmd: string): string => {
    const commands: Record<string, string> = {
      ls: 'apps/  packages/  node_modules/  package.json  tsconfig.json',
      pwd: '/home/user/devteam-ai',
      'npm run dev':
        '> devteam-ai@1.0.0 dev\n> turbo run dev\n\n✓ Starting development servers...',
      clear: '',
      help: 'Available commands: ls, pwd, npm, pnpm, git, clear, help',
    };

    if (cmd === 'clear') {
      setTimeout(
        () => setLines(['\x1b[32m➜\x1b[0m \x1b[36m~/devteam-ai\x1b[0m', '']),
        0,
      );
      return '';
    }

    return commands[cmd] || `Command not found: ${cmd}`;
  };

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-md bg-[#1a1a1a]',
        className,
      )}
    >
      {/* Tab bar */}
      <div className="flex items-center border-b border-gray-700 bg-[#2d2d2d]">
        <div className="flex flex-1 items-center overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => onTabClick?.(tab.id)}
              className={cn(
                'flex min-w-0 cursor-pointer items-center gap-2 border-r border-gray-700 px-3 py-1.5',
                tab.id === activeTabId
                  ? 'bg-[#1a1a1a] text-white'
                  : 'text-gray-400 hover:bg-[#3d3d3d] hover:text-white',
              )}
            >
              <TerminalIcon className="h-3 w-3" />
              <span className="truncate text-xs">{tab.name}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose?.(tab.id);
                  }}
                  className="rounded p-0.5 hover:bg-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={onNewTab}
            className="p-2 text-gray-400 hover:text-white"
            title="New Terminal"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <button
          onClick={onMaximize}
          className="p-2 text-gray-400 hover:text-white"
          title={isMaximized ? 'Minimize' : 'Maximize'}
        >
          {isMaximized ? (
            <Minimize2 className="h-3 w-3" />
          ) : (
            <Maximize2 className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* Terminal content */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-auto p-3 font-mono text-sm text-gray-200"
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className="whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: ansiToHtml(line) }}
          />
        ))}

        {/* Input line */}
        <div className="flex items-center">
          <span
            dangerouslySetInnerHTML={{
              __html: ansiToHtml(
                '\x1b[32m➜\x1b[0m \x1b[36m~/devteam-ai\x1b[0m ',
              ),
            }}
          />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border-0 bg-transparent text-white outline-none"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}

// Simple ANSI to HTML converter
function ansiToHtml(text: string): string {
  return text
    .replace(/\x1b\[32m/g, '<span style="color: #4ade80">')
    .replace(/\x1b\[36m/g, '<span style="color: #22d3ee">')
    .replace(/\x1b\[33m/g, '<span style="color: #facc15">')
    .replace(/\x1b\[31m/g, '<span style="color: #f87171">')
    .replace(/\x1b\[0m/g, '</span>')
    .replace(/\n/g, '<br/>');
}

// Resizable terminal panel
export function ResizableTerminal({
  defaultHeight = 200,
  minHeight = 100,
  maxHeight = 500,
  children,
  className,
}: {
  defaultHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const [height, setHeight] = React.useState(defaultHeight);
  const [isDragging, setIsDragging] = React.useState(false);
  const startY = React.useRef(0);
  const startHeight = React.useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startHeight.current = height;
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = startY.current - e.clientY;
      const newHeight = Math.min(
        maxHeight,
        Math.max(minHeight, startHeight.current + delta),
      );
      setHeight(newHeight);
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
  }, [isDragging, minHeight, maxHeight]);

  return (
    <div className={cn('relative', className)} style={{ height }}>
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          'absolute left-0 right-0 top-0 h-1 cursor-row-resize transition-colors hover:bg-primary/50',
          isDragging && 'bg-primary',
        )}
      />
      {children}
    </div>
  );
}
