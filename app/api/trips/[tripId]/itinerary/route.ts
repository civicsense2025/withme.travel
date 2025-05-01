import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Use ssr client
import { cookies } from 'next/headers';
import { NextResponse, NextRequest } from 'next/server';
import { ItineraryItem as DBItineraryItem, ItinerarySection as DBItinerarySection } from '@/types/database.types';
import { DisplayItineraryItem, ItinerarySection } from '@/types/itinerary';
import { ProcessedVotes } from '@/types/votes';
import { Profile } from '@/types/profile';
import { z } from 'zod';
import { ApiError, formatErrorResponse } from '@/lib/api-utils';
import { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { TABLES, FIELDS, ENUMS } from '@/utils/constants/database';
import type { Database, TripRole } from '@/types/database.types';

// Define TripRole based on ENUMS if not imported
// type TripRole = (typeof ENUMS.TRIP_ROLES)[keyof typeof ENUMS.TRIP_ROLES];

// Helper function to create Supabase client for Route Handlers
async function createRouteHandlerClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.warn(`Failed to set cookie ${name}:`, error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            console.warn(`Failed to remove cookie ${name}:`, error);
          }
        },
      },
    }
  );
}

// Helper function to check user membership and role
async function checkTripAccess(
  supabase: SupabaseClient<Database>,
  tripId: string,
  userId: string,
  // Use the imported or defined TripRole type
  allowedRoles: TripRole[] = ['admin', 'editor', 'viewer', 'contributor'] 
) {
  const { data: membership, error } = await supabase
    .from(TABLES.TRIP_MEMBERS)
    .select('role')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error checking trip access:', error);
    throw new ApiError('Failed to verify trip membership', 500);
  }

  if (!membership) {
    const { data: tripData, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select('privacy_setting')
      .eq('id', tripId)
      .single();

    if (tripError) {
      console.error('Error fetching trip details:', tripError);
      throw new ApiError('Could not verify trip access.', 500);
    }

    if (tripData?.privacy_setting === ENUMS.TRIP_PRIVACY_SETTING.PUBLIC) {
      // Use ENUMS for comparison
      const isReadOnlyRequest = allowedRoles.length === 1 && allowedRoles[0] === ENUMS.TRIP_ROLES.VIEWER;
      if (isReadOnlyRequest) {
        // Include hasAccess: true
        return { 
          hasAccess: true,
          role: ENUMS.TRIP_ROLES.VIEWER as TripRole 
        }; 
      }
    }

    throw new ApiError('Access Denied: Not a member or insufficient public access.', 403);
  }

  const userRole = membership.role as TripRole;
  if (!allowedRoles.includes(userRole)) {
    throw new ApiError('Access Denied: Insufficient permissions.', 403);
  }

  // Include hasAccess: true
  return { 
    hasAccess: true,
    role: userRole 
  };
}

// Define structure for the response
// Define structure for the response with items
interface ItinerarySectionWithItems extends ItinerarySection {
  items: DisplayItineraryItem[]; // Use the imported type
}

interface VoteWithProfile {
  itinerary_item_id: string;
  user_id: string;
  vote_type: 'up' | 'down'; // ALIGNED WITH DB
  profiles: Profile | null;
}

// Validation schemas
const baseItineraryItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  item_type: z.string().default('activity'),
  url: z.string().url().optional().nullable(),
  address: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  place_id: z.string().optional().nullable(), // Reference to a place
  destination_id: z.string().uuid().optional().nullable(), // Reference to a destination
  section_id: z.string().uuid().optional().nullable(), // Optional: Link to a specific section
  day_number: z.number().int().positive().optional().nullable(), // Optional: Link to a day number
  position: z.number().int().optional(), // For ordering within section/day
  data: z.record(z.any()).optional().nullable(), // For flexible custom data
});

const createItineraryItemSchema = baseItineraryItemSchema.omit({ position: true }); // Position is handled separately
const updateItineraryItemSchema = baseItineraryItemSchema.partial(); // All fields optional for update

const createItinerarySectionSchema = z.object({
  name: z.string().min(1, 'Section name is required'),
  description: z.string().optional().nullable(),
  day_number: z.number().int().positive().optional().nullable(),
  date: z.string().optional().nullable(), // ISO date string
  position: z.number().int().optional(),
});

const updateItinerarySectionSchema = createItinerarySectionSchema.partial();

