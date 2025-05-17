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
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        isAuthorized: false,
        error: 'Not authenticated',
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
        error: 'Not a member of this trip',
      };
    }

    return {
      isAuthorized: true,
      userId: user.id,
      role: member.role,
    };
  } catch (error) {
    console.error('Error checking trip membership:', error);
    return {
      isAuthorized: false,
      error: 'Failed to check trip membership',
    };
  }
}

/**
 * Checks if the current authenticated user or guest is a member of a trip
 * @param supabase - Supabase client
 * @param tripId - ID of the trip to check
 * @param guestToken - Optional guest token for unauthenticated users
 * @returns Object with authorization status, userId, role, and isGuest flag if authorized
 */
export async function isUserOrGuestTripMember(
  supabase: SupabaseClient,
  tripId: string,
  guestToken?: string | null
): Promise<UserTripMemberResult & { isGuest?: boolean }> {
  try {
    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Check for guest token if no authenticated user
    if ((!user || authError) && guestToken) {
      // Check if the guest token has access to the trip
      const { data: guestAccess, error: guestError } = await supabase
        .from('guest_trip_access')
        .select('role, status')
        .eq('trip_id', tripId)
        .eq('guest_token', guestToken)
        .single();

      if (guestError || !guestAccess) {
        return {
          isAuthorized: false,
          isGuest: true,
          error: 'Guest does not have access to this trip',
        };
      }

      // Check if the access is active
      if (guestAccess.status !== 'active') {
        return {
          isAuthorized: false,
          isGuest: true,
          error: 'Guest access is not active for this trip',
        };
      }

      return {
        isAuthorized: true,
        role: guestAccess.role,
        isGuest: true,
      };
    }

    // For authenticated users, use the existing function
    if (user) {
      // Check if the user is a member of the trip
      const { data: member, error: memberError } = await supabase
        .from('trip_members')
        .select('role')
        .eq('trip_id', tripId)
        .eq('user_id', user.id)
        .single();

      if (memberError || !member) {
        return {
          isAuthorized: false,
          userId: user.id,
          error: 'Not a member of this trip',
        };
      }

      return {
        isAuthorized: true,
        userId: user.id,
        role: member.role,
      };
    }

    // No user or guest token
    return {
      isAuthorized: false,
      error: 'Not authenticated',
    };
  } catch (error) {
    console.error('Error checking trip membership:', error);
    return {
      isAuthorized: false,
      error: 'Failed to check trip membership',
    };
  }
}
