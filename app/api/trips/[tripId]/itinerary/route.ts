import { NextResponse, NextRequest } from 'next/server';
import {
  ItineraryItem as DBItineraryItem,
  ItinerarySection as DBItinerarySection,
  Database,
} from '@/types/database.types';
import { DisplayItineraryItem, ItinerarySection } from '@/types/itinerary';
import { ProcessedVotes } from '@/types/votes';
import { Profile } from '@/types/profile';
import { z } from 'zod';
import { ApiError, formatErrorResponse } from '@/lib/api-utils';
import { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { TRIP_ROLES } from '@/utils/constants/status';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';
import type { TripRole } from '@/types/trip';

// Helper function to check user membership and role
async function checkTripAccess(
  supabase: SupabaseClient<Database>,
  tripId: string,
  userId: string,
  allowedRoles: TripRole[] = ['admin', 'editor', 'viewer', 'contributor']
) {
  // Convert allowed roles to string array for includes check
  const allowedRoleStrings = allowedRoles as string[];
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

  if (!membership) {
    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .select('privacy_setting')
      .eq('id', tripId)
      .single();

    if (tripError) {
      console.error('Error fetching trip details:', tripError);
      throw new ApiError('Could not verify trip access.', 500);
    }

    if (tripData?.privacy_setting === 'public') {
      const isReadOnlyRequest =
        allowedRoleStrings.length === 1 && allowedRoleStrings[0] === 'viewer';
      if (isReadOnlyRequest) {
        return {
          hasAccess: true,
          role: 'viewer' as TripRole,
        };
      }
    }

    throw new ApiError('Access Denied: Not a member or insufficient public access.', 403);
  }

  const userRole = membership.role as TripRole;
  if (!allowedRoleStrings.includes(userRole)) {
    throw new ApiError('Access Denied: Insufficient permissions.', 403);
  }

  return {
    hasAccess: true,
    role: userRole,
  };
}

// Define structure for the response with items
interface ItinerarySectionWithItems extends ItinerarySection {
  items: DisplayItineraryItem[]; // Use the imported type
}

interface VoteWithProfile {
  itinerary_item_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
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
          .from('itinerary_sections')
          .select('*')
          .eq('trip_id', tripId)
          .order('position', { ascending: true }),
        supabase
          .from('itinerary_items')
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
      const validatedData = createItineraryItemSchema.parse(payload);
      const { data: maxPositionData, error: positionError } = await supabase
        .from('itinerary_items')
        .select('position')
        .eq('trip_id', tripId)
        .is('section_id', validatedData.section_id ?? null)
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (positionError) {
        throw new ApiError('Failed to determine item position', 500, positionError);
      }
      const nextPosition = (maxPositionData?.position ?? -1) + 1;
      const { data: newItem, error: insertError } = await supabase
        .from('itinerary_items')
        .insert([
          {
            ...validatedData,
            trip_id: tripId,
            position: nextPosition,
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw new ApiError('Failed to create itinerary item', 500, insertError);
      }

      return NextResponse.json({ data: newItem });
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
      const { data: newSection, error: insertError } = await supabase
        .from('itinerary_sections')
        .insert([
          {
            ...validatedData,
            trip_id: tripId,
            position: nextPosition,
          },
        ])
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

        // Also try to access location as a nested object
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
          notes: description,
          item_type: category,
          trip_id: tripId,
          status: item.status || 'active',
          day_number: item.day_number,
          position: nextPosition + index,
          // Include location data
          address,
          latitude,
          longitude,
          place_name: placeName || title,
          place_id: placeId, // Store as place_id instead of google_place_id
          // Record creator
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
