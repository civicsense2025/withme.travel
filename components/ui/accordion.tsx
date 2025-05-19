/**
 * Accordion (Molecule)
 *
 * A themeable, accessible accordion component with proper ARIA attributes
 * and smooth animations.
 *
 * @module ui/molecules
 */
import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

// Context for accordion state management
type AccordionContextValue = {
  value: string[];
  onValueChange: (value: string[]) => void;
  collapsible?: boolean;
  type: 'single' | 'multiple';
};

const AccordionContext = createContext<AccordionContextValue | undefined>(undefined);

export interface AccordionProps {
  children: React.ReactNode;
  className?: string;
  /** Controls whether multiple items can be open simultaneously */
  type?: 'single' | 'multiple';
  /** Initially open item values */
  defaultValue?: string[];
  /** Controlled open items */
  value?: string[];
  /** Called when open items change */
  onValueChange?: (value: string[]) => void;
  /** Allow all items to be closed */
  collapsible?: boolean;
}

export function Accordion({
  children,
  className,
  type = 'single',
  defaultValue = [],
  value,
  onValueChange,
  collapsible = false,
  ...props
}: AccordionProps) {
  const [stateValue, setStateValue] = useState<string[]>(defaultValue);
  
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : stateValue;
  
  const handleValueChange = (newValue: string[]) => {
    if (!isControlled) {
      setStateValue(newValue);
    }
    onValueChange?.(newValue);
  };
  
  return (
    <AccordionContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        collapsible,
        type,
      }}
    >
      <div
        className={cn('space-y-1', className)}
        {...props}
        role="region"
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion');
  }
  return context;
}

export interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function AccordionItem({
  children,
  className,
  value,
  disabled = false,
  ...props
}: AccordionItemProps) {
  return (
    <div
      className={cn(
        'border border-border rounded-md overflow-hidden',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      data-state={useItemState(value) ? 'open' : 'closed'}
      data-disabled={disabled ? true : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

// Hook to check if an item is open
function useItemState(value: string) {
  const { value: openValues } = useAccordionContext();
  return openValues.includes(value);
}

export interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionTrigger({
  children,
  className,
  ...props
}: AccordionTriggerProps) {
  const { onValueChange, value: openValues, collapsible, type } = useAccordionContext();
  const itemContext = React.useContext(AccordionItemContext);
  
  if (!itemContext) {
    throw new Error('AccordionTrigger must be used within an AccordionItem');
  }
  
  const { value, disabled } = itemContext;
  const isOpen = openValues.includes(value);
  
  const handleClick = () => {
    if (disabled) return;
    
    let newValue: string[];
    
    if (isOpen) {
      // Don't close if not collapsible and it's the only open item
      if (!collapsible && openValues.length === 1 && type === 'single') {
        return;
      }
      newValue = openValues.filter((v) => v !== value);
    } else {
      newValue = type === 'single' ? [value] : [...openValues, value];
    }
    
    onValueChange(newValue);
  };
  
  return (
    <button
      className={cn(
        'flex justify-between w-full font-medium text-left px-4 py-2 transition-all',
        'hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        isOpen && 'bg-muted/30',
        className
      )}
      type="button"
      onClick={handleClick}
      aria-expanded={isOpen}
      disabled={disabled}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          'h-4 w-4 transition-transform duration-200',
          isOpen && 'transform rotate-180'
        )}
        aria-hidden="true"
      />
    </button>
  );
}

// Create item context to pass item value to trigger and content
type AccordionItemContextValue = {
  value: string;
  disabled?: boolean;
};

const AccordionItemContext = createContext<AccordionItemContextValue | undefined>(undefined);

export function AccordionItem({
  children,
  className,
  value,
  disabled = false,
  ...props
}: AccordionItemProps) {
  const isOpen = useItemState(value);
  
  return (
    <AccordionItemContext.Provider value={{ value, disabled }}>
      <div
        className={cn(
          'border border-border rounded-md overflow-hidden',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        data-state={isOpen ? 'open' : 'closed'}
        data-disabled={disabled ? true : undefined}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
  forceMount?: boolean;
}

export function AccordionContent({
  children,
  className,
  forceMount = false,
  ...props
}: AccordionContentProps) {
  const itemContext = React.useContext(AccordionItemContext);
  
  if (!itemContext) {
    throw new Error('AccordionContent must be used within an AccordionItem');
  }
  
  const { value } = itemContext;
  const isOpen = useItemState(value);
  
  if (!isOpen && !forceMount) {
    return null;
  }
  
  return (
    <div
      className={cn(
        'overflow-hidden text-sm transition-all',
        isOpen
          ? 'max-h-screen animate-accordion-down py-4 px-4'
          : 'max-h-0 animate-accordion-up',
        className
      )}
      aria-hidden={!isOpen}
      {...props}
    >
      {children}
    </div>
  );
}