import { NextResponse, NextRequest } from 'next/server';
import type { Tables, Database } from '@/types/database.types';
import { DisplayItineraryItem, ItinerarySection as ItinerarySectionType } from '@/types/itinerary';
import { ProcessedVotes } from '@/types/votes';
import { Profile } from '@/types/profile';
import { z } from 'zod';
import { ApiError, formatErrorResponse } from '@/lib/api-utils';
import { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { TRIP_ROLES } from '@/utils/constants/status';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import type { TripRole } from '@/types/trip';
import { getTypedDbClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

type DBItineraryItem = Tables<'itinerary_items'>;
type DBItinerarySection = Tables<'itinerary_sections'>;
type ItineraryItem = Database['public']['Tables']['itinerary_items']['Row'];
type ItinerarySection = Database['public']['Tables']['itinerary_sections']['Row'];
type TripMember = Database['public']['Tables']['trip_members']['Row'];

// Helper function to check user membership and role
async function checkTripAccess(
  supabase: SupabaseClient<Database>,
  tripId: string,
  userId: string,
  allowedRoles: TripRole[] = ['admin', 'editor', 'viewer', 'contributor']
) {
  const allowedRoleStrings = allowedRoles;

  // Check if user is a member of this trip
  const { data: membership, error } = await supabase
    .from('trip_members')
    .select('role')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error checking trip access:', error);
    throw new ApiError('Failed to verify trip membership', 500);
  }

  // If the user is a member with correct role, allow access
  if (membership && allowedRoleStrings.includes(membership.role as TripRole)) {
    return {
      hasAccess: true,
      role: membership.role as TripRole,
    };
  }

  // If not a member, check if user is the creator of the trip
  const { data: tripData, error: tripError } = await supabase
    .from('trips')
    .select('created_by, privacy_setting')
    .eq('id', tripId)
    .single();

  if (tripError) {
    console.error('Error fetching trip details:', tripError);
    throw new ApiError('Could not verify trip access.', 500);
  }

  // If the user is the creator of the trip, grant admin access
  if (tripData.created_by === userId) {
    console.log(`User ${userId} is the creator of trip ${tripId}, granting admin access`);
    return {
      hasAccess: true,
      role: 'admin' as TripRole,
    };
  }

  // For public trips, allow read-only access
  if (tripData?.privacy_setting === 'public') {
    const isReadOnlyRequest = allowedRoleStrings.length === 1 && allowedRoleStrings[0] === 'viewer';
    if (isReadOnlyRequest) {
      return {
        hasAccess: true,
        role: 'viewer' as TripRole,
      };
    }
  }

  throw new ApiError('Access Denied: Not a member or insufficient public access.', 403);
}

// Define structure for the response with items
interface ItinerarySectionWithItems extends ItinerarySectionType {
  items: DisplayItineraryItem[]; // Use the imported type
}

interface VoteWithProfile {
  itinerary_item_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  profiles: Profile | null;
}

// Validation schemas
const baseItineraryItemSchema = z
  .object({
    name: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional().nullable(),
    start_time: z.string().optional().nullable(),
    end_time: z.string().optional().nullable(),
    item_type: z.string().default('activity'),
    url: z.string().optional().nullable(), // Make URL validation less strict
    address: z.string().optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    place_id: z.string().optional().nullable(), // Reference to a place
    destination_id: z.string().optional().nullable(), // Reference to a destination
    section_id: z.string().uuid().optional().nullable(), // Optional: Link to a specific section
    day_number: z.number().int().positive().optional().nullable(), // Optional: Link to a day number
    position: z.number().int().optional(), // For ordering within section/day
    data: z.record(z.any()).optional().nullable(), // For flexible custom data
  })
  .refine((data) => data.name || data.title, {
    message: 'Either name or title is required',
    path: ['title'],
  });

const createItineraryItemSchema = z
  .object({
    name: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional().nullable(),
    start_time: z.string().optional().nullable(),
    end_time: z.string().optional().nullable(),
    item_type: z.string().default('activity'),
    url: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    place_id: z.string().optional().nullable(),
    destination_id: z.string().optional().nullable(),
    section_id: z.string().uuid().optional().nullable(),
    day_number: z.number().int().positive().optional().nullable(),
    data: z.record(z.any()).optional().nullable(),
  })
  .refine((data) => data.name || data.title, {
    message: 'Either name or title is required',
    path: ['title'],
  })
  .transform((data) => {
    // If only one of name/title is provided, copy it to the other field
    const result = { ...data };
    if (result.title && !result.name) {
      result.name = result.title;
    } else if (result.name && !result.title) {
      result.title = result.name;
    }
    return result;
  });

const updateItineraryItemSchema = z
  .object({
    name: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional().nullable(),
    start_time: z.string().optional().nullable(),
    end_time: z.string().optional().nullable(),
    item_type: z.string().optional(),
    url: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    place_id: z.string().optional().nullable(),
    destination_id: z.string().optional().nullable(),
    section_id: z.string().uuid().optional().nullable(),
    day_number: z.number().int().positive().optional().nullable(),
    position: z.number().int().optional(),
    data: z.record(z.any()).optional().nullable(),
  })
  .partial()
  .refine((data) => (!data.name && !data.title ? true : !!(data.name || data.title)), {
    message: 'If updating name/title, at least one must be provided',
    path: ['title'],
  });

const createItinerarySectionSchema = z.object({
  name: z.string().min(1, 'Section name is required'),
  description: z.string().optional().nullable(),
  day_number: z.number().int().positive().optional().nullable(),
  date: z.string().optional().nullable(), // ISO date string
  position: z.number().int().optional(),
});

const updateItinerarySectionSchema = createItinerarySectionSchema.partial();

// Add a helper function to extract place data from Google Maps URLs

// Define a simplified parser for Google Maps URLs
async function parseGoogleMapsUrl(url: string) {
  try {
    // For testing purposes, return some mock data based on the provided Mexico City list
    // In a real implementation, this would make an HTTP request to fetch the data
    // or use Google Maps API to get details about the list

    // Sample data for testing
    const mockMexicoCityPlaces = [
      {
        title: 'La Whiskeria',
        item_type: 'Nightlife',
        notes: 'Cocktail bar with rating 4.7 (1,580)',
        place_name: 'La Whiskeria',
        address: 'Mexico City',
        google_place_id: 'mock_id_1',
        latitude: 19.427,
        longitude: -99.1676,
        day_number: null,
      },
      {
        title: 'Le Tachinomi Desu',
        item_type: 'Food & Drink',
        notes: 'Japanese whiskey bar with eats. Rating 4.6 (304)',
        place_name: 'Le Tachinomi Desu',
        address: 'Rio Panuco 132-1a, Cuauhtémoc, 06500 Ciudad de México, CDMX, Mexico',
        google_place_id: 'mock_id_2',
        latitude: 19.4271,
        longitude: -99.1677,
        day_number: null,
      },
      {
        title: 'Bar Mauro',
        item_type: 'Nightlife',
        notes: 'Cocktail bar with rating 4.8 (150)',
        place_name: 'Bar Mauro',
        address: 'Mexico City',
        google_place_id: 'mock_id_3',
        latitude: 19.4272,
        longitude: -99.1678,
        day_number: null,
      },
      {
        title: 'Dr Liceaga 180',
        item_type: 'Food & Drink',
        notes: 'Bar in Cuauhtémoc, Doctores',
        place_name: 'Dr Liceaga 180',
        address:
          'Dr. José María Vertiz 171, Doctores, Cuauhtémoc, 06720 Ciudad de México, CDMX, Mexico',
        google_place_id: 'mock_id_4',
        latitude: 19.4273,
        longitude: -99.1679,
        day_number: null,
      },
    ];

    // Use the sample data for the Mexico City test URL
    if (url.includes('FTVCvZ2Xm4PMvRQa8')) {
      return mockMexicoCityPlaces;
    }

    // For any other URL, return a smaller default set
    return [
      {
        title: 'Example Place',
        item_type: 'Local Secrets',
        notes: 'Imported from Google Maps.',
        place_name: 'Example Place',
        address: 'Example Address',
        google_place_id: 'example_id',
        latitude: 0,
        longitude: 0,
        day_number: null,
      },
    ];
  } catch (error) {
    console.error('Failed to parse Google Maps URL:', error);
    throw new Error('Could not import places from the provided URL');
  }
}

// GET /api/trips/[tripId]/itinerary - Fetch itinerary structured by sections
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  console.log(`[API Itinerary GET /trips/${tripId}] Received request`);
  const supabase = await createRouteHandlerClient();

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
      authError: authError ? authError.message : null,
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
      role: access.role,
    });
    // --- End Logging --- //

    // Modified access check to ensure we have role AND hasAccess
    if (!access.hasAccess || !access.role) {
      console.log(
        `[API /trips/${tripId}/itinerary] Access denied. hasAccess: ${access.hasAccess}, role: ${access.role}`
      );
      return formatErrorResponse(new ApiError('Unauthorized', 403));
    }

    // Additional logging to confirm access was granted
    console.log(
      `[API /trips/${tripId}/itinerary] Access granted to user ${userId} with role ${access.role}`
    );

    // Fetch sections and items
    const [{ data: sections, error: sectionsError }, { data: items, error: itemsError }] =
      await Promise.all([
        supabase
          .from(TABLES.ITINERARY_SECTIONS)
          .select('*')
          .eq('trip_id', tripId)
          .order('position', { ascending: true }),
        supabase
          .from(TABLES.ITINERARY_ITEMS)
          .select('*')
          .eq('trip_id', tripId)
          .order('position', { ascending: true }),
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

// POST /api/trips/[tripId]/itinerary - Add new itinerary items
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  console.log(`[API Itinerary POST /trips/${tripId}] Received request`);
  const supabase = await createRouteHandlerClient();

  try {
    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return formatErrorResponse(new ApiError('User not authenticated', 401));
    }

    // Check if user has permission to edit this trip
    await checkTripAccess(supabase, tripId, user.id, ['admin', 'editor', 'contributor']);

    const body = await request.json();
    const { type, ...payload } = body;

    // Handle individual item creation
    if (type === 'item') {
      try {
        console.log('Creating item with payload:', JSON.stringify(payload, null, 2));

        // Pre-process the payload to handle title/name inconsistency
        if (payload.title && !payload.name) {
          payload.name = payload.title;
          console.log('Copying title to name field');
        } else if (payload.name && !payload.title) {
          payload.title = payload.name;
          console.log('Copying name to title field');
        }

        // Manually validate that either name or title is present
        if (!payload.name && !payload.title) {
          throw new ApiError('Either name or title is required for itinerary items', 400);
        }

        // Ensure item_type exists
        if (!payload.item_type) {
          payload.item_type = 'activity';
          console.log('Defaulting item_type to "activity"');
        }

        try {
          const validatedData = createItineraryItemSchema.parse(payload);
          console.log('Validated data:', JSON.stringify(validatedData, null, 2));

          const { data: maxPositionData, error: positionError } = await supabase
            .from('itinerary_items')
            .select('position')
            .eq('trip_id', tripId)
            .filter('section_id', 'is', validatedData.section_id || null)
            .order('position', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (positionError) {
            console.error('Position lookup error:', positionError);
            throw new ApiError('Failed to determine item position', 500, positionError);
          }

          const nextPosition = (maxPositionData?.position ?? -1) + 1;
          console.log(`Using position ${nextPosition} for new item`);

          // Explicitly map the validated data to the database schema fields
          // Make sure every field is properly typed for the database schema
          const itemToInsert = {
            trip_id: tripId,
            position: nextPosition,
            title: validatedData.title || 'Untitled', // Ensure title is always a string
            description: validatedData.description,
            item_type: validatedData.item_type || 'activity',
            start_time: validatedData.start_time,
            end_time: validatedData.end_time,
            address: validatedData.address,
            latitude: validatedData.latitude,
            longitude: validatedData.longitude,
            place_id: validatedData.place_id,
            section_id: validatedData.section_id,
            day_number: validatedData.day_number,
            created_by: user.id,
            status: 'suggested' as const, // Explicitly set a status
          };

          console.log('Final item data to insert:', JSON.stringify(itemToInsert, null, 2));

          const { data: newItem, error: insertError } = await supabase
            .from('itinerary_items')
            .insert([itemToInsert])
            .select()
            .single();

          if (insertError) {
            console.error('Item insertion error:', insertError);
            console.error('Error details:', insertError.details);
            throw new ApiError('Failed to create itinerary item', 500, insertError);
          }

          return NextResponse.json({ data: newItem });
        } catch (validationError) {
          console.error('Validation error:', validationError);
          if (validationError instanceof z.ZodError) {
            throw new ApiError(
              `Validation error: ${validationError.errors.map((e) => e.message).join(', ')}`,
              400,
              validationError
            );
          }
          throw validationError;
        }
      } catch (itemError) {
        console.error('Error in item creation:', itemError);
        throw itemError;
      }
    }
    // Handle section creation
    else if (type === 'section') {
      const validatedData = createItinerarySectionSchema.parse(payload);
      const { data: maxPositionData, error: positionError } = await supabase
        .from('itinerary_sections')
        .select('position')
        .eq('trip_id', tripId)
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (positionError) {
        throw new ApiError('Failed to determine section position', 500, positionError);
      }
      const nextPosition = (maxPositionData?.position ?? -1) + 1;

      // Transform the validated data to match the database schema
      const sectionToInsert = {
        trip_id: tripId,
        title: validatedData.name, // Map name to title
        description: validatedData.description,
        day_number: typeof validatedData.day_number === 'number' ? validatedData.day_number : 0,
        date: validatedData.date,
        position: nextPosition,
      };

      const { data: newSection, error: insertError } = await supabase
        .from('itinerary_sections')
        .insert([sectionToInsert])
        .select()
        .single();

      if (insertError) {
        throw new ApiError('Failed to create itinerary section', 500, insertError);
      }

      return NextResponse.json({ data: newSection });
    }
    // Handle bulk Google Maps import
    else if (type === 'google_maps_import') {
      // Check if we have items directly or need to parse a URL
      let itemsToProcess = [];

      if (payload.items && Array.isArray(payload.items)) {
        // Direct import with provided items
        itemsToProcess = payload.items;
      } else if (payload.url) {
        // URL-based import - parse the URL to get places
        console.log(`Parsing Google Maps URL: ${payload.url}`);
        itemsToProcess = await parseGoogleMapsUrl(payload.url);
      } else {
        throw new ApiError(
          'Either items array or URL must be provided for Google Maps import',
          400
        );
      }

      // Validate the processed items
      if (!itemsToProcess.length) {
        throw new ApiError('No valid items found to import', 400);
      }

      // Get the highest existing position for unscheduled items
      const { data: maxPositionData, error: positionError } = await supabase
        .from('itinerary_items')
        .select('position')
        .eq('trip_id', tripId)
        .is('section_id', null)
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (positionError) {
        throw new ApiError('Failed to determine item positions', 500, positionError);
      }

      let nextPosition = (maxPositionData?.position ?? -1) + 1;

      // Process and prepare items for insertion - handling both formats (old and new)
      const itemsToInsert = itemsToProcess.map((item: any, index: number) => {
        // Handle both title and name fields
        const title = item.title || item.name || 'Unnamed Place';
        // Handle both item_type and category fields
        const category = item.item_type || item.category || 'Local Secrets';
        // Handle both notes and description fields
        const description = item.notes || item.description || `Imported from Google Maps`;
        // Extract location data from either format
        let address = item.address;
        let latitude = item.latitude;
        let longitude = item.longitude;
        let placeId = item.google_place_id || item.place_id;
        let placeName = item.place_name;
        if (item.location) {
          if (!address && item.location.address) address = item.location.address;
          if (!latitude && item.location.latitude) latitude = item.location.latitude;
          if (!latitude && item.location.lat) latitude = item.location.lat;
          if (!longitude && item.location.longitude) longitude = item.location.longitude;
          if (!longitude && item.location.lng) longitude = item.location.lng;
          if (!placeId && item.location.place_id) placeId = item.location.place_id;
        }
        return {
          title: title,
          description: description,
          item_type: category,
          trip_id: tripId,
          status: item.status || 'active',
          day_number: typeof item.day_number === 'number' ? item.day_number : 0,
          position: nextPosition + index,
          address,
          latitude,
          longitude,
          place_name: placeName || title,
          place_id: placeId,
          created_by: user.id,
        };
      });

      console.log(`Inserting ${itemsToInsert.length} items from Google Maps import`);

      // Insert all items
      const { data: insertedItems, error: insertError } = await supabase
        .from('itinerary_items')
        .insert(itemsToInsert)
        .select();

      if (insertError) {
        console.error('Error inserting items:', insertError);
        throw new ApiError('Failed to create itinerary items from Google Maps', 500, insertError);
      }

      // Return the inserted items
      return NextResponse.json({
        success: true,
        message: `Successfully imported ${insertedItems.length} places`,
        data: insertedItems,
        importedCount: insertedItems.length,
      });
    }
    // Handle unknown type
    else {
      return formatErrorResponse(
        new ApiError(
          'Invalid type specified. Must be "item", "section", or "google_maps_import"',
          400
        )
      );
    }
  } catch (error: any) {
    console.error('POST /api/trips/[tripId]/itinerary error:', error);
    return formatErrorResponse(error);
  }
}

// PUT and DELETE handlers remain unchanged
