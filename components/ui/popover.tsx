'use client';

/**
 * Popover (Molecule)
 *
 * A themeable, accessible popover component with trigger, content,
 * positioning, animations, and focus management.
 *
 * @module ui/molecules
 */
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & CONTEXT
// ============================================================================

export type PopoverPlacement = 
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

type PopoverContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
  contentId: string;
  placement: PopoverPlacement;
  offset: number;
  isPortal: boolean;
};

const PopoverContext = React.createContext<PopoverContextValue | undefined>(undefined);

// ============================================================================
// POPOVER COMPONENT
// ============================================================================

export interface PopoverProps {
  /** Child components */
  children: React.ReactNode;
  /** Whether the popover is open */
  open?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Initial open state */
  defaultOpen?: boolean;
  /** Popover placement */
  placement?: PopoverPlacement;
  /** Offset from trigger in pixels */
  offset?: number;
  /** Whether to render in a portal */
  portal?: boolean;
  /** Close when clicking outside */
  closeOnClickOutside?: boolean;
  /** Close when pressing escape key */
  closeOnEscape?: boolean;
  /** Whether to trap focus in the popover */
  trapFocus?: boolean;
  /** Whether to return focus to trigger when closed */
  returnFocus?: boolean;
  /** Called when popover closes */
  onClose?: () => void;
  /** Called when popover opens */
  onOpen?: () => void;
  /** Custom ID for the popover */
  id?: string;
}

export function Popover({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  placement = 'bottom',
  offset = 8,
  portal = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
  trapFocus = true,
  returnFocus = true,
  onClose,
  onOpen,
  id,
}: PopoverProps) {
  // State for uncontrolled component
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  
  // Determine if controlled or uncontrolled
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  
  // Refs
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);
  
  // Generate unique ID
  const uniqueId = useRef<string>(id || `popover-${Math.random().toString(36).substr(2, 9)}`);
  const contentId = `${uniqueId.current}-content`;
  
  // Handle open change
  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
    
    if (nextOpen) {
      onOpen?.();
    } else {
      onClose?.();
    }
  };
  
  // Save previous focus when opening
  useEffect(() => {
    if (open && returnFocus) {
      previousFocusRef.current = document.activeElement;
    }
  }, [open, returnFocus]);
  
  // Handle click outside
  useEffect(() => {
    if (!open || !closeOnClickOutside) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        triggerRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        handleOpenChange(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, closeOnClickOutside]);
  
  // Handle escape key
  useEffect(() => {
    if (!open || !closeOnEscape) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleOpenChange(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape]);
  
  // Trap focus
  useEffect(() => {
    if (!open || !trapFocus || !contentRef.current) return;
    
    const focusableElements = contentRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    // Set initial focus
    firstElement.focus();
    
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [open, trapFocus]);
  
  // Return focus when closing
  useEffect(() => {
    if (!open && returnFocus && previousFocusRef.current) {
      const prevFocus = previousFocusRef.current as HTMLElement;
      if (typeof prevFocus.focus === 'function') {
        setTimeout(() => {
          prevFocus.focus();
        }, 0);
      }
    }
  }, [open, returnFocus]);
  
  return (
    <PopoverContext.Provider
      value={{
        open,
        setOpen: handleOpenChange,
        triggerRef,
        contentId,
        placement,
        offset,
        isPortal: portal,
      }}
    >
      {children}
    </PopoverContext.Provider>
  );
}

// Hook to access popover context
function usePopoverContext() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error('Popover components must be used within a Popover');
  }
  return context;
}

// ============================================================================
// POPOVER TRIGGER COMPONENT
// ============================================================================

export interface PopoverTriggerProps {
  /** Trigger element */
  children: React.ReactNode;
  /** Whether to use child as is */
  asChild?: boolean;
  /** Whether trigger is disabled */
  disabled?: boolean;
}

export function PopoverTrigger({
  children,
  asChild = false,
  disabled = false,
}: PopoverTriggerProps) {
  const { open, setOpen, triggerRef, contentId } = usePopoverContext();
  
  // Clone child element if asChild is true
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref: triggerRef,
      'aria-expanded': open,
      'aria-haspopup': 'dialog',
      'aria-controls': open ? contentId : undefined,
      onClick: (e: React.MouseEvent) => {
        if (disabled) return;
        
        const originalOnClick = (children as any).props.onClick;
        if (originalOnClick) originalOnClick(e);
        
        if (!e.defaultPrevented) {
          setOpen(!open);
        }
      },
      disabled,
    });
  }
  
  // Default trigger rendering
  return (
    <button
      type="button"
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-controls={open ? contentId : undefined}
      onClick={() => !disabled && setOpen(!open)}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// ============================================================================
// POPOVER CONTENT COMPONENT
// ============================================================================

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Popover content */
  children: React.ReactNode;
  /** Width in pixels or CSS value */
  width?: number | string;
  /** Whether to show an arrow */
  showArrow?: boolean;
  /** Arrow size in pixels */
  arrowSize?: number;
  /** Arrow className */
  arrowClassName?: string;
  /** Prevent closing when clicking inside */
  preventClickThrough?: boolean;
  /** Horizontal alignment adjustment (-1 to 1) */
  alignOffset?: number;
  /** Side offset adjustment in pixels */
  sideOffset?: number;
}

