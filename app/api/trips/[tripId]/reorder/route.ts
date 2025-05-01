import { createApiClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { DB_TABLES } from '@/utils/constants/database';
import { type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Helper function to check user membership and role
async function checkTripAccess(
  supabase: SupabaseClient<Database>,
  tripId: string,
  userId: string,
  allowedRoles: string[] = [TRIP_ROLES.ADMIN, TRIP_ROLES.EDITOR, TRIP_ROLES.CONTRIBUTOR]
): Promise<{ allowed: boolean; error?: string; status?: number }> {
  const { data: member, error } = await supabase
    .from(DB_TABLES.TRIP_MEMBERS)
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

  if (!allowedRoles.includes(member.role)) {
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
    const { itemId, newDayNumber, newPosition } = body;

    if (!tripId || !itemId || newDayNumber === undefined || newPosition === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const supabase = await createApiClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check user's access to the trip
    const accessCheck = await checkTripAccess(supabase, tripId, user.id);
    if (!accessCheck.allowed) {
      return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status || 403 });
    }

    // Update the item's day_number and position
    const { error: updateError } = await supabase
      .from(DB_TABLES.ITINERARY_ITEMS)
      .update({
        day_number: newDayNumber,
        position: newPosition,
      })
      .eq('id', itemId)
      .eq('trip_id', tripId);

    if (updateError) {
      console.error('Error updating item:', updateError);
      return NextResponse.json({ error: 'Failed to update item position' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in reorder handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
