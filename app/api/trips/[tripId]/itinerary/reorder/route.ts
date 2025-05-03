import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Define table name constants
const TRIP_MEMBERS_TABLE = 'trip_members';

// Define trip roles enum for type checking
const TRIP_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  CONTRIBUTOR: 'contributor',
  VIEWER: 'viewer'
} as const;

// Define database field constants to avoid linting issues
const FIELDS = {
  TRIP_MEMBERS: {
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
    ROLE: 'role'
  }
};

type AllowedRoleKey = keyof typeof TRIP_ROLES;

// Define interface for member data
interface TripMember {
  role: string;
}

// Type guard for TripMember
function isTripMember(obj: any): obj is TripMember {
  return obj && typeof obj === 'object' && 'role' in obj;
}

// Helper function to check user membership and role
async function checkTripAccess(
  supabase: SupabaseClient<Database>,
  tripId: string,
  userId: string,
  allowedRoles: AllowedRoleKey[] = [
    'ADMIN',
    'EDITOR',
    'CONTRIBUTOR',
  ]
): Promise<{ allowed: boolean; error?: string; status?: number }> {
  const { data, error } = await supabase
    .from(TRIP_MEMBERS_TABLE)
    .select('role')
    .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
    .eq(FIELDS.TRIP_MEMBERS.USER_ID, userId)
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

  if (!isTripMember(data)) {
    console.error('Invalid member data format:', data);
    return { allowed: false, error: 'Invalid member data format', status: 500 };
  }

  // Map role keys to their values for the check
  const allowedRoleValues = allowedRoles.map((roleKey) => TRIP_ROLES[roleKey]);

  // Ensure data.role is treated as string for comparison
  if (!allowedRoleValues.includes(data.role as any)) {
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
    const {
      itemId,
      newDayNumber,
      newPosition,
    }: { itemId: string; newDayNumber: number | null; newPosition: number } = body;

    if (!tripId || !itemId || newPosition === undefined || newDayNumber === undefined) {
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

    // Check user's access using direct role keys
    const accessCheck = await checkTripAccess(supabase, tripId, user.id, [
      'ADMIN',
      'EDITOR',
      'CONTRIBUTOR',
    ]);
    
    if (!accessCheck.allowed) {
      return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status || 403 });
    }

    console.log(`[API /reorder] Received request for trip ${tripId}:`, body);
    console.log(`[API /reorder] Calling RPC update_itinerary_item_position with:`, {
      p_item_id: itemId,
      p_trip_id: tripId,
      p_day_number: newDayNumber,
      p_position: newPosition,
    });

    const { error: rpcError } = await supabase.rpc('update_itinerary_item_position', {
      p_item_id: itemId,
      p_trip_id: tripId,
      p_day_number: newDayNumber,
      p_position: newPosition,
    });

    if (rpcError) {
      console.error('Error calling update_itinerary_item_position RPC:', rpcError);
      return NextResponse.json(
        { error: 'Failed to update item position: ' + rpcError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in reorder handler:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
