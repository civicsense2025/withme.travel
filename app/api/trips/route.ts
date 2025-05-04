import { type NextRequest, NextResponse } from 'next/server';
import { API_ROUTES } from '@/utils/constants/routes';
// Import database tables from the correct location
import { createApiRouteClient } from '@/utils/api-helpers/cookie-handlers';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TRIP_ROLES } from '@/utils/constants/status';

// Define table and field constants
const TABLES = {
  TRIPS: 'trips',
  TRIP_MEMBERS: 'trip_members',
};

const FIELDS = {
  TRIPS: {
    ID: 'id',
    NAME: 'name',
    TITLE: 'title',
    DESCRIPTION: 'description',
    CREATED_BY: 'created_by',
  },
  TRIP_MEMBERS: {
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
    ROLE: 'role',
  },
};

// Define TripRole type locally if not exported
type TripRole = 'admin' | 'editor' | 'viewer' | 'contributor';

// Define types for trips and memberships
interface TripMembership {
  trip_id: string;
  role: TripRole;
  user_id: string;
  [key: string]: any;
}

interface Trip {
  id: string;
  name: string;
  destination_id: string | null;
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const limitParam = searchParams?.get('limit');
  const skipParam = searchParams?.get('skip');
  const includeParam = searchParams?.get('include');
  const sortParam = searchParams?.get('sort') || 'updated_at';
  const orderParam = searchParams?.get('order') || 'desc';

  // Parse query params
  const limit = limitParam ? parseInt(limitParam, 10) : 100;
  const skip = skipParam ? parseInt(skipParam, 10) : 0;

  // Parse includes
  const includes: string[] = [];
  if (includeParam) {
    includes.push(...includeParam.split(','));
  }

  // Choose what to include in the response
  let select = '*';
  if (includes.length > 0) {
    // Handle specific includes
    if (includes.includes('members')) {
      select += ', members:trip_members(*)';
    }

    if (includes.includes('destination')) {
      select += ', destination:destinations(*)';
    }
  }

  try {
    // Create Supabase client
    const supabase = await createApiRouteClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get all trips where the user is a member
    const { data: memberships, error: membershipError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select('trip_id, role')
      .eq('user_id', user.id);

    if (membershipError) {
      console.error('Error fetching memberships:', membershipError);
      return NextResponse.json({ error: 'Failed to fetch memberships' }, { status: 500 });
    }

    // If no memberships, return empty array
    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Extract trip IDs from memberships
    const tripIds = memberships.map((m: any) => m.trip_id);

    // Fetch all trips that user is a member of
    let query = supabase
      .from(TABLES.TRIPS)
      .select(select)
      .in('id', tripIds)
      .order(sortParam, { ascending: orderParam === 'asc' })
      .range(skip, skip + limit - 1);

    const { data: trips, error: tripsError } = await query;

    if (tripsError) {
      console.error('Error fetching trips:', tripsError);
      return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
    }

    // Add role from membership to each trip
    const tripsWithRole = (trips as any[]).map((trip: any) => {
      const membership = (memberships as any[]).find((m: any) => m.trip_id === trip.id);
      return {
        ...trip,
        userRole: membership?.role,
      };
    });

    return NextResponse.json({ data: tripsWithRole });
  } catch (error) {
    console.error('Error in GET /api/trips:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createRouteHandlerClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Ensure the trip is associated with the current user using FIELDS
    const createdById = user.id;

    // Prepare payload using FIELDS and correct 'name' column
    const { title: tripTitle, ...restOfBody } = body;
    const insertPayload = {
      ...restOfBody,
      [FIELDS.TRIPS.NAME]: tripTitle,
      [FIELDS.TRIPS.CREATED_BY]: createdById,
    };

    const { data, error } = await supabase
      .from(TABLES.TRIPS)
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('[API /trips POST] Error inserting trip:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Trip data not returned after insert');
    }

    // Also add the creator as a member
    const tripId = data[FIELDS.TRIPS.ID];
    const { error: memberError } = await supabase.from(TABLES.TRIP_MEMBERS).insert({
      [FIELDS.TRIP_MEMBERS.TRIP_ID]: tripId,
      [FIELDS.TRIP_MEMBERS.USER_ID]: user.id,
      [FIELDS.TRIP_MEMBERS.ROLE]: TRIP_ROLES.ADMIN,
    });

    if (memberError) {
      console.error('Error adding creator as trip member:', memberError);
      // Continue anyway as the trip was created successfully
    }

    return NextResponse.json({ trip: data });
  } catch (error) {
    console.error('Error creating trip:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create trip';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
