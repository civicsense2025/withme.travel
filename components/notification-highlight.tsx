'use client';

import { useState, useEffect, forwardRef, type Ref, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface NotificationHighlightProps {
  id: string;
  className?: string;
  children: ReactNode;
  highlightId?: string | null;
  registerRef?: (id: string, element: HTMLDivElement | null) => void;
  highlightDuration?: number;
}

export const NotificationHighlight = forwardRef<HTMLDivElement, NotificationHighlightProps>(
  (
    { 
      id, 
      className, 
      children, 
      highlightId, 
      registerRef, 
      highlightDuration = 5000
    }, 
    ref
  ) => {
    const [isHighlighted, setIsHighlighted] = useState(false);
    
    // Handle initial highlight if this element matches the highlightId
    useEffect(() => {
      const shouldHighlight = highlightId === id;
      setIsHighlighted(shouldHighlight);
      
      if (shouldHighlight) {
        // Remove highlight after duration
        const timer = setTimeout(() => {
          setIsHighlighted(false);
        }, highlightDuration);
        
        return () => clearTimeout(timer);
      }
    }, [highlightId, id, highlightDuration]);
    
    // Combined ref handling
    const handleRef = (element: HTMLDivElement | null) => {
      // Forward the ref if provided
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
      
      // Register the ref with parent component if registerRef is provided
      if (registerRef) {
        registerRef(id, element);
      }
    };
    
    return (
      <div 
        ref={handleRef}
        className={cn(
          'transition-all duration-300',
          isHighlighted ? 'bg-primary/10 ring-2 ring-primary ring-offset-2 shadow-lg' : '',
          className
        )}
      >
        {children}
      </div>
    );
  }
);

NotificationHighlight.displayName = 'NotificationHighlight';

// Usage example:
// <NotificationHighlight 
//   id="comment-123"
//   highlightId={notificationContext?.commentId}
//   registerRef={registerCommentRef}
// >
//   <CommentComponent {...commentProps} />
// </NotificationHighlight> 