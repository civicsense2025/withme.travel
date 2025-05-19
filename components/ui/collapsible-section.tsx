'use client';

/**
 * CollapsibleSection (Molecule)
 * 
 * A flexible collapsible/expandable section with smooth animation
 * and accessible controls.
 * 
 * @module ui/molecules
 */
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CollapsibleSectionProps {
  /** Section title */
  title: React.ReactNode;
  /** Section content */
  children: React.ReactNode;
  /** Whether section is open by default (uncontrolled mode) */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Container className */
  className?: string;
  /** Header className */
  headerClassName?: string;
  /** Content className */
  contentClassName?: string;
  /** Icon before title */
  icon?: React.ReactNode;
  /** Whether section is disabled */
  disabled?: boolean;
  /** Custom icon for toggle */
  toggleIcon?: (isOpen: boolean) => React.ReactNode;
  /** Custom ID for the section */
  id?: string;
  /** Additional props for header button */
  headerProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  /** Animation duration in ms */
  animationDuration?: number;
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  className,
  headerClassName,
  contentClassName,
  icon,
  disabled = false,
  toggleIcon,
  id,
  headerProps,
  animationDuration = 300,
}: CollapsibleSectionProps) {
  // State for uncontrolled component
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  
  // Determine if controlled or uncontrolled
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  
  // Animation refs
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    isOpen ? undefined : 0
  );
  
  // Generate unique ID for accessibility
  const uniqueId = useRef<string>(id || `collapsible-${Math.random().toString(36).substr(2, 9)}`);
  const contentId = `${uniqueId.current}-content`;
  
  // Handle toggle
  const handleToggle = () => {
    if (disabled) return;
    
    const newState = !isOpen;
    
    if (!isControlled) {
      setInternalOpen(newState);
    }
    
    onOpenChange?.(newState);
  };
  
  // Measure content height for animations
  useEffect(() => {
    if (!contentRef.current) return;
    
    if (isOpen) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);
      
      // Reset to auto after animation completes for responsive behavior
      const timer = setTimeout(() => {
        setContentHeight(undefined);
      }, animationDuration);
      
      return () => clearTimeout(timer);
    } else {
      // Set current height first (for animation starting point)
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);
      
      // Force a reflow
      contentRef.current.offsetHeight;
      
      // Then animate to 0
      setTimeout(() => {
        setContentHeight(0);
      }, 10);
    }
  }, [isOpen, animationDuration]);
  
  // Default toggle icons
  const defaultToggleIcon = isOpen ? (
    <ChevronUp className="h-4 w-4" />
  ) : (
    <ChevronDown className="h-4 w-4" />
  );
  
  return (
    <div
      className={cn(
        'border rounded-md overflow-hidden',
        disabled && 'opacity-70 cursor-not-allowed',
        className
      )}
      id={uniqueId.current}
    >
      <button
        onClick={handleToggle}
        className={cn(
          'flex w-full items-center justify-between px-4 py-2 text-left font-medium',
          'hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          isOpen ? 'rounded-t-md' : 'rounded-md',
          headerClassName
        )}
        id={`${uniqueId.current}-header`}
        aria-expanded={isOpen}
        aria-controls={contentId}
        disabled={disabled}
        {...headerProps}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span>{title}</span>
        </div>
        
        {toggleIcon ? toggleIcon(isOpen) : defaultToggleIcon}
      </button>
      
      {/* Animated content container */}
      <div
        ref={contentRef}
        id={contentId}
        role="region"
        aria-labelledby={`${uniqueId.current}-header`}
        className={cn(
          'overflow-hidden transition-all',
          contentHeight === undefined ? '' : 'duration-300',
        )}
        style={{
          height: contentHeight === undefined ? 'auto' : `${contentHeight}px`,
          visibility: (!isOpen && contentHeight === 0) ? 'hidden' : undefined,
        }}
      >
        <div className={cn('p-4', contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}