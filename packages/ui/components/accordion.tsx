'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface AccordionProps {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  children: React.ReactNode;
  className?: string;
}

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

const AccordionContext = React.createContext<{
  type: 'single' | 'multiple';
  value: string[];
  onToggle: (value: string) => void;
} | null>(null);

const AccordionItemContext = React.createContext<{
  value: string;
  isOpen: boolean;
  disabled: boolean;
} | null>(null);

function useAccordion() {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion');
  }
  return context;
}

function useAccordionItem() {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error(
      'AccordionTrigger/Content must be used within AccordionItem',
    );
  }
  return context;
}

export function Accordion({
  type = 'single',
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
}: AccordionProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string[]>(
    () => {
      if (defaultValue) {
        return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
      }
      return [];
    },
  );

  const isControlled = controlledValue !== undefined;
  const value = isControlled
    ? Array.isArray(controlledValue)
      ? controlledValue
      : [controlledValue]
    : uncontrolledValue;

  const onToggle = React.useCallback(
    (itemValue: string) => {
      let newValue: string[];

      if (type === 'single') {
        newValue = value.includes(itemValue) ? [] : [itemValue];
      } else {
        newValue = value.includes(itemValue)
          ? value.filter((v) => v !== itemValue)
          : [...value, itemValue];
      }

      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(type === 'single' ? newValue[0] || '' : newValue);
    },
    [type, value, isControlled, onValueChange],
  );

  return (
    <AccordionContext.Provider value={{ type, value, onToggle }}>
      <div className={cn('w-full', className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  value,
  children,
  className,
  disabled = false,
}: AccordionItemProps) {
  const { value: selectedValues } = useAccordion();
  const isOpen = selectedValues.includes(value);

  return (
    <AccordionItemContext.Provider value={{ value, isOpen, disabled }}>
      <div className={cn('border-b', className)}>{children}</div>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({
  children,
  className,
}: AccordionTriggerProps) {
  const { onToggle } = useAccordion();
  const { value, isOpen, disabled } = useAccordionItem();

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-controls={`accordion-content-${value}`}
      disabled={disabled}
      onClick={() => !disabled && onToggle(value)}
      className={cn(
        'flex w-full flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      data-state={isOpen ? 'open' : 'closed'}
    >
      {children}
      <ChevronDown
        className={cn(
          'h-4 w-4 shrink-0 transition-transform duration-200',
          isOpen && 'rotate-180',
        )}
      />
    </button>
  );
}

export function AccordionContent({
  children,
  className,
}: AccordionContentProps) {
  const { value, isOpen } = useAccordionItem();
  const contentRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      id={`accordion-content-${value}`}
      role="region"
      aria-labelledby={`accordion-trigger-${value}`}
      className={cn(
        'overflow-hidden text-sm transition-all',
        isOpen ? 'animate-accordion-down' : 'animate-accordion-up hidden',
      )}
    >
      <div ref={contentRef} className={cn('pb-4 pt-0', className)}>
        {children}
      </div>
    </div>
  );
}