export function PopoverContent({
  children,
  className,
  width = 200,
  showArrow = true,
  arrowSize = 8,
  arrowClassName,
  preventClickThrough = true,
  alignOffset = 0,
  sideOffset = 0,
  ...props
}: PopoverContentProps) {
  const { open, contentId, triggerRef, placement, offset, isPortal } = usePopoverContext();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Calculate position
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    transformOrigin: '',
  });
  
  // Calculate arrow position
  const [arrowPosition, setArrowPosition] = useState({
    top: 0,
    left: 0,
    rotate: '0deg',
  });
  
  // Update position when trigger element or placement changes
  useEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return;
    
    const updatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      const contentRect = contentRef.current!.getBoundingClientRect();
      
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      
      // Base positions
      let top = 0;
      let left = 0;
      let origin = '';
      
      // Horizontal alignment adjustment
      const horizontalAdjustment = alignOffset * contentRect.width / 2;
      
      // Calculate position based on placement
      switch (placement) {
        case 'top':
          top = triggerRect.top - contentRect.height - offset + scrollY;
          left = triggerRect.left + (triggerRect.width - contentRect.width) / 2 + horizontalAdjustment + scrollX;
          origin = 'bottom center';
          break;
        case 'top-start':
          top = triggerRect.top - contentRect.height - offset + scrollY;
          left = triggerRect.left + horizontalAdjustment + scrollX;
          origin = 'bottom left';
          break;
        case 'top-end':
          top = triggerRect.top - contentRect.height - offset + scrollY;
          left = triggerRect.right - contentRect.width + horizontalAdjustment + scrollX;
          origin = 'bottom right';
          break;
        case 'bottom':
          top = triggerRect.bottom + offset + scrollY;
          left = triggerRect.left + (triggerRect.width - contentRect.width) / 2 + horizontalAdjustment + scrollX;
          origin = 'top center';
          break;
        case 'bottom-start':
          top = triggerRect.bottom + offset + scrollY;
          left = triggerRect.left + horizontalAdjustment + scrollX;
          origin = 'top left';
          break;
        case 'bottom-end':
          top = triggerRect.bottom + offset + scrollY;
          left = triggerRect.right - contentRect.width + horizontalAdjustment + scrollX;
          origin = 'top right';
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height - contentRect.height) / 2 + scrollY;
          left = triggerRect.left - contentRect.width - offset + scrollX;
          origin = 'center right';
          break;
        case 'left-start':
          top = triggerRect.top + scrollY;
          left = triggerRect.left - contentRect.width - offset + scrollX;
          origin = 'top right';
          break;
        case 'left-end':
          top = triggerRect.bottom - contentRect.height + scrollY;
          left = triggerRect.left - contentRect.width - offset + scrollX;
          origin = 'bottom right';
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height - contentRect.height) / 2 + scrollY;
          left = triggerRect.right + offset + scrollX;
          origin = 'center left';
          break;
        case 'right-start':
          top = triggerRect.top + scrollY;
          left = triggerRect.right + offset + scrollX;
          origin = 'top left';
          break;
        case 'right-end':
          top = triggerRect.bottom - contentRect.height + scrollY;
          left = triggerRect.right + offset + scrollX;
          origin = 'bottom left';
          break;
        default:
          top = triggerRect.bottom + offset + scrollY;
          left = triggerRect.left + scrollX;
          origin = 'top left';
      }
      
      // Apply side offset
      if (placement.startsWith('top') || placement.startsWith('bottom')) {
        left += sideOffset;
      } else {
        top += sideOffset;
      }
      
      // Set position
      setPosition({
        top,
        left,
        transformOrigin: origin,
      });
      
      // Calculate arrow position
      if (showArrow) {
        let arrowTop = 0;
        let arrowLeft = 0;
        let rotate = '0deg';
        
        // Arrow offset from edge
        const arrowOffset = arrowSize;
        
        switch (placement) {
          case 'top':
            arrowTop = contentRect.height;
            arrowLeft = contentRect.width / 2 - arrowSize / 2;
            rotate = '180deg';
            break;
          case 'top-start':
            arrowTop = contentRect.height;
            arrowLeft = Math.min(triggerRect.width / 2, contentRect.width / 4) - arrowSize / 2;
            rotate = '180deg';
            break;
          case 'top-end':
            arrowTop = contentRect.height;
            arrowLeft = contentRect.width - Math.min(triggerRect.width / 2, contentRect.width / 4) - arrowSize / 2;
            rotate = '180deg';
            break;
          case 'bottom':
            arrowTop = -arrowSize;
            arrowLeft = contentRect.width / 2 - arrowSize / 2;
            rotate = '0deg';
            break;
          case 'bottom-start':
            arrowTop = -arrowSize;
            arrowLeft = Math.min(triggerRect.width / 2, contentRect.width / 4) - arrowSize / 2;
            rotate = '0deg';
            break;
          case 'bottom-end':
            arrowTop = -arrowSize;
            arrowLeft = contentRect.width - Math.min(triggerRect.width / 2, contentRect.width / 4) - arrowSize / 2;
            rotate = '0deg';
            break;
          case 'left':
            arrowTop = contentRect.height / 2 - arrowSize / 2;
            arrowLeft = contentRect.width;
            rotate = '270deg';
            break;
          case 'left-start':
            arrowTop = arrowOffset;
            arrowLeft = contentRect.width;
            rotate = '270deg';
            break;
          case 'left-end':
            arrowTop = contentRect.height - arrowOffset - arrowSize;
            arrowLeft = contentRect.width;
            rotate = '270deg';
            break;
          case 'right':
            arrowTop = contentRect.height / 2 - arrowSize / 2;
            arrowLeft = -arrowSize;
            rotate = '90deg';
            break;
          case 'right-start':
            arrowTop = arrowOffset;
            arrowLeft = -arrowSize;
            rotate = '90deg';
            break;
          case 'right-end':
            arrowTop = contentRect.height - arrowOffset - arrowSize;
            arrowLeft = -arrowSize;
            rotate = '90deg';
            break;
        }
        
        setArrowPosition({
          top: arrowTop,
          left: arrowLeft,
          rotate,
        });
      }
    };
    
    updatePosition();
    
    // Update position on resize and scroll
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [open, placement, offset, triggerRef, alignOffset, sideOffset, showArrow, arrowSize]);
  
  // Don't render if not open
  if (!open) return null;
  
  const content = (
    <div
      ref={contentRef}
      id={contentId}
      role="dialog"
      aria-modal="false"
      tabIndex={-1}
      className={cn(
        'z-50 rounded-md border bg-popover p-4 shadow-md outline-none',
        'animate-in fade-in-50 zoom-in-95 duration-100',
        className
      )}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: typeof width === 'number' ? `${width}px` : width,
        transformOrigin: position.transformOrigin,
        maxHeight: 'calc(100vh - 20px)',
        overflowY: 'auto',
      }}
      onClick={(e) => preventClickThrough && e.stopPropagation()}
      {...props}
    >
      {children}
      
      {showArrow && (
        <div
          className={cn(
            'absolute w-0 h-0',
            'border-solid border-transparent',
            arrowClassName
          )}
          style={{
            top: `${arrowPosition.top}px`,
            left: `${arrowPosition.left}px`,
            borderWidth: `${arrowSize / 2}px`,
            borderBottomColor: 'var(--popover)',
            transform: `rotate(${arrowPosition.rotate})`,
            zIndex: 1,
          }}
        />
      )}
    </div>
  );
  
  // Use portal if specified
  if (isPortal) {
    return typeof document !== 'undefined'
      ? createPortal(content, document.body)
      : null;
  }
  
  return content;
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

export interface PopoverHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PopoverHeader({ className, ...props }: PopoverHeaderProps) {
  return (
    <div
      className={cn('mb-2 flex items-center justify-between', className)}
      {...props}
    />
  );
}

export interface PopoverTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function PopoverTitle({ className, ...props }: PopoverTitleProps) {
  return (
    <h3
      className={cn('text-sm font-medium', className)}
      {...props}
    />
  );
}

export interface PopoverDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
  return (
    <p
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export interface PopoverFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PopoverFooter({ className, ...props }: PopoverFooterProps) {
  return (
    <div
      className={cn('mt-4 flex justify-end gap-2', className)}
      {...props}
    />
  );
}

export interface PopoverCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function PopoverClose({ className, children, ...props }: PopoverCloseProps) {
  const { setOpen } = usePopoverContext();
  
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary',
        'hover:bg-muted/50 focus:bg-muted/50 h-6 w-6',
        className
      )}
      onClick={() => setOpen(false)}
      {...props}
    >
      {children || (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
    </button>
  );
}