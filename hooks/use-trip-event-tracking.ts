import { useCallback } from 'react';
import { useResearchTracking } from './use-research-tracking';
import type { EventType } from '@/types/research';

/**
 * Hook for tracking events related to trips with relevant context
 */
export function useTripEventTracking(tripId?: string) {
  const { trackEvent } = useResearchTracking();

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