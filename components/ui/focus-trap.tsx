/**
 * FocusTrap (Molecule)
 *
 * A themeable, accessible focus trap component (stub).
 *
 * @module ui/molecules
 */
import React, { useEffect, useRef } from 'react';

export interface FocusTrapProps {
  active?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  focusableSelector?: string;
  children: React.ReactNode;
}

export function FocusTrap({
  active = true,
  autoFocus = false,
  restoreFocus = true,
  focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  children
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Store the currently focused element to restore later
    previousFocusRef.current = document.activeElement as HTMLElement;

    if (autoFocus && containerRef.current) {
      // Find all focusable elements
      const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(focusableSelector);
      
      // Focus the first focusable element
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        // If no focusable elements, focus the container itself
        containerRef.current.setAttribute('tabindex', '-1');
        containerRef.current.focus();
      }
    }

    return () => {
      // Restore focus when the component is unmounted
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [active, autoFocus, restoreFocus, focusableSelector]);

  return <div ref={containerRef}>{children}</div>;
} 