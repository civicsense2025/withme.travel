import { type NextRequest, NextResponse } from 'next/server';
import { API_ROUTES } from '@/utils/constants/routes';
// Import database tables from the correct location
import { createApiRouteClient } from '@/utils/api-helpers/cookie-handlers';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TRIP_ROLES } from '@/utils/constants/status';
import { cookies } from 'next/headers';
import crypto from 'crypto';

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
    GUEST_TOKEN: 'guest_token',
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
  guest_token: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

// In-memory rate limit store (MVP, resets on server restart)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 5; // max 5 per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

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
  console.log('[API] Processing trip creation request');

  try {
    const body = await request.json();
    const { title: tripTitle, ...restOfBody } = body;

    // Honeypot check if present in the form
    if (restOfBody.website && restOfBody.website.length > 0) {
      console.warn('[API] Honeypot triggered');
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (!tripTitle) {
      console.warn('[API] Missing trip title');
      return NextResponse.json({ error: 'Trip title is required' }, { status: 400 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Handle both authenticated and guest users
    let createdById = null;
    let guestToken = null;
    let ip = null;

    if (user) {
      // Authenticated user case
      console.log('[API] Creating trip for authenticated user:', user.id);
      createdById = user.id;
    } else {
      // Guest user case
      console.log('[API] Creating trip for guest user');
      const cookieStore = await cookies();
      guestToken = cookieStore.get('guest_trip_token')?.value || null;
      ip = (request.headers.get('x-forwarded-for') || '').split(',')[0] || request.headers.get('x-real-ip') || null;
      console.log('[API] Guest trip creation attempt:', { guestToken, ip });

      // Rate limiting for guests
      if (ip) {
        const now = Date.now();
        const rl = rateLimitMap.get(ip) || { count: 0, lastReset: now };
        if (now - rl.lastReset > RATE_LIMIT_WINDOW) {
          rl.count = 0;
          rl.lastReset = now;
        }
        rl.count++;
        rateLimitMap.set(ip, rl);
        if (rl.count > RATE_LIMIT) {
          return NextResponse.json({ error: 'Too many trip creations from this IP. Please try again later.' }, { status: 429 });
        }
      }

      if (!guestToken) {
        // Generate a new guest token
        guestToken = crypto.randomUUID();
      }
    }

    // Prepare payload using FIELDS
    const insertPayload = {
      ...restOfBody,
      [FIELDS.TRIPS.NAME]: tripTitle,
      [FIELDS.TRIPS.CREATED_BY]: createdById,
      [FIELDS.TRIPS.GUEST_TOKEN]: guestToken,
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

    // If authenticated, add the creator as a member
    if (user) {
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
    }

    // Set a cookie with the guest token if this is a guest user
    const response = NextResponse.json({ trip: data });
    if (guestToken && !user) {
      response.cookies.set('guest_trip_token', guestToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Error creating trip:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create trip';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
