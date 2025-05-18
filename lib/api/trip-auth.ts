import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

/**
 * Result of checking a user's access to a trip
 */
interface AccessCheckResult {
  userId: string | null;
  hasAccess: boolean;
  role?: string | null;
  authError?: string | null;
}

/**
 * Check if the current authenticated user has access to a trip
 * 
 * @param tripId - The ID of the trip to check access for
 * @returns Result of the access check including userId, hasAccess, and role
 */
export async function checkUserAccessToTrip(tripId: string): Promise<AccessCheckResult> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get the current user
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    
    if (!userId) {
      return {
        userId: null,
        hasAccess: false,
        authError: 'User not authenticated'
      };
    }
    
    // Check if user is the creator of the trip
    const { data: trip, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select('created_by')
      .eq('id', tripId)
      .single();
    
    if (tripError) {
      console.error('Error checking trip creator:', tripError);
      return {
        userId,
        hasAccess: false,
        authError: 'Error checking trip access'
      };
    }
    
    // If user is the creator, they have admin access
    if (trip?.created_by === userId) {
      console.log(`User ${userId} is the creator of trip ${tripId}, granting admin access`);
      return {
        userId,
        hasAccess: true,
        role: 'admin'
      };
    }
    
    // Check if user is a member of the trip
    const { data: member, error: memberError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .single();
    
    if (memberError && memberError.code !== 'PGRST116') { // Not found error
      console.error('Error checking trip membership:', memberError);
      return {
        userId,
        hasAccess: false,
        authError: 'Error checking trip membership'
      };
    }
    
    // If user is a member, they have access with their specified role
    if (member) {
      console.log(`User ${userId} is a member of trip ${tripId} with role ${member.role}`);
      return {
        userId,
        hasAccess: true,
        role: member.role
      };
    }
    
    // Check if the trip is public
    const { data: publicTrip } = await supabase
      .from(TABLES.TRIPS)
      .select('is_public')
      .eq('id', tripId)
      .eq('is_public', true)
      .single();
    
    if (publicTrip) {
      console.log(`Trip ${tripId} is public, granting viewer access to user ${userId}`);
      return {
        userId,
        hasAccess: true,
        role: 'viewer'
      };
    }
    
    // No access
    return {
      userId,
      hasAccess: false,
      authError: 'User does not have access to this trip'
    };
  } catch (error) {
    console.error('Error in checkUserAccessToTrip:', error);
    return {
      userId: null,
      hasAccess: false,
      authError: 'Internal error checking trip access'
    };
  }
} 