import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { TABLES } from '@/utils/constants/database';
import { TRIP_ROLES } from '@/utils/constants/status';
import { Database } from '@/types/database.types';
import { type SupabaseClient } from '@supabase/supabase-js';

// Define all needed table names as string literals
const TRIP_MEMBERS_TABLE = 'trip_members';
const TRIPS_TABLE = 'trips';
const ITINERARY_ITEMS_TABLE = 'itinerary_items';

// Define interfaces for our data models
interface TripMember {
  role: string;
}

interface Trip {
  privacy_setting: string | null;
}

// Type guards
function isTripMember(obj: any): obj is TripMember {
  return obj && typeof obj === 'object' && 'role' in obj && typeof obj.role === 'string';
}

function isTrip(obj: any): obj is Trip {
  return obj && typeof obj === 'object' && 'privacy_setting' in obj;
}

// Define constants for database fields and enum values locally
const FIELDS = {
  TRIP_MEMBERS: {
    ROLE: 'role',
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id'
  },
  TRIPS: {
    PRIVACY_SETTING: 'privacy_setting'
  },
  COMMON: {
    ID: 'id'
  }
};

// Helper function to check user membership and role
async function checkTripAccess(
  supabase: SupabaseClient<Database>,
  tripId: string,
  userId: string,
  allowedRoles: string[] = [TRIP_ROLES.ADMIN, TRIP_ROLES.EDITOR, TRIP_ROLES.CONTRIBUTOR, TRIP_ROLES.VIEWER]
): Promise<{ allowed: boolean; error?: string; status?: number; role?: string }> {
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
    const { data: trip, error: tripError } = await supabase
      .from(TRIPS_TABLE)
      .select(FIELDS.TRIPS.PRIVACY_SETTING)
      .eq(FIELDS.COMMON.ID, tripId)
      .maybeSingle();

    if (tripError) {
      console.error('Error checking trip privacy:', tripError);
      return { allowed: false, error: 'Failed to check trip privacy', status: 500 };
    }

    // Check if trip object has privacy_setting property
    const privacy = isTrip(trip) ? trip.privacy_setting : null;
    const canViewPublic = privacy === 'public' && allowedRoles.includes(TRIP_ROLES.VIEWER);

    if (!canViewPublic) {
      return {
        allowed: false,
        error: 'Access Denied: You are not a member of this trip.',
        status: 403,
      };
    }
    return { allowed: true, role: TRIP_ROLES.VIEWER };
  }

  // Check if member object has role property
  if (!isTripMember(member)) {
    console.error('Invalid member data format:', member);
    return { allowed: false, error: 'Invalid member data format', status: 500 };
  }

  if (!allowedRoles.includes(member.role)) {
    return {
      allowed: false,
      error: 'Access Denied: You do not have sufficient permissions.',
      status: 403,
    };
  }

  return { allowed: true, role: member.role };
}

// DELETE /api/trips/[tripId]/itinerary/[itemId] - Delete an itinerary item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  try {
    const { tripId, itemId } = await params;
    const supabase = await createRouteHandlerClient();

    if (!tripId || !itemId) {
      return NextResponse.json({ error: 'Trip ID and Item ID are required' }, { status: 400 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const accessCheck = await checkTripAccess(supabase, tripId, user.id, [TRIP_ROLES.ADMIN, TRIP_ROLES.EDITOR]);
    if (!accessCheck.allowed) {
      return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status || 403 });
    }

    const { error: deleteError } = await supabase
      .from(ITINERARY_ITEMS_TABLE)
      .delete()
      .eq(FIELDS.COMMON.ID, itemId)
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId);

    if (deleteError) {
      console.error('Error deleting item:', deleteError);
      return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --- GET Handler --- //
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  try {
    const { tripId, itemId } = await params;
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!tripId || !itemId) {
      return NextResponse.json({ error: 'Trip ID and Item ID are required' }, { status: 400 });
    }

    const accessCheck = await checkTripAccess(supabase, tripId, user?.id || '', [
      TRIP_ROLES.ADMIN,
      TRIP_ROLES.EDITOR,
      TRIP_ROLES.CONTRIBUTOR,
      TRIP_ROLES.VIEWER,
    ]);
    if (!accessCheck.allowed) {
      return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status || 403 });
    }

    const { data: item, error: fetchError } = await supabase
      .from(ITINERARY_ITEMS_TABLE)
      .select('*')
      .eq(FIELDS.COMMON.ID, itemId)
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching item:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
    }

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Schema for validating itinerary item updates
const updateItemSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    start_time: z.string().optional().nullable(),
    end_time: z.string().optional().nullable(),
    item_type: z.string().optional(),
    url: z.string().url().optional().nullable(),
    address: z.string().optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    notes: z.string().optional().nullable(),
  })
  .partial();

// --- PUT Handler (Update) --- //
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  try {
    const { tripId, itemId } = await params;
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!tripId || !itemId) {
      return NextResponse.json({ error: 'Trip ID and Item ID are required' }, { status: 400 });
    }

    const accessCheck = await checkTripAccess(supabase, tripId, user.id, [TRIP_ROLES.ADMIN, TRIP_ROLES.EDITOR]);
    if (!accessCheck.allowed) {
      return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status || 403 });
    }

    let updateData: Partial<z.infer<typeof updateItemSchema>>;
    try {
      const body = await request.json();
      updateData = updateItemSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid data', issues: error.errors }, { status: 400 });
      }
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields provided for update' }, { status: 400 });
    }

    const { data: updatedItem, error: updateError } = await supabase
      .from(ITINERARY_ITEMS_TABLE)
      .update(updateData)
      .eq(FIELDS.COMMON.ID, itemId)
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating item:', updateError);
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error('Error in PUT handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --- PATCH Handler as an alias for PUT --- //
export { PUT as PATCH };
