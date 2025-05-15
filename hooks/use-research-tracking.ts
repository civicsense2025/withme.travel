import { useContext } from 'react';
import { ResearchContext } from '@/app/context/research-context';
import type { EventType } from '@/types/research';

/**
 * Hook to track research/user testing events and trigger surveys.
 */
export function useResearchTracking() {
  const ctx = useContext(ResearchContext);

  /**
   * Track a research event
   * @param eventType The type of event to track
   * @param details Additional details for the event
   */
  function trackEvent(eventType: EventType, details?: Record<string, any>) {
    if (!ctx || typeof ctx.trackEvent !== 'function') {
      // Fallback for dev/testing when context isn't available
      console.log('[Research] Event tracked (no context):', eventType, details);
      return;
    }
    
    if (!eventType) return;
    ctx.trackEvent(eventType, details);
  }

  return { trackEvent };
}
