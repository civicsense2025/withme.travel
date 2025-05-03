import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TRIP_ROLES, ITEM_STATUSES } from '@/utils/constants/status';
import { z } from 'zod';

// Define table name constants
const TRIP_MEMBERS_TABLE = 'trip_members';
const ITINERARY_ITEMS_TABLE = 'itinerary_items';

// Define interfaces for our data models
interface TripMember {
  role: string;
}

// Type guard for TripMember
function isTripMember(obj: any): obj is TripMember {
  return obj && typeof obj === 'object' && 'role' in obj && typeof obj.role === 'string';
}

// Local constants for field names
const FIELDS = {
  COMMON: {
    ID: 'id',
    UPDATED_AT: 'updated_at'
  },
  TRIP_MEMBERS: {
    ROLE: 'role',
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id'
  },
  ITINERARY_ITEMS: {
    STATUS: 'status',
    TRIP_ID: 'trip_id'
  }
};

// Helper function for checking trip access
async function checkTripAccess(
  supabase: SupabaseClient<Database>,
  tripId: string,
  userId: string,
  allowedRoles: string[] = [TRIP_ROLES.ADMIN, TRIP_ROLES.EDITOR]
): Promise<{ allowed: boolean; error?: string; status?: number }> {
  const { data: member, error } = await supabase
    .from(TRIP_MEMBERS_TABLE)
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

  if (!isTripMember(member)) {
    console.error('Invalid member data format:', member);
    return { allowed: false, error: 'Invalid member data format', status: 500 };
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
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  try {
    const { tripId, itemId } = await params;

    if (!tripId || !itemId) {
      return NextResponse.json({ error: 'Trip ID and Item ID are required' }, { status: 400 });
    }

    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Access Check: Only admins and editors can change status
    const access = await checkTripAccess(supabase, tripId, user.id, [TRIP_ROLES.ADMIN, TRIP_ROLES.EDITOR]);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const body = await request.json();
    const newStatus = body.status;

    // Validate the new status using valid status values
    const validStatuses = Object.values(ITEM_STATUSES);
    if (!newStatus || !validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid status provided. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if the item exists and belongs to the trip
    const { data: itemCheck, error: itemCheckError } = await supabase
      .from(ITINERARY_ITEMS_TABLE)
      .select(FIELDS.COMMON.ID)
      .eq(FIELDS.COMMON.ID, itemId)
      .eq(FIELDS.ITINERARY_ITEMS.TRIP_ID, tripId)
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
      .from(ITINERARY_ITEMS_TABLE)
      .update({
        [FIELDS.ITINERARY_ITEMS.STATUS]: newStatus,
        [FIELDS.COMMON.UPDATED_AT]: new Date().toISOString(),
      })
      .eq(FIELDS.COMMON.ID, itemId);

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

// --- PUT Handler --- //
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  const { tripId, itemId } = await params;
  const supabase = createRouteHandlerClient();
  return NextResponse.json(
    { error: 'PUT method not implemented for status update. Use PATCH.' },
    { status: 405 }
  );
}
