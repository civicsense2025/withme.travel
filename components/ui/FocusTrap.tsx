/**
 * FocusTrap (Molecule)
 *
 * A component that traps focus within its children, useful for modals,
 * dialogs, and other overlay components.
 *
 * @module ui/molecules
 */
import React, { useEffect, useRef } from 'react';

export interface FocusTrapProps {
  /** Whether the focus trap is active */
  active?: boolean;
  /** Automatically focus the first focusable element when mounted */
  autoFocus?: boolean;
  /** Restore focus to the previously focused element when unmounted */
  restoreFocus?: boolean;
  /** Custom selector for focusable elements */
  focusableSelector?: string;
  /** Child elements where focus will be trapped */
  children: React.ReactNode;
  /** Called when focus tries to escape and is redirected */
  onFocusEscape?: () => void;
  /** Called after focus trap is activated */
  onActivate?: () => void;
  /** Called after focus trap is deactivated */
  onDeactivate?: () => void;
  /** Whether to focus on initial render */
  initialFocus?: boolean | React.RefObject<HTMLElement>;
}

export function FocusTrap({
  active = true,
  autoFocus = true,
  restoreFocus = true,
  focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  children,
  onFocusEscape,
  onActivate,
  onDeactivate,
  initialFocus,
}: FocusTrapProps) {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);
  const initialFocusSet = useRef(false);
  
  // When active state changes
  useEffect(() => {
    if (active) {
      onActivate?.();
    } else {
      onDeactivate?.();
    }
  }, [active, onActivate, onDeactivate]);
  
  // Save the previously focused element when mounted
  useEffect(() => {
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement;
    }
    
    return () => {
      if (restoreFocus && previousFocusRef.current && typeof (previousFocusRef.current as HTMLElement).focus === 'function') {
        (previousFocusRef.current as HTMLElement).focus();
      }
    };
  }, [restoreFocus]);
  
  // Set initial focus
  useEffect(() => {
    if (!active || !autoFocus || !containerRef.current || initialFocusSet.current) {
      return;
    }
    
    // Handle initialFocus ref if provided
    if (initialFocus && typeof initialFocus !== 'boolean' && initialFocus.current) {
      initialFocus.current.focus();
      initialFocusSet.current = true;
      return;
    }
    
    // Focus the first focusable element or the container itself
    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(focusableSelector);
    
    if (focusableElements.length > 0 && initialFocus !== false) {
      focusableElements[0].focus();
    } else {
      // If no focusable elements, make the container focusable and focus it
      containerRef.current.tabIndex = -1;
      containerRef.current.focus();
    }
    
    initialFocusSet.current = true;
  }, [active, autoFocus, focusableSelector, initialFocus]);
  
  // Handle tab key to trap focus
  useEffect(() => {
    if (!active || !containerRef.current) {
      return undefined;
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') {
        return;
      }
      
      // Find all focusable elements
      const focusableElements = Array.from(
        containerRef.current!.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter(el => el.tabIndex !== -1);
      
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      // Handle tab and shift+tab
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
        onFocusEscape?.();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
        onFocusEscape?.();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, focusableSelector, onFocusEscape]);
  
  // Handle focus leaving the container
  useEffect(() => {
    if (!active || !containerRef.current) {
      return undefined;
    }
    
    const handleFocusIn = (e: FocusEvent) => {
      if (
        containerRef.current &&
        e.target &&
        !containerRef.current.contains(e.target as Node)
      ) {
        // Focus has left the container, pull it back
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(focusableSelector);
        if (focusableElements.length > 0) {
          e.preventDefault();
          focusableElements[0].focus();
          onFocusEscape?.();
        }
      }
    };
    
    document.addEventListener('focusin', handleFocusIn);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [active, focusableSelector, onFocusEscape]);
  
  return (
    <div ref={containerRef} style={{ outline: 'none' }}>
      {children}
    </div>
  );
}