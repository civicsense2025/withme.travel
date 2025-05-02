import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextRequest } from 'next/server';
import { type SupabaseClient } from '@supabase/supabase-js'; // Import SupabaseClient
import type { Database } from '@/types/database.types'; // Import Database type

// Re-use or import the checkTripAccess helper function (assuming it's defined elsewhere or paste it here)
import {  TABLES, FIELDS , ENUMS } from "@/utils/constants/database";
async function checkTripAccess(
  supabase: SupabaseClient<Database>, // Use correct SupabaseClient type
  tripId: string,
  userId: string,
  allowedRoles: string[]
): Promise<{ allowed: boolean; error?: string; status?: number }> {
  const { data: member, error } = await supabase
    .from(TABLES.TRIP_MEMBERS)
    .select(FIELDS.TRIP_MEMBERS.ROLE)
    .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
    .eq(FIELDS.TRIP_MEMBERS.USER_ID, userId)
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
      error: 'Access Denied: You do not have sufficient permissions for this action.',
      status: 403,
    };
  }

  return { allowed: true };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> } // Update params type
) {
  const { tripId, itemId } = await params; // Await params

  if (!tripId || !itemId) {
    return NextResponse.json({ error: 'Trip ID and Item ID are required' }, { status: 400 });
  }

  try {
    const supabase = await createServerSupabaseClient(); // Use server helper
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Access Check: Only admins and editors can change status
    const access = await checkTripAccess(supabase, tripId, user.id, [
      ENUMS.TRIP_ROLES.ADMIN,
      ENUMS.TRIP_ROLES.EDITOR,
    ]);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const body = await request.json();
    const newStatus = body.status;

    // Validate the new status
    if (!newStatus || (newStatus !== 'approved' && newStatus !== 'rejected')) {
      return NextResponse.json(
        { error: "Invalid status provided. Must be 'approved' or 'rejected'." },
        { status: 400 }
      );
    }

    // Check if the item exists and belongs to the trip (optional but good practice)
    const { data: itemCheck, error: itemCheckError } = await supabase
      .from(TABLES.ITINERARY_ITEMS)
      .select('id')
      .eq('id', itemId)
      .eq('trip_id', tripId)
      .maybeSingle();

    if (itemCheckError) {
      console.error('Error checking item existence:', itemCheckError);
      return NextResponse.json({ error: 'Failed to verify item.' }, { status: 500 });
    }
    if (!itemCheck) {
      return NextResponse.json(
        { error: 'Itinerary item not found or does not belong to this trip.' },
        { status: 404 }
      );
    }

    // Update the item status
    const { error: updateError } = await supabase
      .from(TABLES.ITINERARY_ITEMS)
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(), // Assuming you have moddatetime trigger or want manual update
      })
      .eq(FIELDS.ITINERARY_ITEMS.ID, itemId);

    if (updateError) {
      console.error('Error updating itinerary item status:', updateError);
      return NextResponse.json({ error: 'Failed to update item status.' }, { status: 500 });
    }

    return NextResponse.json({ message: `Item status updated to ${newStatus}` }, { status: 200 });
  } catch (error) {
    console.error('Error processing status update request:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
