'use client';

import { getBrowserClient } from '@/utils/supabase/browser-client';

interface TrackPlanEventProps {
  planId: string;
  groupId: string;
  eventType: string;
  eventData?: Record<string, any>;
}

/**
 * Tracks a group plan event
 * Logs user interactions with group plans for analytics and personalization
 */
export async function trackPlanEvent({
  planId,
  groupId,
  eventType,
  eventData = {},
}: TrackPlanEventProps): Promise<string | null> {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return null;
    }

    const supabase = getBrowserClient();

    // Get current user (with proper error handling)
    const { data, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.warn('Auth error when tracking plan event:', authError.message);
      return null;
    }

    const user = data?.user;
    let eventId = null;

    try {
      if (user) {
        // Try to call the RPC function to log the event
        const { data: rpData, error: rpError } = await supabase.rpc('log_group_plan_event' as any, {
          p_plan_id: planId,
          p_group_id: groupId,
          p_user_id: user.id,
          p_event_type: eventType,
          p_event_data: eventData,
        });

        if (rpError) {
          throw rpError;
        }

        // Set the event ID from the RPC response
        eventId = typeof rpData === 'string' ? rpData : null;
      }
    } catch (rpcError) {
      // Handle RPC errors - log to console and fallback to localStorage
      const errorMessage = rpcError instanceof Error ? rpcError.message : String(rpcError);
      console.warn('RPC Error in trackPlanEvent (falling back to localStorage):', errorMessage);

      // RPC function might not exist yet - just log to localStorage
      eventId = null;
    }

    // If we weren't able to log to database, fall back to localStorage
    if (!eventId) {
      try {
        if (typeof localStorage !== 'undefined') {
          const fallbackEventId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          const localEvents = JSON.parse(localStorage.getItem('plan_events') || '[]');

          localEvents.push({
            id: fallbackEventId,
            plan_id: planId,
            group_id: groupId,
            user_id: user?.id || 'guest',
            event_type: eventType,
            event_data: eventData,
            created_at: new Date().toISOString(),
          });

          localStorage.setItem('plan_events', JSON.stringify(localEvents));
          console.log('Event saved to localStorage:', fallbackEventId);
          return fallbackEventId;
        }
      } catch (storageError) {
        console.warn('Failed to track event in localStorage:', storageError);
      }
    }

    return eventId;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to track plan event:', errorMessage);
    return null;
  }
}

// Common event type constants
export const PLAN_EVENT_TYPES = {
  VISIT: 'visit',
  FIRST_INTERACTION: 'first_interaction',
  ADD_IDEA: 'add_idea',
  MOVE_IDEA: 'move_idea',
  START_VOTING: 'start_voting',
  TOUR_START: 'tour_start',
  TOUR_COMPLETE: 'tour_complete',
  TOUR_SKIP: 'tour_skip',
};
