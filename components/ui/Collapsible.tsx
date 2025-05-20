/**
 * Collapsible UI Component
 *
 * Provides a collapsible/expandable section for UI content with trigger and content components.
 * @module components/ui/Collapsible
 */

import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

// ============================================================================
// CONTEXT & TYPES
// ============================================================================

interface CollapsibleContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

/**
 * Props for the Collapsible component
 */
export interface CollapsibleProps {
  /** Whether the collapsible is open */
  open?: boolean;
  /** Whether the collapsible starts open by default */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Additional className for styling */
  className?: string;
  /** Content to render */
  children: React.ReactNode;
}

/**
 * Props for the CollapsibleTrigger component
 */
export interface CollapsibleTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  /** Whether to show the chevron icon */
  showChevron?: boolean;
  /** Additional className for the chevron icon */
  chevronClassName?: string;
}

/**
 * Props for the CollapsibleContent component
 */
export interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to animate the content */
  animated?: boolean;
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Collapsible root component
 */
export function Collapsible({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
}: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <CollapsibleContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </CollapsibleContext.Provider>
  );
}

/**
 * Collapsible trigger component
 */
export function CollapsibleTrigger({
  children,
  className,
  showChevron = true,
  chevronClassName,
  ...props
}: CollapsibleTriggerProps) {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error('CollapsibleTrigger must be used within a Collapsible');
  }

  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      onClick={() => context.onOpenChange(!context.open)}
      {...props}
    >
      {children}
      {showChevron && (
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            context.open ? 'rotate-180' : '',
            chevronClassName
          )}
        />
      )}
    </button>
  );
}

/**
 * Collapsible content component
 */
export function CollapsibleContent({
  children,
  className,
  animated = true,
  ...props
}: CollapsibleContentProps) {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error('CollapsibleContent must be used within a Collapsible');
  }

  return (
    <div
      className={cn(
        'overflow-hidden',
        animated && 'transition-all duration-200 ease-in-out',
        !context.open ? 'max-h-0' : 'max-h-[var(--radix-collapsible-content-height)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Export all components
export {
  Collapsible as Root,
  CollapsibleTrigger as Trigger,
  CollapsibleContent as Content,
};