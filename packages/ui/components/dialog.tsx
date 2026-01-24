'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

function useDialog() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog');
  }
  return context;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogOverlay({ className }: { className?: string }) {
  const { onOpenChange } = useDialog();

  return (
    <div
      className={cn(
        'animate-in fade-in-0 fixed inset-0 z-50 bg-black/80',
        className,
      )}
      onClick={() => onOpenChange(false)}
      aria-hidden="true"
    />
  );
}

export function DialogContent({
  children,
  className,
  onClose,
}: DialogContentProps) {
  const { onOpenChange } = useDialog();
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Focus trap
  React.useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const focusableElements = content.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    content.addEventListener('keydown', handleTab);
    return () => content.removeEventListener('keydown', handleTab);
  }, []);

  return (
    <>
      <DialogOverlay />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          'animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          onClick={() => {
            onClose?.();
            onOpenChange(false);
          }}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>
  );
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col space-y-1.5 text-center sm:text-left',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function DialogDescription({
  children,
  className,
}: DialogDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
  );
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
        className,
      )}
    >
      {children}
    </div>
  );
}
