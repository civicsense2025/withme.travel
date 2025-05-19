'use client';

/**
 * Dialog (Molecule)
 *
 * A themeable, accessible dialog/modal component with focus trapping,
 * keyboard navigation, animations, and responsive sizing.
 *
 * @module ui/molecules
 */
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & CONTEXT
// ============================================================================

export interface DialogProps {
  /** Whether the dialog is open */
  open?: boolean;
  /** Callback when the open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Child components */
  children: React.ReactNode;
  /** Whether to close on ESC key */
  closeOnEsc?: boolean;
  /** Whether to close when clicking outside */
  closeOnOutsideClick?: boolean;
  /** Initial focus element selector */
  initialFocus?: string | React.RefObject<HTMLElement>;
  /** Whether dialog should be centered */
  centered?: boolean;
}

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentRef: React.RefObject<HTMLDivElement>;
  size: DialogSize;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined);

// ============================================================================
// MAIN DIALOG COMPONENT
// ============================================================================

export function Dialog({ 
  open: controlledOpen, 
  onOpenChange, 
  children, 
  closeOnEsc = true,
  closeOnOutsideClick = true,
  initialFocus,
  centered = true,
}: DialogProps) {
  // State for uncontrolled component
  const [internalOpen, setInternalOpen] = useState(controlledOpen ?? false);
  const [size, setSize] = useState<DialogSize>('md');
  
  // Determine if controlled or uncontrolled
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  
  // Refs
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);
  
  // Handle open change
  const handleOpenChange = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };
  
  // Save previous focus when opening dialog
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;
    }
  }, [open]);
  
  // Handle ESC key press
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleOpenChange(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEsc, handleOpenChange]);
  
  // Focus trapping
  useEffect(() => {
    if (!open) return;
    
    // Set initial focus
    if (initialFocus) {
      let focusElement: HTMLElement | null = null;
      
      if (typeof initialFocus === 'string') {
        focusElement = document.querySelector(initialFocus);
      } else if (initialFocus.current) {
        focusElement = initialFocus.current;
      }
      
      if (focusElement) {
        setTimeout(() => {
          focusElement?.focus();
        }, 0);
      } else if (contentRef.current) {
        // Focus first focusable element
        const focusableElements = contentRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        }
      }
    }
    
    // Focus trap
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !contentRef.current) return;
      
      const focusableElements = contentRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    
    // Prevent scrolling on body
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.body.style.overflow = originalStyle;
      
      // Restore focus
      if (previousFocusRef.current && typeof (previousFocusRef.current as HTMLElement).focus === 'function') {
        (previousFocusRef.current as HTMLElement).focus();
      }
    };
  }, [open, initialFocus]);
  
  return (
    <DialogContext.Provider 
      value={{ 
        open, 
        setOpen: handleOpenChange, 
        contentRef,
        size,
      }}
    >
      <DialogSizeContext.Provider value={setSize}>
        {children}
      </DialogSizeContext.Provider>
    </DialogContext.Provider>
  );
}

// Size context for nested components
const DialogSizeContext = React.createContext<React.Dispatch<React.SetStateAction<DialogSize>>>(() => {});

// Hook to access dialog context
function useDialogContext() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog');
  }
  return context;
}

// ============================================================================
// DIALOG TRIGGER COMPONENT
// ============================================================================

export interface DialogTriggerProps {
  /** The element to trigger the dialog */
  children: React.ReactNode;
  /** Whether trigger should be disabled */
  disabled?: boolean;
  /** Custom open handler */
  onOpen?: () => void;
  /** Additional props to pass to trigger element */
  asChild?: boolean;
}

