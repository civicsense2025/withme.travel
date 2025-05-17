/**
 * Research tracking hook
 * 
 * This is a compatibility layer that redirects to the standard trip/group event tracking.
 * All survey functionality has been removed, but this hook is maintained for API compatibility.
 */
import { useTripEventTracking, type EventType } from './use-trip-event-tracking';

export { type EventType };

export function useResearchTracking() {
  const { trackEvent } = useTripEventTracking();
  
  return {
    // Provide the same API surface for compatibility
    trackEvent,
  };
} 