import { type NextRequest, NextResponse } from 'next/server';
import { API_ROUTES } from '@/utils/constants/routes';
// Import database tables from the correct location
import { createApiRouteClient } from '@/utils/api-helpers/cookie-handlers';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TRIP_ROLES } from '@/utils/constants/status';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { TABLES as CORE_TABLES } from '@/utils/constants/database';
import { TABLES as MULTI_CITY_TABLES } from '@/utils/constants/database-multi-city';

// Combine the tables from both sources
const TABLES = {
  ...CORE_TABLES,
  ...MULTI_CITY_TABLES,
  GROUP_TRIPS: 'group_trips'
};

// Define table and field constants
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
      .from('trip_members')
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
      .from('trips')
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
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get user securely, but don't require a user (allows guest access)
    let user = null;
    let guestToken = null;
    
    try {
      // Try to get authenticated user
      const { data, error } = await supabase.auth.getUser();
      if (!error) {
        user = data.user;
      } else if (process.env.NODE_ENV === 'development') {
        console.log('No authenticated user, proceeding as guest: ', error);
      }
    } catch (err) {
      console.log('Error checking user auth, proceeding as guest: ', err);
    }

    // Get request body
    const body = await request.json();
    const { 
      name, 
      destination_id, 
      city_id = null,
      start_date, 
      end_date, 
      cities = [],
      website, // Honeypot field
      group_id = null, // Add group_id parameter
    } = body;
    
    // Honeypot check
    if (website && website.length > 0) {
      console.warn('[API] Honeypot triggered:', website);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Validate input
    if (!name) {
      return NextResponse.json({ error: "Trip name is required" }, { status: 400 });
    }

    // If group_id is provided, verify user is a member of the group
    if (group_id && user) {
      const { data: membership, error: membershipError } = await supabase
        .from(TABLES.GROUP_MEMBERS)
        .select('*')
        .eq('group_id', group_id)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (membershipError || !membership) {
        return NextResponse.json(
          { error: 'You are not a member of this group' },
          { status: 403 }
        );
      }
    }

    let tripId: string | null = null;
    let newTrip: any = null;
    
    // Create trip
    const trip = {
      name,
      destination_id: destination_id || null,
      city_id: city_id || destination_id || null, // Use city_id with fallback to destination_id
      start_date: start_date || null,
      end_date: end_date || null,
      created_by: user?.id || null,
    };
    
    // For guests, add guest token
    if (!user) {
      // Try to get guest token from cookies
      const cookieStore = await cookies();
      let guestToken = cookieStore.get('guest_token')?.value || null;
      
      // Generate new guest token if none exists
      if (!guestToken) {
        guestToken = crypto.randomUUID();
        cookieStore.set({
          name: 'guest_token',
          value: guestToken,
          path: '/',
          maxAge: 30 * 24 * 60 * 60, // 30 days
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
      }
      
      // Store guest token with the trip
      Object.assign(trip, { guest_token: guestToken });
    }
    
    // Insert trip into database
    const { data: tripData, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .insert(trip)
      .select()
      .single();
    
    if (tripError) {
      console.error('Error creating trip:', tripError);
      return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
    }
    
    newTrip = tripData;
    tripId = tripData.id;
    
    // If user is authenticated, add them as admin
    if (user) {
      // Add trip membership
      const { error: membershipError } = await supabase
        .from('trip_members')
        .insert({
          trip_id: tripId,
          user_id: user.id,
          role: TRIP_ROLES.ADMIN,
        });
      
      if (membershipError) {
        console.error('Error adding trip membership:', membershipError);
        // Continue even if membership creation fails
      }
    }

    // If group_id is provided, associate trip with group
    if (group_id && tripId) {
      const { error: groupTripError } = await supabase
        .from('group_trips')
        .insert({
          group_id,
          trip_id: tripId,
          created_by: user?.id || null,
          created_by_guest_token: guestToken
        });
      
      if (groupTripError) {
        console.error('Error associating trip with group:', groupTripError);
        // Continue even if group association fails
      }

      // If user is in the group, add all group members to the trip
      if (user) {
        // Get all group members
        const { data: groupMembers, error: membersError } = await supabase
          .from(TABLES.GROUP_MEMBERS)
          .select('user_id, role')
          .eq('group_id', group_id);

        if (!membersError && groupMembers && groupMembers.length > 0) {
          // Add each group member to the trip
          const tripMemberships = groupMembers
            .filter(member => member.user_id !== user.id) // Skip the creator who is already added
            .map(member => ({
              trip_id: tripId,
              user_id: member.user_id,
              role: member.role === 'admin' ? TRIP_ROLES.EDITOR : TRIP_ROLES.VIEWER
            }));

          if (tripMemberships.length > 0) {
            await supabase.from('trip_members').insert(tripMemberships);
          }
        }
      }
    }

    // If cities are provided, add them to the trip
    if (tripId && cities && cities.length > 0) {
      for (let i = 0; i < cities.length; i++) {
        const city = cities[i];
        
        // Create trip city
        const tripCity = {
          trip_id: tripId,
          city_id: city.city_id,
          position: i,
          arrival_date: city.arrival_date || null,
          departure_date: city.departure_date || null,
        };
        
        // Insert trip city
        const { error: cityError } = await supabase
          .from(TABLES.TRIP_CITIES)
          .insert(tripCity);
        
        if (cityError) {
          console.error("Error adding city to trip:", cityError);
          // Continue with other cities
        }
      }
    }
    
    // Return trip data
    return NextResponse.json({ trip: newTrip }, { status: 201 });
  } catch (error) {
    console.error("Error creating trip:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
