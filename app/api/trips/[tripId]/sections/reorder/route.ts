import { createServerSupabaseClient } from '@/utils/supabase/server';
import { NextResponse, NextRequest } from 'next/server';
import { type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { type TripRole } from '@/utils/constants/status';

// --- Local Constant Definitions ---
const LOCAL_TABLES = {
  TRIP_MEMBERS: 'trip_members',
};
const LOCAL_ENUMS = {
  TRIP_ROLES: {
    ADMIN: 'admin',
    EDITOR: 'editor',
    // Contributors usually shouldn't reorder sections
  } as const,
};
type ModifiableTripRole = 'admin' | 'editor';
// --- End Local Definitions ---

// Reusable access check function (modify allowed roles)
async function checkTripAccess(
  supabase: SupabaseClient<Database>,
  tripId: string,
  userId: string,
  allowedRoles: ModifiableTripRole[] = [LOCAL_ENUMS.TRIP_ROLES.ADMIN, LOCAL_ENUMS.TRIP_ROLES.EDITOR]
): Promise<{ allowed: boolean; error?: string; status?: number }> {
  const { data: member, error } = await supabase
    .from(LOCAL_TABLES.TRIP_MEMBERS)
    .select('role')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[checkTripAccess Sections] Error:', error);
    return { allowed: false, error: 'Failed to check trip membership.', status: 500 };
  }

  if (!member || !allowedRoles.includes(member.role as ModifiableTripRole)) {
    return {
      allowed: false,
      error: 'Access Denied: You do not have permission to reorder sections.',
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
    // Expect an array of day numbers (or null for unscheduled) in the desired order
    const { orderedDayNumbers }: { orderedDayNumbers: (number | null)[] } = await request.json();

    // Basic validation
    if (!tripId || !Array.isArray(orderedDayNumbers)) {
      return NextResponse.json(
        { error: 'Missing required parameters (tripId, orderedDayNumbers array)' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check user's access (Admin or Editor required to reorder sections)
    const accessCheck = await checkTripAccess(supabase, tripId, user.id);
    if (!accessCheck.allowed) {
      return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status || 403 });
    }

    console.log(`[API /sections/reorder] Received request for trip ${tripId}:`, orderedDayNumbers);

    // Call the RPC function to update section positions
    const { error: rpcError } = await supabase.rpc('update_itinerary_section_order', {
      p_trip_id: tripId,
      p_ordered_day_numbers: orderedDayNumbers,
    });

    if (rpcError) {
      console.error('Error calling update_itinerary_section_order RPC:', rpcError);
      return NextResponse.json(
        { error: 'Failed to update section order: ' + rpcError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API /sections/reorder] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
