'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { extractNotificationContext } from '@/utils/notification-deeplinks';

interface NotificationContextHandlerProps {
  tripId: string;
}

interface HighlightableRef {
  id: string;
  element: HTMLElement | null;
}

export function NotificationContextHandler({ tripId }: NotificationContextHandlerProps) {
  const searchParams = useSearchParams();
  const [highlightedRefs, setHighlightedRefs] = useState<HighlightableRef[]>([]);

  // Extract notification context from the URL
  const notificationContext = searchParams ? extractNotificationContext(searchParams) : null;

  // Track notification impressions when a user visits a page from a notification
  useEffect(() => {
    // If this page was accessed via a notification deep link, track the impression
    if (notificationContext?.notificationId) {
      // Log the impression
      console.log(`[NotificationHandler] Tracking impression for notification: ${notificationContext.notificationId}`);
      
      // Track an impression by calling the API
      fetch('/api/notifications/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          notificationId: notificationContext.notificationId,
          action: 'impression' 
        }),
      }).catch(err => {
        console.error('[NotificationHandler] Failed to track notification impression:', err);
      });
    }
  }, [notificationContext]);

  // Handle scrolling to highlighted elements when parameters in URL
  useEffect(() => {
    if (!notificationContext?.highlight) return;

    // Determine which element to highlight based on notification context
    let targetId = '';
    
    if (notificationContext.itemId) {
      targetId = `item-${notificationContext.itemId}`;
    } else if (notificationContext.commentId) {
      targetId = `comment-${notificationContext.commentId}`;
    } else if (notificationContext.voteId) {
      targetId = `vote-${notificationContext.voteId}`;
    } else if (notificationContext.focusId) {
      targetId = `focus-${notificationContext.focusId}`;
    }

    // Find the element in our tracked refs
    if (targetId) {
      const targetRef = highlightedRefs.find(ref => ref.id === targetId);
      if (targetRef?.element) {
        // Scroll to the element
        targetRef.element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [notificationContext, highlightedRefs]);

  // Register ref function to be exposed to parent component
  const registerHighlightRef = useCallback((id: string, element: HTMLElement | null) => {
    setHighlightedRefs(prev => {
      // Remove any existing ref with same id
      const filtered = prev.filter(ref => ref.id !== id);
      // Add the new ref
      return [...filtered, { id, element }];
    });
  }, []);

  // This component doesn't render anything - it just provides context handling
  return null;
}

// Export the context handler component and also a hook for other components to use
export function useNotificationHighlighting() {
  const searchParams = useSearchParams();
  const notificationContext = searchParams ? extractNotificationContext(searchParams) : null;
  
  return {
    notificationContext,
    shouldHighlight: !!notificationContext?.highlight,
    highlightId: notificationContext?.itemId || 
                notificationContext?.commentId || 
                notificationContext?.voteId || 
                notificationContext?.focusId || null
  };
} 