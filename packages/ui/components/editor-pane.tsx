'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { AgentType, AGENT_TYPES } from './agent-avatar';

// Note: This is a wrapper component for Monaco Editor
// The actual Monaco integration requires @monaco-editor/react package

export interface EditorCursor {
  agentType: AgentType;
  line: number;
  column: number;
  selection?: {
    startLine: number;
    endLine: number;
    startColumn: number;
    endColumn: number;
  };
}

export interface HighlightedRegion {
  startLine: number;
  endLine: number;
  agentType: AgentType;
  type: 'working' | 'reviewing' | 'suggestion';
}

interface EditorPaneProps {
  content: string;
  language?: string;
  filename?: string;
  readOnly?: boolean;
  cursors?: EditorCursor[];
  highlightedRegions?: HighlightedRegion[];
  onChange?: (value: string) => void;
  onSave?: () => void;
  showLineNumbers?: boolean;
  showMinimap?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

export function EditorPane({
  content,
  language = 'typescript',
  filename,
  readOnly = false,
  cursors = [],
  highlightedRegions = [],
  onChange,
  onSave,
  showLineNumbers = true,
  showMinimap = true,
  theme = 'dark',
  className,
}: EditorPaneProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Keyboard shortcut for save
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        onSave?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  // Placeholder for Monaco Editor
  // In real implementation, use @monaco-editor/react
  return (
    <div className={cn('relative h-full w-full', className)}>
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
          <div className="text-sm text-muted-foreground">Loading editor...</div>
        </div>
      )}

      {/* Editor placeholder - replace with actual Monaco Editor */}
      <div
        ref={editorRef}
        className="h-full w-full overflow-auto bg-[#1e1e1e] p-4 font-mono text-sm text-gray-300"
        onLoad={() => setIsLoading(false)}
      >
        {/* Simulated code view */}
        <pre className="relative">
          {content.split('\n').map((line, lineNum) => (
            <div key={lineNum} className="flex">
              {/* Line number */}
              {showLineNumbers && (
                <span className="w-12 select-none pr-4 text-right text-gray-500">
                  {lineNum + 1}
                </span>
              )}
              {/* Line content with potential highlights */}
              <span
                className={cn(
                  'flex-1',
                  highlightedRegions.some(
                    (r) =>
                      lineNum + 1 >= r.startLine && lineNum + 1 <= r.endLine,
                  ) && 'bg-yellow-500/10',
                )}
              >
                {line || ' '}
              </span>
              {/* Agent cursors on this line */}
              {cursors
                .filter((c) => c.line === lineNum + 1)
                .map((cursor) => (
                  <AgentCursorIndicator
                    key={cursor.agentType}
                    cursor={cursor}
                  />
                ))}
            </div>
          ))}
        </pre>
      </div>

      {/* Active agent indicators */}
      {cursors.length > 0 && (
        <div className="absolute right-2 top-2 flex items-center gap-1">
          {cursors.map((cursor) => (
            <div
              key={cursor.agentType}
              className={cn(
                'rounded-full px-2 py-0.5 text-xs text-white',
                AGENT_TYPES[cursor.agentType].color,
              )}
            >
              {AGENT_TYPES[cursor.agentType].icon} L{cursor.line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Agent cursor indicator
function AgentCursorIndicator({ cursor }: { cursor: EditorCursor }) {
  const agent = AGENT_TYPES[cursor.agentType];

  return (
    <div
      className={cn(
        'absolute h-5 w-0.5 animate-pulse',
        agent.color.replace('bg-', 'bg-'),
      )}
      style={{ left: `${cursor.column * 8}px` }}
      title={`${agent.name} is editing here`}
    />
  );
}

// Diff view component
export function DiffView({
  original,
  modified,
  language = 'typescript',
  className,
}: {
  original: string;
  modified: string;
  language?: string;
  className?: string;
}) {
  const originalLines = original.split('\n');
  const modifiedLines = modified.split('\n');

  // Simple diff - in real app, use a proper diff library
  return (
    <div className={cn('flex h-full', className)}>
      {/* Original */}
      <div className="flex-1 overflow-auto border-r border-gray-700 bg-[#1e1e1e] p-4">
        <div className="mb-2 text-xs text-muted-foreground">Original</div>
        <pre className="font-mono text-sm text-gray-300">
          {originalLines.map((line, i) => (
            <div
              key={i}
              className={cn(
                !modifiedLines[i] || line !== modifiedLines[i]
                  ? 'bg-red-500/10 text-red-400'
                  : '',
              )}
            >
              {line || ' '}
            </div>
          ))}
        </pre>
      </div>

      {/* Modified */}
      <div className="flex-1 overflow-auto bg-[#1e1e1e] p-4">
        <div className="mb-2 text-xs text-muted-foreground">Modified</div>
        <pre className="font-mono text-sm text-gray-300">
          {modifiedLines.map((line, i) => (
            <div
              key={i}
              className={cn(
                !originalLines[i] || line !== originalLines[i]
                  ? 'bg-green-500/10 text-green-400'
                  : '',
              )}
            >
              {line || ' '}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
