import { SupabaseClient } from '@supabase/supabase-js';
// Remove the TABLES import that's causing type issues
// import { TABLES } from '@/utils/constants/database';

export interface UserTripMemberResult {
  isAuthorized: boolean;
  userId?: string;
  role?: string;
  error?: string;
}

/**
 * Checks if the current authenticated user is a member of a trip
 * @param supabase - Supabase client
 * @param tripId - ID of the trip to check
 * @returns Object with authorization status, userId, and role if authorized
 */
export async function isUserTripMember(
  supabase: SupabaseClient,
  tripId: string
): Promise<UserTripMemberResult> {
  try {
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        isAuthorized: false,
        error: 'Not authenticated'
      };
    }

    // Check if the user is a member of the trip
    const { data: member, error: memberError } = await supabase
      .from('trip_members') // Use the string literal directly
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return {
        isAuthorized: false,
        userId: user.id,
        error: 'Not a member of this trip'
      };
    }

    return {
      isAuthorized: true,
      userId: user.id,
      role: member.role
    };
  } catch (error) {
    console.error('Error checking trip membership:', error);
    return {
      isAuthorized: false,
      error: 'Failed to check trip membership'
    };
  }
} 