'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { MessageBubble, MessageData, TypingIndicator } from './message-bubble';
import { AgentType } from './agent-avatar';
import { Spinner } from './spinner';
import { ChevronDown } from 'lucide-react';
import { Button } from './button';

interface MessageThreadProps {
  messages: MessageData[];
  typingAgents?: AgentType[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

export function MessageThread({
  messages,
  typingAgents = [],
  isLoading = false,
  hasMore = false,
  onLoadMore,
  className,
}: MessageThreadProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  const [autoScroll, setAutoScroll] = React.useState(true);

  // Scroll to bottom when new messages arrive (if auto-scroll is enabled)
  React.useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Handle scroll events
  const handleScroll = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Show scroll button if not at bottom
    setShowScrollButton(distanceFromBottom > 100);

    // Enable auto-scroll if near bottom
    setAutoScroll(distanceFromBottom < 50);

    // Load more when scrolling to top
    if (scrollTop < 100 && hasMore && !isLoading) {
      onLoadMore?.();
    }
  }, [hasMore, isLoading, onLoadMore]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setAutoScroll(true);
  };

  // Group consecutive messages from same sender
  const groupedMessages = React.useMemo(() => {
    return messages.reduce((groups, message, index) => {
      const prevMessage = messages[index - 1];
      const isSameSender =
        prevMessage &&
        prevMessage.type === message.type &&
        prevMessage.agentType === message.agentType &&
        prevMessage.sender?.id === message.sender?.id &&
        // Only group if within 2 minutes
        message.timestamp.getTime() - prevMessage.timestamp.getTime() < 120000;

      if (isSameSender) {
        groups[groups.length - 1].push(message);
      } else {
        groups.push([message]);
      }
      return groups;
    }, [] as MessageData[][]);
  }, [messages]);

  return (
    <div className={cn('relative flex h-full flex-col', className)}>
      {/* Messages container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 space-y-1 overflow-y-auto px-4 py-2"
      >
        {/* Loading indicator at top */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        )}

        {/* Load more button */}
        {hasMore && !isLoading && (
          <div className="flex justify-center py-2">
            <Button variant="ghost" size="sm" onClick={onLoadMore}>
              Load earlier messages
            </Button>
          </div>
        )}

        {/* Messages */}
        {groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex}>
            {group.map((message, messageIndex) => (
              <MessageBubble
                key={message.id}
                message={message}
                showAvatar={messageIndex === 0}
                showTimestamp={messageIndex === group.length - 1}
              />
            ))}
          </div>
        ))}

        {/* Typing indicator */}
        {typingAgents.length > 0 && <TypingIndicator agents={typingAgents} />}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          onClick={scrollToBottom}
          size="icon"
          variant="secondary"
          className="absolute bottom-4 right-4 rounded-full shadow-lg"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// Date separator component
export function DateSeparator({ date }: { date: Date }) {
  const formatDate = (d: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex-1 border-t" />
      <span className="text-xs text-muted-foreground">{formatDate(date)}</span>
      <div className="flex-1 border-t" />
    </div>
  );
}

// Empty state
export function MessageThreadEmpty({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-center p-8 text-center',
        className,
      )}
    >
      <div className="mb-4 text-4xl">💬</div>
      <h3 className="mb-2 text-lg font-semibold">No messages yet</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Start a conversation with your AI development team. Use @mention to
        address specific agents.
      </p>
    </div>
  );
}
