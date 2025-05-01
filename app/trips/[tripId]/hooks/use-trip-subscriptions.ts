'use client';

import { useCallback, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';
import { TABLES } from '@/utils/constants/database';

interface UseTripSubscriptionsProps {
  tripId: string;
  onTripUpdate?: () => Promise<void>;
  onItineraryUpdate?: () => Promise<void>;
  onMembersUpdate?: () => Promise<void>;
  enabled?: boolean;
}

/**
 * Hook to manage real-time subscriptions for a trip
 */
export function useTripSubscriptions({
  tripId,
  onTripUpdate,
  onItineraryUpdate,
  onMembersUpdate,
  enabled = true,
}: UseTripSubscriptionsProps) {
  const supabase = createClient();

  // Use refs to store subscription channels for cleanup
  const tripSubscriptionRef = useRef<RealtimeChannel | null>(null);
  const itinerarySubscriptionRef = useRef<RealtimeChannel | null>(null);
  const membersSubscriptionRef = useRef<RealtimeChannel | null>(null);

  // Track subscription state
  const isSubscribedRef = useRef(false);

  /**
   * Set up all subscriptions
   */
  const setupSubscriptions = useCallback(async () => {
    if (!supabase || !enabled || isSubscribedRef.current) return;

    try {
      // Add breadcrumb for debugging
      Sentry.addBreadcrumb({
        category: 'subscription',
        message: `Setting up subscriptions for trip: ${tripId}`,
        level: 'info',
      });

      // Subscribe to trip updates
      if (onTripUpdate) {
        tripSubscriptionRef.current = supabase
          .channel(`trip-updates-${tripId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: TABLES.TRIPS,
              filter: `id=eq.${tripId}`,
            },
            () => {
              // Track subscription event
              Sentry.addBreadcrumb({
                category: 'subscription',
                message: `Trip update detected: ${tripId}`,
                level: 'info',
              });

              // Call the update handler
              onTripUpdate().catch((error) => {
                console.error('Error handling trip update:', error);
                Sentry.captureException(error, {
                  tags: {
                    subscription: 'trip-updates',
                    tripId,
                  },
                });
              });
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Subscribed to trip updates');
            } else if (status === 'CHANNEL_ERROR') {
              Sentry.captureMessage('Failed to subscribe to trip updates', {
                level: 'error',
                tags: { subscription: 'trip-updates', tripId },
              });
            }
          });
      }

      // Subscribe to itinerary updates
      if (onItineraryUpdate) {
        itinerarySubscriptionRef.current = supabase
          .channel(`itinerary-updates-${tripId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: TABLES.ITINERARY_ITEMS,
              filter: `trip_id=eq.${tripId}`,
            },
            () => {
              // Track subscription event
              Sentry.addBreadcrumb({
                category: 'subscription',
                message: `Itinerary update detected: ${tripId}`,
                level: 'info',
              });

              // Call the update handler
              onItineraryUpdate().catch((error) => {
                console.error('Error handling itinerary update:', error);
                Sentry.captureException(error, {
                  tags: {
                    subscription: 'itinerary-updates',
                    tripId,
                  },
                });
              });
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Subscribed to itinerary updates');
            } else if (status === 'CHANNEL_ERROR') {
              Sentry.captureMessage('Failed to subscribe to itinerary updates', {
                level: 'error',
                tags: { subscription: 'itinerary-updates', tripId },
              });
            }
          });
      }

      // Subscribe to members updates
      if (onMembersUpdate) {
        membersSubscriptionRef.current = supabase
          .channel(`members-updates-${tripId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: TABLES.TRIP_MEMBERS,
              filter: `trip_id=eq.${tripId}`,
            },
            () => {
              // Track subscription event
              Sentry.addBreadcrumb({
                category: 'subscription',
                message: `Members update detected: ${tripId}`,
                level: 'info',
              });

              // Call the update handler
              onMembersUpdate().catch((error) => {
                console.error('Error handling members update:', error);
                Sentry.captureException(error, {
                  tags: {
                    subscription: 'members-updates',
                    tripId,
                  },
                });
              });
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Subscribed to members updates');
            } else if (status === 'CHANNEL_ERROR') {
              Sentry.captureMessage('Failed to subscribe to members updates', {
                level: 'error',
                tags: { subscription: 'members-updates', tripId },
              });
            }
          });
      }

      isSubscribedRef.current = true;
    } catch (error) {
      console.error('Error setting up subscriptions:', error);
      Sentry.captureException(error, {
        tags: { action: 'setup-subscriptions', tripId },
      });
    }
  }, [tripId, supabase, onTripUpdate, onItineraryUpdate, onMembersUpdate, enabled]);

  /**
   * Cleanup all subscriptions
   */
  const cleanupSubscriptions = useCallback(() => {
    try {
      // Track cleanup
      Sentry.addBreadcrumb({
        category: 'subscription',
        message: `Cleaning up subscriptions for trip: ${tripId}`,
        level: 'info',
      });

      // Cleanup trip subscription
      if (tripSubscriptionRef.current) {
        tripSubscriptionRef.current.unsubscribe();
        tripSubscriptionRef.current = null;
      }

      // Cleanup itinerary subscription
      if (itinerarySubscriptionRef.current) {
        itinerarySubscriptionRef.current.unsubscribe();
        itinerarySubscriptionRef.current = null;
      }

      // Cleanup members subscription
      if (membersSubscriptionRef.current) {
        membersSubscriptionRef.current.unsubscribe();
        membersSubscriptionRef.current = null;
      }

      isSubscribedRef.current = false;
    } catch (error) {
      console.error('Error cleaning up subscriptions:', error);
      Sentry.captureException(error, {
        tags: { action: 'cleanup-subscriptions', tripId },
      });
    }
  }, [tripId]);

  // Set up subscriptions on mount and clean up on unmount
  useEffect(() => {
    // Setup subscriptions
    setupSubscriptions();

    // Cleanup function
    return () => {
      cleanupSubscriptions();
    };
  }, [setupSubscriptions, cleanupSubscriptions]);

  return {
    isSubscribed: isSubscribedRef.current,
    refreshSubscriptions: setupSubscriptions,
    cleanupSubscriptions,
  };
}
