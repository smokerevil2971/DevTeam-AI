'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Textarea } from './textarea';
import { Send, Paperclip, AtSign, Command, X } from 'lucide-react';

interface MessageInputProps {
  onSend?: (message: string, attachments?: File[]) => void;
  onTyping?: () => void;
  onMentionTrigger?: (query: string) => void;
  onCommandTrigger?: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  showAttachment?: boolean;
  className?: string;
}

export function MessageInput({
  onSend,
  onTyping,
  onMentionTrigger,
  onCommandTrigger,
  placeholder = 'Type a message...',
  disabled = false,
  maxLength = 4000,
  showAttachment = true,
  className,
}: MessageInputProps) {
  const [value, setValue] = React.useState('');
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  React.useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onTyping?.();

    // Check for @ mentions
    const mentionMatch = newValue.match(/@(\w*)$/);
    if (mentionMatch) {
      onMentionTrigger?.(mentionMatch[1]);
    }

    // Check for / commands
    const commandMatch = newValue.match(/^\/(\w*)$/);
    if (commandMatch) {
      onCommandTrigger?.(commandMatch[1]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    // Command palette on Cmd/Ctrl + K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      onCommandTrigger?.('');
    }
  };

  const handleSend = () => {
    const trimmedValue = value.trim();
    if (trimmedValue || attachments.length > 0) {
      onSend?.(trimmedValue, attachments);
      setValue('');
      setAttachments([]);
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    e.target.value = ''; // Reset input
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const canSend = value.trim().length > 0 || attachments.length > 0;

  return (
    <div className={cn('rounded-lg border bg-background', className)}>
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b p-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-md bg-muted px-2 py-1 text-sm"
            >
              <Paperclip className="h-3 w-3" />
              <span className="max-w-[150px] truncate">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 p-2">
        {/* Attachment button */}
        {showAttachment && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={1}
          className={cn(
            'flex-1 resize-none border-0 bg-transparent focus:outline-none focus:ring-0',
            'text-sm placeholder:text-muted-foreground',
            'max-h-[200px] min-h-[36px] py-2',
          )}
        />

        {/* Action buttons */}
        <div className="flex flex-shrink-0 items-center gap-1">
          {/* Mention button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setValue((v) => v + '@');
              textareaRef.current?.focus();
              onMentionTrigger?.('');
            }}
            disabled={disabled}
          >
            <AtSign className="h-4 w-4" />
          </Button>

          {/* Command button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onCommandTrigger?.('')}
            disabled={disabled}
          >
            <Command className="h-4 w-4" />
          </Button>

          {/* Send button */}
          <Button
            type="button"
            size="icon"
            className="h-8 w-8"
            onClick={handleSend}
            disabled={disabled || !canSend}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Character count */}
      {value.length > maxLength * 0.8 && (
        <div className="px-2 pb-1 text-right">
          <span
            className={cn(
              'text-xs',
              value.length >= maxLength
                ? 'text-destructive'
                : 'text-muted-foreground',
            )}
          >
            {value.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
}

// Keyboard shortcuts help
export function MessageInputShortcuts({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 text-xs text-muted-foreground',
        className,
      )}
    >
      <span>
        <kbd className="rounded bg-muted px-1 py-0.5">Enter</kbd> to send
      </span>
      <span>
        <kbd className="rounded bg-muted px-1 py-0.5">Shift+Enter</kbd> for new
        line
      </span>
      <span>
        <kbd className="rounded bg-muted px-1 py-0.5">@</kbd> to mention
      </span>
      <span>
        <kbd className="rounded bg-muted px-1 py-0.5">⌘K</kbd> commands
      </span>
    </div>
  );
}