export function DialogTrigger({ 
  children, 
  disabled = false,
  onOpen,
  asChild = false, 
}: DialogTriggerProps) {
  const { setOpen } = useDialogContext();
  
  const handleOpen = () => {
    if (disabled) return;
    setOpen(true);
    onOpen?.();
  };
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        const originalOnClick = (children.props as any).onClick;
        if (originalOnClick) originalOnClick(e);
        if (!e.defaultPrevented) handleOpen();
      },
      disabled,
    });
  }
  
  return (
    <span onClick={handleOpen} style={{ cursor: disabled ? 'default' : 'pointer' }}>
      {children}
    </span>
  );
}

// ============================================================================
// DIALOG CONTENT COMPONENT
// ============================================================================

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Dialog content */
  children: React.ReactNode;
  /** Whether to render a close button */
  showCloseButton?: boolean;
  /** Dialog size */
  size?: DialogSize;
  /** Maximum width in pixels */
  maxWidth?: number;
  /** Whether to allow content to overflow */
  allowOverflow?: boolean;
}

export function DialogContent({ 
  children, 
  className, 
  showCloseButton = true,
  size: propSize = 'md',
  maxWidth,
  allowOverflow = false,
  ...props 
}: DialogContentProps) {
  const { open, setOpen, contentRef, size: contextSize } = useDialogContext();
  const setSize = React.useContext(DialogSizeContext);
  
  // Use prop size if provided, otherwise use context size
  const actualSize = propSize || contextSize;
  
  // Set size in context when component mounts
  React.useEffect(() => {
    setSize(propSize);
  }, [propSize, setSize]);
  
  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-none w-full h-full m-0 rounded-none',
  };
  
  // Early return if dialog is closed
  if (!open) return null;
  
  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
  };
  
  // Dialog content with portal
  const content = (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm',
        'animate-in fade-in duration-200',
        className
      )}
      aria-modal="true"
      role="dialog"
      onClick={handleBackdropClick}
      {...props}
    >
      <div
        ref={contentRef}
        className={cn(
          'bg-background rounded-lg shadow-lg animate-in zoom-in-90 duration-150',
          actualSize === 'full' ? 'w-full h-full' : 'p-6 mx-4 my-4',
          sizeClasses[actualSize],
          !allowOverflow && 'overflow-hidden',
          actualSize === 'full' ? '' : 'max-h-[90vh] overflow-y-auto'
        )}
        style={maxWidth ? { maxWidth: `${maxWidth}px` } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            type="button"
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => setOpen(false)}
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
  
  // Use portal to render at the end of the body
  return typeof document !== 'undefined' 
    ? createPortal(content, document.body) 
    : null;
}

// ============================================================================
// DIALOG SUBCOMPONENTS
// ============================================================================

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return <div className={cn('mb-4', className)} {...props} />;
}

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Title text */
  children: React.ReactNode;
}

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return <h2 className={cn('text-lg font-semibold', className)} {...props} />;
}

export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to align buttons to the right */
  alignEnd?: boolean;
}

export function DialogFooter({ className, alignEnd = true, ...props }: DialogFooterProps) {
  return (
    <div 
      className={cn(
        'mt-4 flex gap-2', 
        alignEnd ? 'justify-end' : 'justify-start',
        className
      )} 
      {...props} 
    />
  );
}

export interface DialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button label */
  children: React.ReactNode;
  /** Close dialog on click */
  closeOnClick?: boolean;
}

export function DialogAction({ 
  className, 
  children, 
  closeOnClick = true,
  onClick,
  ...props 
}: DialogActionProps) {
  const { setOpen } = useDialogContext();
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (closeOnClick && !e.defaultPrevented) {
      setOpen(false);
    }
  };
  
  return (
    <button
      className={cn(
        'px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

export interface DialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button label */
  children: React.ReactNode;
}

export function DialogCancel({ 
  className, 
  children = 'Cancel',
  onClick,
  ...props 
}: DialogCancelProps) {
  const { setOpen } = useDialogContext();
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) {
      setOpen(false);
    }
  };
  
  return (
    <button
      className={cn(
        'px-4 py-2 rounded bg-muted text-foreground hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}