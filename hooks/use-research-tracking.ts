import { useContext } from 'react';
import { ResearchContext } from '@/app/context/research-context';
import type { EventType } from '@/types/research';

/**
 * Hook to track research/user testing events and trigger surveys.
 * For future: Integrate with backend API.
 */
export function useResearchTracking() {
  const ctx = useContext(ResearchContext);

  function trackEvent(eventType: EventType, details?: Record<string, any>) {
    if (!ctx || typeof ctx.trackEvent !== 'function') return;
    if (!eventType) return;
    ctx.trackEvent(eventType, details);
  }

  return { trackEvent };
}
