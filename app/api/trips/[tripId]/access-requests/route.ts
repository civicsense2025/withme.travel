import { createApiClient } from '@/utils/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';
import { DB_TABLES, DB_FIELDS, DB_ENUMS } from '@/utils/constants/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const supabase = await createApiClient();

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
      .from(DB_TABLES.TRIP_MEMBERS)
      .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
      .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, user.id)
      .single();

    if (membershipError || !membership || membership.role !== DB_ENUMS.TRIP_ROLES.ADMIN) {
      return NextResponse.json(
        { error: "You don't have permission to view access requests" },
        { status: 403 }
      );
    }

    // Fetch all pending access requests for this trip
    const { data, error } = await supabase
      .from(DB_TABLES.PERMISSION_REQUESTS)
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