// GET /api/trips/[tripId]/itinerary - Fetch itinerary structured by sections
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const supabase = await createRouteHandlerClient();
  const { tripId } = await params;
  console.log(`[API /trips/${tripId}/itinerary] GET handler started`); // Log start

  try {
    // UUID validation
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!tripId || !UUID_REGEX.test(tripId)) {
      return formatErrorResponse(new ApiError('Invalid trip ID format', 400));
    }

    // Get authenticated user
    const { data: userData, error: authError } = await supabase.auth.getUser();

    // --- Logging Auth --- //
    console.log(`[API /trips/${tripId}/itinerary] Auth Check Result:`, { 
      userId: userData?.user?.id, 
      authError: authError ? authError.message : null 
    });
    // --- End Logging --- //

    if (authError || !userData?.user) {
      console.log(`[API /trips/${tripId}/itinerary] Authentication failed or no user found.`);
      return formatErrorResponse(new ApiError('Unauthorized', 401));
    }

    const userId = userData.user.id;

    // Check access - Any member role is sufficient for viewing itinerary
    const access = await checkTripAccess(supabase, tripId, userId);

    // --- Logging Access --- //
    console.log(`[API /trips/${tripId}/itinerary] Access Check Result:`, { 
      userId,
      hasAccess: access.hasAccess,
      role: access.role
    });
    // --- End Logging --- //

    // Modified access check to ensure we have role AND hasAccess
    if (!access.hasAccess || !access.role) {
      console.log(`[API /trips/${tripId}/itinerary] Access denied. hasAccess: ${access.hasAccess}, role: ${access.role}`);
      return formatErrorResponse(new ApiError('Unauthorized', 403));
    }

    // Additional logging to confirm access was granted
    console.log(`[API /trips/${tripId}/itinerary] Access granted to user ${userId} with role ${access.role}`);

    // Fetch sections and items (using correct TABLES constants)
    const [{ data: sections, error: sectionsError }, { data: items, error: itemsError }] = await Promise.all([
      supabase
        .from(TABLES.ITINERARY_SECTIONS)
        .select('*')
        .eq('trip_id', tripId)
        .order('position', { ascending: true }),
      supabase
        .from(TABLES.ITINERARY_ITEMS)
        .select('*')
        .eq('trip_id', tripId)
        .order('position', { ascending: true })
    ]);

    if (sectionsError || itemsError) {
      console.error('Error fetching itinerary data:', { sectionsError, itemsError });
      return formatErrorResponse(new ApiError('Failed to fetch itinerary data', 500));
    }

    return NextResponse.json({
      data: {
        sections: sections || [],
        items: items || [],
      },
    });
  } catch (error: any) {
    console.error('GET /api/trips/[tripId]/itinerary error:', error);
    return formatErrorResponse(error);
  }
}

// POST /api/trips/[tripId]/itinerary - Add a new itinerary item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const supabase = await createRouteHandlerClient();
  const { tripId } = await params;

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return formatErrorResponse(new ApiError('User not authenticated', 401));
    }

    await checkTripAccess(supabase, tripId, user.id, ['admin', 'editor', 'contributor']);

    const body = await request.json();
    const { type, ...payload } = body;

    if (type === 'item') {
      const validatedData = createItineraryItemSchema.parse(payload);

      const { data: maxPositionData, error: positionError } = await supabase
        .from(TABLES.ITINERARY_ITEMS)
        .select('position') // Use FIELDS.ITINERARY_ITEMS.POSITION
        .eq('trip_id', tripId) // Use FIELDS.ITINERARY_ITEMS.TRIP_ID
        .is('section_id', validatedData.section_id ?? null) // Use is for null check
        .order('position', { ascending: false }) // Use FIELDS.ITINERARY_ITEMS.POSITION
        .limit(1)
        .maybeSingle();

      if (positionError) {
        throw new ApiError('Failed to determine item position', 500, positionError);
      }
      const nextPosition = (maxPositionData?.position ?? -1) + 1;

      const { data: newItem, error: insertError } = await supabase
        .from(TABLES.ITINERARY_ITEMS)
        .insert([{ ...validatedData, trip_id: tripId, created_by: user.id, position: nextPosition }])
        .select('*')
        .single();

      if (insertError) {
        throw new ApiError('Failed to create itinerary item', 500, insertError);
      }
      revalidatePath(`/trips/${tripId}`);
      return NextResponse.json({ data: newItem }, { status: 201 });

    } else if (type === 'section') {
       // ... (Keep section logic similar, update constants)
       const validatedData = createItinerarySectionSchema.parse(payload);

      const { data: maxPositionData, error: positionError } = await supabase
        .from(TABLES.ITINERARY_SECTIONS)
        .select('position') // Use FIELDS.ITINERARY_SECTIONS.POSITION
        .eq('trip_id', tripId) // Use FIELDS.ITINERARY_SECTIONS.TRIP_ID
        .order('position', { ascending: false }) // Use FIELDS.ITINERARY_SECTIONS.POSITION
        .limit(1)
        .maybeSingle();

      if (positionError) {
        throw new ApiError('Failed to determine section position', 500, positionError);
      }
      const nextPosition = (maxPositionData?.position ?? -1) + 1;

      const { data: newSection, error: insertError } = await supabase
        .from(TABLES.ITINERARY_SECTIONS)
        .insert([{ ...validatedData, trip_id: tripId, position: nextPosition }])
        .select('*')
        .single();

       if (insertError) {
        throw new ApiError('Failed to create itinerary section', 500, insertError);
      }
      revalidatePath(`/trips/${tripId}`);
      return NextResponse.json({ data: newSection }, { status: 201 });
    } else {
      return formatErrorResponse(new ApiError('Invalid type specified', 400));
    }
  } catch (error: any) {
    console.error('POST /api/trips/[tripId]/itinerary error:', error);
    return formatErrorResponse(error);
  }
}

// ... PUT handler may also need updating if it exists and uses props.params ...
// Assuming PUT handler follows similar pattern:
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  // Use await with promised params as required by Next.js 15
  const { tripId, itemId } = await params;
  // ... implementation needed ...
  return NextResponse.json({ error: 'PUT not implemented for new structure' }, { status: 501 });
}

// DELETE /api/trips/[tripId]/itinerary/[itemId] - Delete an itinerary item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  try {
    const paramsResolved = await params;
    const { tripId, itemId } = paramsResolved;

    if (!tripId || !itemId) {
      return NextResponse.json({ error: 'Trip ID and Item ID are required' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Check user's access to the trip
    await checkTripAccess(supabase, tripId, user.id);

    // Delete the item
    const { error: deleteError } = await supabase
      .from(TABLES.ITINERARY_ITEMS)
      .delete()
      .eq('id', itemId)
      .eq('trip_id', tripId);

    if (deleteError) {
      console.error('Error deleting item:', deleteError);
      throw new ApiError('Failed to delete itinerary item', 500);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete handler:', error);
    return NextResponse.json(formatErrorResponse('Internal server error'), { status: 500 });
  }
}
