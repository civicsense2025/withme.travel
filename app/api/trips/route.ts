import { type NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { API_ROUTES } from '@/utils/constants/routes';
// Use original DB constants
import { DB_TABLES, DB_FIELDS, DB_ENUMS } from '@/utils/constants/database';
import { type Trip } from '@/types/database.types';

// Define interfaces for better type safety
// This interface might not be needed with the simplified query

// Define TripRole type locally if not exported
type TripRole = 'admin' | 'editor' | 'viewer' | 'contributor';

// Use the imported DB_ENUMS
const TRIP_ROLES = DB_ENUMS.TRIP_ROLES;

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  const searchParams = request.nextUrl.searchParams;
  const limitParam = searchParams.get('limit');
  const sortParam = searchParams.get('sort');
  const fieldsParam = searchParams.get('fields');

  const limit = limitParam ? parseInt(limitParam, 10) : undefined;
  const sort = sortParam || 'newest';
  // Ensure fields needed by useTrips are included
  const selectFields = fieldsParam
    ? fieldsParam
        .split(',')
        .map((f) => f.trim())
        .join(',')
    : 'id, name, start_date, end_date, destination_id, created_by, created_at, updated_at, status, duration_days, cover_image_url, destination_name';

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log('[API /trips] Unauthorized request - no user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`[API /trips] Fetching trip IDs for user ${user.id}`);

    // Step 1: Get trip_ids the user is a member of
    const { data: memberData, error: memberError } = await supabase
      .from(DB_TABLES.TRIP_MEMBERS)
      .select(DB_FIELDS.TRIP_MEMBERS.TRIP_ID)
      .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, user.id);

    if (memberError) {
      console.error('[API /trips] Error fetching user trip memberships:', memberError);
      throw memberError;
    }

    const tripIds = memberData?.map((m) => m.trip_id) || [];

    if (tripIds.length === 0) {
      console.log(`[API /trips] User ${user.id} is not a member of any trips.`);
      return NextResponse.json({ trips: [], totalCount: 0 });
    }

    console.log(`[API /trips] User ${user.id} is member of trips: ${tripIds.join(', ')}`);
    console.log(
      `[API /trips] Fetching trip details for ${tripIds.length} trips. Fields: ${selectFields}`
    );

    // Step 2: Fetch details for those trips
    let query = supabase.from(DB_TABLES.TRIPS).select(selectFields).in(DB_FIELDS.TRIPS.ID, tripIds);

    // Apply sorting using DB_FIELDS
    if (sort === 'oldest') {
      query = query.order(DB_FIELDS.TRIPS.CREATED_AT, { ascending: true });
    } else if (sort === 'name') {
      query = query.order(DB_FIELDS.TRIPS.NAME, { ascending: true });
    } else {
      // Default to newest first
      query = query.order(DB_FIELDS.TRIPS.CREATED_AT, { ascending: false });
    }

    // Apply limit if specified
    if (limit && limit > 0) {
      query = query.limit(limit);
    }

    const { data: tripsData, error: tripsError } = await query;

    if (tripsError) {
      console.error('[API /trips] Error fetching trips details:', tripsError);
      throw tripsError;
    }

    // Map name to title for compatibility with useTrips hook
    const trips =
      tripsData?.map((trip) => ({
        ...(trip as object), // Type assertion to help spread
        title: (trip as any).name, // Access name, map to title
      })) || [];

    console.log(
      `[API /trips] Found ${trips.length} trips for user ${user.id}. Total memberships: ${tripIds.length}`
    );

    return NextResponse.json({
      trips: trips,
      totalCount: tripIds.length, // Total count is based on memberships
      limit: limit,
    });
  } catch (error) {
    console.error('[API /trips] Error fetching trips:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch trips',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Ensure the trip is associated with the current user using DB_FIELDS
    const createdById = user.id;

    // Prepare payload using DB_FIELDS and correct 'name' column
    const { title: tripTitle, ...restOfBody } = body; // Assume input uses 'title'
    const insertPayload = {
      ...restOfBody,
      [DB_FIELDS.TRIPS.NAME]: tripTitle, // Map input title to 'name' column
      [DB_FIELDS.TRIPS.CREATED_BY]: createdById,
    };

    const { data, error } = await supabase
      .from(DB_TABLES.TRIPS)
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

    // Also add the creator as a member with 'admin' role using DB_FIELDS
    const tripId = data[DB_FIELDS.TRIPS.ID];
    const { error: memberError } = await supabase.from(DB_TABLES.TRIP_MEMBERS).insert({
      [DB_FIELDS.TRIP_MEMBERS.TRIP_ID]: tripId,
      [DB_FIELDS.TRIP_MEMBERS.USER_ID]: user.id,
      [DB_FIELDS.TRIP_MEMBERS.ROLE]: TRIP_ROLES.ADMIN, // Use ADMIN role constant
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
