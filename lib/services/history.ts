import type { SupabaseClient } from '@supabase/supabase-js';

// Define the ENUM type matching the SQL definition
export type TripActionType =
  | 'TRIP_CREATED'
  | 'TRIP_UPDATED'
  | 'ITINERARY_ITEM_ADDED'
  | 'ITINERARY_ITEM_UPDATED'
  | 'ITINERARY_ITEM_DELETED'
  | 'MEMBER_ADDED'
  | 'MEMBER_REMOVED'
  | 'MEMBER_ROLE_UPDATED'
  | 'INVITATION_SENT'
  | 'ACCESS_REQUEST_SENT'
  | 'ACCESS_REQUEST_UPDATED'
  | 'NOTE_CREATED'
  | 'NOTE_UPDATED'
  | 'NOTE_DELETED'
  | 'IMAGE_UPLOADED'
  | 'TAG_ADDED'
  | 'TAG_REMOVED'
  | 'SPLITWISE_GROUP_LINKED'
  | 'SPLITWISE_GROUP_UNLINKED'
  | 'SPLITWISE_GROUP_CREATED_AND_LINKED';

interface LogTripHistoryParams {
  tripId: string;
  userId: string | null; // Can be null for system actions
  actionType: TripActionType;
  details?: Record<string, any> | null; // Flexible JSON details
}

/**
 * Logs an event to the trip_history table.
 * Should be called from server-side code (API routes, Server Actions)
 * after an action affecting a trip has successfully completed.
 *
 * @param supabase - The Supabase client instance (use service role for backend operations)
 * @param params - The history log parameters
 */
export async function logTripHistory(
  supabase: SupabaseClient,
  { tripId, userId, actionType, details = null }: LogTripHistoryParams
): Promise<void> {
  try {
    const { error } = await supabase.from('trip_history').insert({
      trip_id: tripId,
      user_id: userId,
      action_type: actionType,
      details: details,
      // created_at is handled by default value in DB
    });

    if (error) {
      console.error(`Failed to log trip history for trip ${tripId}, action ${actionType}:`, error);
      // Decide if you want to throw the error or just log it.
      // Throwing might interrupt the main operation if not handled carefully.
      // throw error;
    }
  } catch (err) {
    console.error(
      `Unexpected error logging trip history for trip ${tripId}, action ${actionType}:`,
      err
    );
    // Handle unexpected errors
  }
}