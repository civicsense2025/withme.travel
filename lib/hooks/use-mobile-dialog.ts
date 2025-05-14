'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A hook to make dialogs more mobile-friendly by:
 * 1. Preventing automatic keyboard focus on input fields when dialog opens
 * 2. Managing focus state to only activate input focus when user interaction
 *
 * @param autoFocusDelay Optional delay in ms before allowing autofocus (default: not allowing until user interaction)
 */
export function useMobileDialog(autoFocusDelay?: number) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [inputElement, setInputElement] = useState<HTMLInputElement | null>(null);
  const [isUserInteracted, setIsUserInteracted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Handle dialog open state
  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Reset interaction state when dialog opens
      setIsUserInteracted(false);
    }
  };

  // Prevent automatic keyboard opening by delaying focus
  useEffect(() => {
    if (!isOpen) return;

    // If there's an input in the dialog
    const inputs = dialogRef.current?.querySelectorAll('input, textarea');
    if (inputs && inputs.length > 0) {
      // Store the first input element
      setInputElement(inputs[0] as HTMLInputElement);

      // Blur any focused element to prevent keyboard from showing
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      // If autoFocusDelay is set, allow focus after delay
      if (autoFocusDelay) {
        const timer = setTimeout(() => {
          setIsUserInteracted(true);
        }, autoFocusDelay);

        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, autoFocusDelay]);

  // Focus input when user interacts with dialog
  useEffect(() => {
    if (isUserInteracted && inputElement) {
      // Focus the input element after user interaction
      inputElement.focus();
    }
  }, [isUserInteracted, inputElement]);

  // Handle user interaction
  const handleDialogInteraction = () => {
    setIsUserInteracted(true);
  };

  return {
    dialogRef,
    onOpenChange,
    handleDialogInteraction,
    isOpen,
  };
}
