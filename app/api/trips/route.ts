import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { PostgrestError } from '@supabase/supabase-js';

// Constants
import { API_ROUTES } from '@/utils/constants/routes';
import { TRIP_ROLES } from '@/utils/constants/status';
import { TRIP_TABLES, GROUP_TABLES } from '@/utils/constants/tables';
import { GROUP_FIELDS } from '@/utils/constants/groups';
import { TABLE_NAMES } from '@/utils/constants/tables';

// Types
import type { Database } from '@/types/database.types';
import type { TripMembership, Trip, TripWithMemberInfo } from '@/types/trips';

// Utils
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { handleQueryResult } from '@/utils/type-safety';

// --------------------------------
// Types
// --------------------------------

// Define GetTripsResponse type locally since it's not available in the import
export interface GetTripsResponse {
  trips: Trip[];
}

// Trip with user role
interface TripWithUserRole extends Trip {
  userRole: string;
}

// Trips list response
interface TripsResponse {
  data: TripWithUserRole[];
}

// Error response
interface ErrorResponse {
  error: string;
  success: boolean;
}

// Type for city data in trip creation
interface CityData {
  city_id: string;
  arrival_date?: string | null;
  departure_date?: string | null;
}

// Define custom error types
type QueryError = {
  error: true;
} & string;

// Type for Supabase client returned by createRouteHandlerClient
type SupabaseClient = Awaited<ReturnType<typeof createRouteHandlerClient>>;

// --------------------------------
// Constants
// --------------------------------

// Table names that aren't in the imported constants
const CITY_TRIPS_TABLE = 'city_trips';
const GROUP_TRIPS_TABLE = 'group_trips';

const FIELDS = {
  TRIPS: {
    ID: 'id',
    NAME: 'name',
    TITLE: 'title',
    DESCRIPTION: 'description',
    CREATED_BY: 'created_by',
    GUEST_TOKEN: 'guest_token',
  },
  TRIP_MEMBERS: {
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
    ROLE: 'role',
  },
};

// In-memory rate limit store
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 5; // max 5 per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

// --------------------------------
// Helper Functions
// --------------------------------

/**
 * Create an error response with the given message and status code
 */
function createErrorResponse(message: string, status: number = 400): NextResponse {
  return NextResponse.json({ error: message, success: false }, { status });
}

/**
 * Check if a user is rate limited
 */
function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now - userLimit.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(userId, { count: 1, lastReset: now });
    return false;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return true;
  }

  userLimit.count += 1;
  return false;
}

/**
 * Get or create a guest token
 */
async function getOrCreateGuestToken(): Promise<string> {
  const cookieStore = await cookies();
  const guestTokenCookie = cookieStore.get('guest_token');
  let guestToken = guestTokenCookie?.value;

  if (!guestToken) {
    guestToken = crypto.randomUUID();
  }

  return guestToken;
}

// --------------------------------
// API Handlers
// --------------------------------

/**
 * GET /api/trips
 *
 * Returns all trips for the authenticated user.
 * This includes both trips created by the user
 * and trips they are a member of.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createRouteHandlerClient();
  const userId = request.headers.get('x-user-id');
  const includeShared = request.nextUrl.searchParams.get('includeShared') === 'true';
  const limit = Number(request.nextUrl.searchParams.get('limit')) || 10;
  const page = Number(request.nextUrl.searchParams.get('page')) || 1;
  const offset = (page - 1) * limit;

  try {
    if (!userId) {
      // Return only public trips for unauthenticated users
      const { data, error } = await supabase
        .from(TABLE_NAMES.TRIPS)
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching public trips:', error);
        return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
      }

      return NextResponse.json({ trips: data || [] });
    }

    // For authenticated users, return their trips
    let tripsQuery = supabase
      .from(TABLE_NAMES.TRIPS)
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (includeShared) {
      // If includeShared is true, also get trips where user is a member
      const { data: memberTrips, error: memberError } = await supabase
        .from(TABLE_NAMES.TRIP_MEMBERS)
        .select('trip_id')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (memberError) {
        console.error('Error fetching member trips:', memberError);
        return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
      }

      if (memberTrips && memberTrips.length > 0) {
        const tripIds = memberTrips.map((member) => member.trip_id);

        // Get both user's created trips and trips they're members of
        const { data: combinedTrips, error: tripsError } = await supabase
          .from(TABLE_NAMES.TRIPS)
          .select('*')
          .or(`created_by.eq.${userId},id.in.(${tripIds.join(',')})`)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (tripsError) {
          console.error('Error fetching combined trips:', tripsError);
          return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
        }

        return NextResponse.json({ trips: combinedTrips || [] });
      }
    }

    // If not including shared trips or no shared trips found
    const { data, error } = await tripsQuery.range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching user trips:', error);
      return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
    }

    return NextResponse.json({ trips: data || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * POST /api/trips - Create a new trip
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get the request body
    const body = await request.json();

    // Get the authenticated user
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Ensure user is authenticated
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create the trip
    const tripData = {
      name: body.name || 'New Trip',
      description: body.description || '',
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      created_by: user.id, // Ensure created_by is always set and not null
      // Add other fields as needed
    };

    const { data: newTrip, error: tripError } = await supabase
      .from(TABLE_NAMES.TRIPS)
      .insert(tripData)
      .select()
      .single();

    if (tripError) {
      console.error('Error creating trip:', tripError);
      return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
    }

    // Add the user as a member of the trip
    const memberData = {
      trip_id: newTrip.id,
      user_id: user.id,
      role: TRIP_ROLES.ADMIN, // Use the enum value instead of string literal
    };

    const { error: memberError } = await supabase.from(TABLE_NAMES.TRIP_MEMBERS).insert(memberData);

    if (memberError) {
      console.error('Error adding trip member:', memberError);
      // Non-fatal, we'll still return the trip
    }

    return NextResponse.json({ trip: newTrip });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * Add a primary city to a trip
 */
async function addPrimaryCity(
  db: SupabaseClient,
  tripId: string,
  cityId?: string | null
): Promise<void> {
  if (!cityId) return;

  // Add city to trip
  await db.from(CITY_TRIPS_TABLE as any).insert({
    trip_id: tripId,
    city_id: cityId,
    is_primary: true,
  });
}

/**
 * Add a member to a trip
 */
async function addTripMember(
  db: SupabaseClient,
  tripId: string,
  userId: string,
  role: string
): Promise<void> {
  if (!userId) return;

  await db.from(TRIP_TABLES.TRIP_MEMBERS).insert({
    trip_id: tripId,
    user_id: userId,
    role,
  } as any);
}

/**
 * Link a trip to a group
 */
async function linkTripToGroup(
  db: SupabaseClient,
  tripId: string,
  groupId: string,
  userId?: string | null,
  guestToken?: string | null
): Promise<void> {
  // Create trip-group relation
  await db.from(GROUP_TRIPS_TABLE as any).insert({
    trip_id: tripId,
    group_id: groupId,
    created_by: userId || null,
    guest_token: !userId && guestToken ? guestToken : null,
  } as any);
}

/**
 * Add cities to a trip
 */
async function addCitiesToTrip(
  db: SupabaseClient,
  tripId: string,
  cities: CityData[]
): Promise<void> {
  if (!cities.length) return;

  // Prepare city data
  const cityData = cities.map((city) => ({
    trip_id: tripId,
    city_id: city.city_id,
    is_primary: false,
    arrival_date: city.arrival_date || null,
    departure_date: city.departure_date || null,
  }));

  // Insert cities
  await db.from(CITY_TRIPS_TABLE as any).insert(cityData);
}
