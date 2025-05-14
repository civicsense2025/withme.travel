import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TRIP_ROLES } from '@/utils/constants/status';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Define local constants for tables
const TABLES = {
  TRIP_MEMBERS: 'trip_members',
  ITINERARY_SECTIONS: 'itinerary_sections',
};

// Helper function to check user membership and role
async function checkTripAccess(
  supabase: SupabaseClient<Database>,
  tripId: string,
  userId: string,
  allowedRoles: string[] = ['admin', 'editor', 'contributor']
) {
  const { data, error } = await supabase
    .from('trip_members')
    .select('role')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error checking trip membership:', error);
    return { allowed: false, error: error.message, status: 500 };
  }

  if (!data) {
    return {
      allowed: false,
      error: 'Access Denied: You are not a member of this trip.',
      status: 403,
    };
  }

  if (!allowedRoles.includes(data.role)) {
    return {
      allowed: false,
      error: 'Access Denied: You do not have sufficient permissions.',
      status: 403,
    };
  }

  return { allowed: true };
}

export async function POST(request: NextRequest, { params }: { params: { tripId: string } }) {
  try {
    const { tripId } = params;
    const body = await request.json();
    const { orderedDayNumbers } = body;

    if (!tripId || !orderedDayNumbers || !Array.isArray(orderedDayNumbers)) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check user's access
    const accessCheck = await checkTripAccess(supabase, tripId, user.id, [
      TRIP_ROLES.ADMIN,
      TRIP_ROLES.EDITOR,
      TRIP_ROLES.CONTRIBUTOR,
    ]);

    if (!accessCheck.allowed) {
      return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status || 403 });
    }

    console.log(`[API /sections/reorder] Received request for trip ${tripId}:`, orderedDayNumbers);

    // Instead of using a stored procedure, update positions manually
    // This is a simpler approach that doesn't depend on a custom function
    const updates = [];

    // Process null (unscheduled) value separately
    const scheduledDayNumbers = orderedDayNumbers.filter((day) => day !== null) as number[];

    // Update each section with its new position
    for (let i = 0; i < scheduledDayNumbers.length; i++) {
      const dayNumber = scheduledDayNumbers[i];
      updates.push(
        supabase
          .from(TABLES.ITINERARY_SECTIONS)
          .update({ position: i + 1 }) // +1 because we want 1-based positions
          .eq('trip_id', tripId)
          .eq('day_number', dayNumber)
      );
    }

    // Execute all updates in parallel
    const results = await Promise.all(updates);

    // Check for errors
    const errors = results.filter((result) => result.error);
    if (errors.length > 0) {
      console.error('Errors updating section positions:', errors);
      return NextResponse.json(
        {
          error:
            'Failed to update section order: ' + (errors[0]?.error?.message || 'Unknown error'),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sections reordered successfully',
    });
  } catch (error) {
    console.error('Error reordering sections:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
