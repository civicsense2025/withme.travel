import { useCallback } from 'react';

/**
 * Types of events that can be tracked
 */
export type EventType =
  | 'trip_created'
  | 'trip_updated'
  | 'trip_deleted'
  | 'itinerary_item_added'
  | 'itinerary_item_updated'
  | 'itinerary_item_deleted'
  | 'itinerary_voted';

/**
 * Hook for tracking events related to trips with relevant context
 */
export function useTripEventTracking(tripId?: string) {
  // Basic event tracking function - to be expanded later with analytics integration
  const trackEvent = useCallback(
    (eventType: EventType, details?: Record<string, any>) => {
      // Log for development
      console.log(`[EVENT] ${eventType}`, { tripId, ...details });

      // In the future, we can add real analytics tracking here
      // Example: analytics.track(eventType, { tripId, ...details });
    },
    [tripId]
  );

  const trackTripCreated = useCallback(
    (details?: Record<string, any>) => {
      trackEvent('trip_created', {
        ...(tripId ? { tripId } : {}),
        ...details,
      });
    },
    [trackEvent, tripId]
  );

  const trackTripUpdated = useCallback(
    (details?: Record<string, any>) => {
      if (!tripId) {
        console.warn('Trip ID is required for tracking trip updates');
        return;
      }

      trackEvent('trip_updated', {
        tripId,
        ...details,
      });
    },
    [trackEvent, tripId]
  );

  const trackTripDeleted = useCallback(
    (details?: Record<string, any>) => {
      if (!tripId) {
        console.warn('Trip ID is required for tracking trip deletion');
        return;
      }

      trackEvent('trip_deleted', {
        tripId,
        ...details,
      });
    },
    [trackEvent, tripId]
  );

  const trackItineraryItemAdded = useCallback(
    (itemId: string, details?: Record<string, any>) => {
      if (!tripId) {
        console.warn('Trip ID is required for tracking item addition');
        return;
      }

      trackEvent('itinerary_item_added', {
        tripId,
        itemId,
        ...details,
      });
    },
    [trackEvent, tripId]
  );

  const trackItineraryItemUpdated = useCallback(
    (itemId: string, details?: Record<string, any>) => {
      if (!tripId) {
        console.warn('Trip ID is required for tracking item updates');
        return;
      }

      trackEvent('itinerary_item_updated', {
        tripId,
        itemId,
        ...details,
      });
    },
    [trackEvent, tripId]
  );

  const trackItineraryItemDeleted = useCallback(
    (itemId: string, details?: Record<string, any>) => {
      if (!tripId) {
        console.warn('Trip ID is required for tracking item deletion');
        return;
      }

      trackEvent('itinerary_item_deleted', {
        tripId,
        itemId,
        ...details,
      });
    },
    [trackEvent, tripId]
  );

  const trackItineraryVoted = useCallback(
    (itemId: string, voteType: 'up' | 'down', details?: Record<string, any>) => {
      if (!tripId) {
        console.warn('Trip ID is required for tracking votes');
        return;
      }

      trackEvent('itinerary_voted', {
        tripId,
        itemId,
        voteType,
        ...details,
      });
    },
    [trackEvent, tripId]
  );

  return {
    trackTripCreated,
    trackTripUpdated,
    trackTripDeleted,
    trackItineraryItemAdded,
    trackItineraryItemUpdated,
    trackItineraryItemDeleted,
    trackItineraryVoted,
    trackEvent, // Include the original trackEvent for any other custom events
  };
}
