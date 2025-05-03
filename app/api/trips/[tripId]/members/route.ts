import { type NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import type { Database } from '@/types/database.types';

// Define table names directly as string literals
const TRIP_MEMBERS_TABLE = 'trip_members';

// Define database field constants to avoid linting issues
const FIELDS = {
  TRIP_MEMBERS: {
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
    ROLE: 'role'
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
): Promise<NextResponse> {
  try {
    // Must await params in Next.js 15
    const { tripId } = await params;

    // UUID validation to prevent database errors
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!tripId || !UUID_REGEX.test(tripId)) {
      return NextResponse.json({ error: 'Invalid trip ID format' }, { status: 400 });
    }

    // Explicitly use getRouteHandlerClient
    const supabase = await createRouteHandlerClient();

    // Use getUser() for a more secure auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error in members route:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch trip members
    const { data, error } = await supabase
      .from(TRIP_MEMBERS_TABLE)
      .select(
        `
        *,
        profiles(*)
      `
      )
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId);

    if (error) {
      console.error('Error fetching members:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return only the data array as per original logic, assuming the consumer expects { data: [...] }
    return NextResponse.json({ data });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}