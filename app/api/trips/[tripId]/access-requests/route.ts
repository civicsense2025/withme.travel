import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { checkTripAccess } from '@/lib/trip-access';
import { TRIP_ROLES } from '@/utils/constants/status';
import { Database } from '@/types/database.types';

// Define table names directly
const TRIP_MEMBERS_TABLE = 'trip_members';
const PERMISSION_REQUESTS_TABLE = 'permission_requests';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const supabase = await createRouteHandlerClient();

    // Check if user is authenticated using getUser
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an admin of this trip
    const { data: membership, error: membershipError } = await supabase
      .from(TRIP_MEMBERS_TABLE)
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership || membership.role !== TRIP_ROLES.ADMIN) {
      return NextResponse.json(
        { error: "You don't have permission to view access requests" },
        { status: 403 }
      );
    }

    // Fetch all pending access requests for this trip
    const { data, error } = await supabase
      .from(PERMISSION_REQUESTS_TABLE)
      .select(
        `
        id,
        user_id,
        message,
        created_at,
        user:user_id (
          name,
          email,
          avatar_url
        )
      `
      )
      .eq('trip_id', tripId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error fetching access requests:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
