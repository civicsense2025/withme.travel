import { cn } from '@/lib/utils';
import React, { HTMLAttributes, forwardRef, useEffect, useRef } from 'react';

export interface FocusTrapProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the focus trap is active
   * @default true
   */
  active?: boolean;

  /**
   * Whether to auto-focus the first focusable element when the trap activates
   * @default true
   */
  autoFocus?: boolean;

  /**
   * Whether to restore focus to the previously focused element when the trap deactivates
   * @default true
   */
  restoreFocus?: boolean;

  /**
   * Selector for elements that should be focusable
   * @default "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
   */
  focusableSelector?: string;
}

/**
 * FocusTrap contains focus within its children, preventing users from
 * tabbing outside the contained area. Useful for modals, dialogs, and
 * other overlay UI components.
 */
const FocusTrap = forwardRef<HTMLDivElement, FocusTrapProps>(
  (
    {
      active = true,
      autoFocus = true,
      restoreFocus = true,
      focusableSelector = "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const combinedRef = useCombinedRef(ref, containerRef);
    const previouslyFocusedElement = useRef<HTMLElement | null>(null);

    // Store the previously focused element
    useEffect(() => {
      if (active && restoreFocus) {
        previouslyFocusedElement.current = document.activeElement as HTMLElement;
      }
    }, [active, restoreFocus]);

    // Auto-focus the first focusable element when activated
    useEffect(() => {
      if (!active || !autoFocus) return;

      const container = containerRef.current;
      if (!container) return;

      const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusableElements.length > 0) {
        setTimeout(() => {
          focusableElements[0].focus();
        }, 0);
      }
    }, [active, autoFocus, focusableSelector]);

    // Trap focus within the container
    useEffect(() => {
      if (!active) return;

      const container = containerRef.current;
      if (!container) return;

      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((el) => !el.hasAttribute('disabled'));

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        // Shift + Tab
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        }
        // Tab
        else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [active, focusableSelector]);

    // Restore focus when deactivated
    useEffect(() => {
      if (!restoreFocus) return;

      return () => {
        if (previouslyFocusedElement.current) {
          setTimeout(() => {
            previouslyFocusedElement.current?.focus();
          }, 0);
        }
      };
    }, [restoreFocus]);

    return (
      <div ref={combinedRef} className={cn(className)} {...props}>
        {children}
      </div>
    );
  }
);

FocusTrap.displayName = 'FocusTrap';

export { FocusTrap };

// Helper to combine refs
function useCombinedRef<T>(
  externalRef: React.ForwardedRef<T>,
  internalRef: React.RefObject<T>
): React.RefCallback<T> {
  return (node: T) => {
    if (internalRef) (internalRef as React.MutableRefObject<T>).current = node;
    if (typeof externalRef === 'function') externalRef(node);
    else if (externalRef) (externalRef as React.MutableRefObject<T>).current = node;
  };
}
