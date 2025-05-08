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
  eventData = {}
}: TrackPlanEventProps): Promise<string | null> {
  try {
    const supabase = getBrowserClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Cannot track plan event: No authenticated user');
      return null;
    }
    
    // Call the function to log the event
    const { data, error } = await supabase.rpc(
      'log_group_plan_event',
      {
        p_plan_id: planId,
        p_group_id: groupId,
        p_user_id: user.id,
        p_event_type: eventType,
        p_event_data: eventData
      }
    );
    
    if (error) {
      console.error('Error tracking plan event:', error);
      return null;
    }
    
    return data; // Returns the event ID
  } catch (error) {
    console.error('Failed to track plan event:', error);
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
  TOUR_SKIP: 'tour_skip'
}; 