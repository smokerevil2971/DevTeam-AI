'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { AgentAvatar, AgentType } from './agent-avatar';
import { Avatar } from './avatar';

export type MessageType = 'user' | 'agent' | 'system';

export interface MessageData {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  agentType?: AgentType;
  codeBlocks?: Array<{
    language: string;
    code: string;
  }>;
  isStreaming?: boolean;
}

interface MessageBubbleProps {
  message: MessageData;
  showTimestamp?: boolean;
  showAvatar?: boolean;
  className?: string;
}

export function MessageBubble({
  message,
  showTimestamp = true,
  showAvatar = true,
  className,
}: MessageBubbleProps) {
  const {
    type,
    content,
    timestamp,
    sender,
    agentType,
    codeBlocks,
    isStreaming,
  } = message;

  // System messages are centered
  if (type === 'system') {
    return (
      <div className={cn('flex justify-center py-2', className)}>
        <div className="max-w-md text-center">
          <p className="rounded-full bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
            {content}
          </p>
          {showTimestamp && (
            <span className="mt-1 text-xs text-muted-foreground">
              {formatTime(timestamp)}
            </span>
          )}
        </div>
      </div>
    );
  }

  const isUser = type === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 py-2',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className,
      )}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {sender?.avatar ? (
                <img
                  src={sender.avatar}
                  alt={sender?.name || 'User'}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                sender?.name?.charAt(0) || 'U'
              )}
            </div>
          ) : (
            agentType && <AgentAvatar type={agentType} size="sm" />
          )}
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          'flex max-w-[75%] flex-col',
          isUser ? 'items-end' : 'items-start',
        )}
      >
        {/* Sender name */}
        {!isUser && agentType && (
          <span className="mb-1 text-xs text-muted-foreground">
            {sender?.name || 'AI Agent'}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2',
            isUser
              ? 'rounded-tr-md bg-primary text-primary-foreground'
              : 'rounded-tl-md bg-muted',
          )}
        >
          {/* Text content */}
          <div className="whitespace-pre-wrap break-words text-sm">
            {renderMessageContent(content)}
          </div>

          {/* Code blocks */}
          {codeBlocks?.map((block, index) => (
            <CodeBlock
              key={index}
              language={block.language}
              code={block.code}
            />
          ))}

          {/* Streaming indicator */}
          {isStreaming && (
            <span className="ml-1 inline-flex">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse delay-150">●</span>
              <span className="animate-pulse delay-300">●</span>
            </span>
          )}
        </div>

        {/* Timestamp */}
        {showTimestamp && (
          <span className="mt-1 text-xs text-muted-foreground">
            {formatTime(timestamp)}
          </span>
        )}
      </div>
    </div>
  );
}

// Code block component
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-2 overflow-hidden rounded-md border bg-background/80">
      <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-1">
        <span className="text-xs text-muted-foreground">{language}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-xs">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Render message content with markdown-like support
function renderMessageContent(content: string): React.ReactNode {
  // Simple markdown parsing for bold, italic, code
  const parts = content.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="rounded bg-muted px-1 py-0.5 font-mono text-xs"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

// Format timestamp
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Typing indicator component
export function TypingIndicator({
  agents,
  className,
}: {
  agents: AgentType[];
  className?: string;
}) {
  if (agents.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-2 py-2', className)}>
      <div className="flex -space-x-2">
        {agents.slice(0, 3).map((agent) => (
          <AgentAvatar key={agent} type={agent} size="sm" showTooltip={false} />
        ))}
      </div>
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <span>typing</span>
        <span className="flex gap-0.5">
          <span className="animate-bounce delay-0">.</span>
          <span className="animate-bounce delay-100">.</span>
          <span className="animate-bounce delay-200">.</span>
        </span>
      </div>
    </div>
  );
}
