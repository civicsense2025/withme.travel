/**
 * useMobileDialog Hook
 * 
 * React hook to handle mobile dialog behavior
 * 
 * @module hooks/use-mobile-dialog
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useMediaQuery } from './use-media-query';

/**
 * Hook for handling dialog/modal behavior differently on mobile vs desktop
 */
export function useMobileDialog(autoFocusDelay?: number) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const onOpenChange = (open: boolean) => {
    setOpen(open);
    
    // If dialog is closing, enable body scroll
    if (!open) {
      document.body.style.overflow = '';
      window.scrollTo({
        top: window.scrollY,
        behavior: 'auto',
      });
    }
  };
  
  useEffect(() => {
    if (!open) return;
    
    // If dialog is opened on mobile, prevent body scroll
    if (isMobile) {
      document.body.style.overflow = 'hidden';
      
      // Scroll to top of dialog content
      const scrollToTop = () => {
        if (contentRef.current) {
          contentRef.current.scrollTo(0, 0);
        }
      };
      
      scrollToTop();
      
      // Handle focus behavior
      if (autoFocusDelay) {
        const timer = setTimeout(() => {
          if (contentRef.current) {
            // Focus the first focusable element
            const focusable = contentRef.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusable.length > 0) {
              (focusable[0] as HTMLElement).focus();
            }
          }
        }, autoFocusDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [open, isMobile, autoFocusDelay]);
  
  // Track and handle interaction with the dialog
  const handleDialogInteraction = () => {
    // Prevent auto-closing behavior when user is actively interacting
    // You might implement additional logic here to track interaction
  };
  
  return {
    open,
    setOpen,
    onOpenChange,
    contentRef,
    isMobile,
    handleDialogInteraction,
  };
} 