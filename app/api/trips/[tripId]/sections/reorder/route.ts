import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { type SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from '@/types/database.types';

// Define trip roles constants
const TRIP_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  CONTRIBUTOR: 'contributor',
  VIEWER: 'viewer',
} as const;

type ModifiableRoleKey = keyof typeof TRIP_ROLES;

// Reusable access check function (modify allowed roles)
async function checkTripAccess(
  supabase: SupabaseClient<Database>,
  tripId: string,
  userId: string,
  allowedRoles: ModifiableRoleKey[] = ['ADMIN', 'EDITOR']
): Promise<{ allowed: boolean; error?: string; status?: number }> {
  const { data: member, error } = await supabase
    .from('trip_members')
    .select('role')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[checkTripAccess Sections] Error:', error);
    return { allowed: false, error: 'Failed to check trip membership.', status: 500 };
  }

  const allowedRoleValues = allowedRoles.map((roleKey) => TRIP_ROLES[roleKey]);

  if (!member || !allowedRoleValues.includes(member.role)) {
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
    const { orderedDayNumbers }: { orderedDayNumbers: (number | null)[] } = await request.json();

    if (!tripId || !Array.isArray(orderedDayNumbers)) {
      return NextResponse.json(
        { error: 'Missing required parameters (tripId, orderedDayNumbers array)' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check user's access (Admin or Editor required to reorder sections)
    const accessCheck = await checkTripAccess(supabase, tripId, user.id, ['ADMIN', 'EDITOR']);
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
