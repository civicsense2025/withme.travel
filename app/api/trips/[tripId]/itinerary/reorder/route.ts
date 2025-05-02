import { DB_ENUMS } from '@/utils/constants/database';

// Define a more complete type for TABLES that includes missing properties
type ExtendedTables = {
  TRIP_MEMBERS: string;
  TRIPS: string;
  USERS: string;
  ITINERARY_ITEMS: string;
  ITINERARY_SECTIONS: string;
  [key: string]: string;
};

// Use the extended type with the existing TABLES constant
const Tables = TABLES as unknown as ExtendedTables;

import { createServerSupabaseClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
// import { TABLES as LOCAL_TABLES, ENUMS as LOCAL_ENUMS } from '@/utils/constants/database'; // Removed direct imports
import { type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// --- Local Constant Definitions (Workaround) ---
const LOCAL_TABLES = {
  TRIP_MEMBERS: 'trip_members',
  ITINERARY_ITEMS: 'itinerary_items',
};
const LOCAL_ENUMS = {
  TRIP_ROLES: {
    ADMIN: 'admin',
    EDITOR: 'editor',
    CONTRIBUTOR: 'contributor',
    VIEWER: 'viewer',
  } as const,
};
type TripRole = 'admin' | 'editor' | 'viewer' | 'contributor';
// --- End Local Definitions ---

// Helper function to check user membership and role
async function checkTripAccess(
  supabase: SupabaseClient<Database>,
  tripId: string,
  userId: string,
  allowedRoles: TripRole[] = [
    LOCAL_ENUMS.TRIP_ROLES.ADMIN,
    LOCAL_ENUMS.TRIP_ROLES.EDITOR,
    LOCAL_ENUMS.TRIP_ROLES.CONTRIBUTOR,
  ]
): Promise<{ allowed: boolean; error?: string; status?: number }> {
  const { data: member, error } = await supabase
    .from(LOCAL_Tables.TRIP_MEMBERS) // Use local constant
    .select('role')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error checking trip membership:', error);
    return { allowed: false, error: error.message, status: 500 };
  }

  if (!member) {
    return {
      allowed: false,
      error: 'Access Denied: You are not a member of this trip.',
      status: 403,
    };
  }

  // Ensure member.role is treated as TripRole type for comparison
  if (!allowedRoles.includes(member.role as TripRole)) {
    return {
      allowed: false,
      error: 'Access Denied: You do not have sufficient permissions.',
      status: 403,
    };
  }

  return { allowed: true };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const body = await request.json();
    // Explicitly type the expected body structure
    const {
      itemId,
      newDayNumber,
      newPosition,
    }: { itemId: string; newDayNumber: number | null; newPosition: number } = body;

    // Validate required parameters, including null for newDayNumber
    if (!tripId || !itemId || newPosition === undefined || newDayNumber === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Use the updated client creator function name
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check user's access using local constants
    const accessCheck = await checkTripAccess(supabase, tripId, user.id, [
      LOCAL_ENUMS.TRIP_ROLES.ADMIN,
      LOCAL_ENUMS.TRIP_ROLES.EDITOR,
      LOCAL_ENUMS.TRIP_ROLES.CONTRIBUTOR,
    ]);
    if (!accessCheck.allowed) {
      return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status || 403 });
    }

    // LOGGING ADDED HERE
    console.log(`[API /reorder] Received request for trip ${tripId}:`, body);
    console.log(`[API /reorder] Calling RPC update_itinerary_item_position with:`, {
      p_item_id: itemId,
      p_trip_id: tripId,
      p_day_number: newDayNumber, // Can be null
      p_position: newPosition,
    });

    // Call the original RPC function again
    const { error: rpcError } = await supabase.rpc('update_itinerary_item_position', {
      p_item_id: itemId,
      p_trip_id: tripId,
      p_day_number: newDayNumber,
      p_position: newPosition,
    });

    // Handle RPC error
    if (rpcError) {
      console.error('Error calling update_itinerary_item_position RPC:', rpcError);
      return NextResponse.json(
        { error: 'Failed to update item position: ' + rpcError.message },
        { status: 500 }
      );
    }

    // If RPC succeeded, return success
    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Catch any unexpected errors
    console.error('Error in reorder handler:', error);
    // Provide a generic error message for unexpected issues
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
