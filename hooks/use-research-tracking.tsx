'use client';

import { useCallback, useEffect } from 'react';
import { RESEARCH_EVENT_TYPES } from '../types/research';

/**f
 * Hook for tracking user research events and milestones
 */
export function useResearchTracking() {
  /**
   * Track a research event
   * @param eventType The type of event to track
   * @param options Additional options for event tracking
   */
  const trackEvent = useCallback(async (
    eventType: string,
    options: {
      milestone?: string;
      userId?: string;
      details?: Record<string, any>;
      sendToAPI?: boolean;
    } = {}
  ) => {
    const { 
      milestone = null,
      userId = null,
      details = {},
      sendToAPI = true
    } = options;

    // Log event to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Research Event]`, {
        type: eventType,
        milestone,
        userId,
        details,
        timestamp: new Date().toISOString()
      });
    }

    // Skip API call if not required
    if (!sendToAPI) return;

    // Record event to API
    try {
      const response = await fetch('/api/research/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event_type: eventType,
          milestone,
          user_id: userId,
          details,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to track research event:', error);
      }
    } catch (error) {
      console.error('Error tracking research event:', error);
    }
  }, []);

  // Set up page view tracking on mount
  useEffect(() => {
    // Track page view on component mount
    const path = window.location.pathname;
    trackEvent(RESEARCH_EVENT_TYPES.PAGE_VIEW, {
      details: { path, referrer: document.referrer },
      sendToAPI: false // Don't send page views to API by default (to reduce noise)
    });
  }, [trackEvent]);

  return { trackEvent };
} 