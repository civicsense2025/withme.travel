import { NextResponse } from 'next/server';
import { createApiRouteClient } from '@/utils/api-helpers/cookie-handlers';
import { parseGoogleMapsList, type PlaceData } from '@/utils/googleMapsParser';
import { TABLES } from '@/utils/constants/database';
import type { SupabaseClient } from '@supabase/supabase-js';

// Define place category type to match database enum
type PlaceCategory = 
  | 'restaurant' 
  | 'accommodation' 
  | 'attraction' 
  | 'transportation' 
  | 'outdoor' 
  | 'shopping' 
  | 'entertainment' 
  | 'other';

/**
 * API endpoint to parse a Google Maps list URL and return the places data
 */
export async function GET(request: Request) {
  // Get URL from query params
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  // Validate input
  if (!url) {
    return NextResponse.json(
      { success: false, error: 'Missing URL parameter' },
      { status: 400 }
    );
  }

  // Authenticate user
  try {
    const supabase = await createApiRouteClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse Google Maps list
    const result = await parseGoogleMapsList(url);
    
    if (!result.success) {
      // Forward parser error
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to parse Google Maps list' },
        { status: 400 }
      );
    }

    // Process places to check for existing ones and store new ones
    const processedPlaces = await processMapsPlaces(supabase, result.places, session.user.id);

    return NextResponse.json({
      success: true,
      listTitle: result.listTitle,
      places: processedPlaces
    });
  } catch (error: any) {
    console.error('Error parsing Google Maps list:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An unexpected error occurred while parsing the Google Maps list' 
      },
      { status: 500 }
    );
  }
}

/**
 * Process Google Maps places:
 * 1. Check if places exist in our database
 * 2. Store new places
 * 3. Return enriched place data
 */
async function processMapsPlaces(
  supabase: SupabaseClient,
  googlePlaces: PlaceData[],
  userId: string
): Promise<(PlaceData & { dbId?: string })[]> {
  // Skip if no places found
  if (!googlePlaces || googlePlaces.length === 0) {
    return [];
  }

  const processedPlaces: (PlaceData & { dbId?: string })[] = [];

  // Process each place
  for (const place of googlePlaces) {
    // Skip if no place ID (shouldn't happen, but just in case)
    if (!place.placeId) {
      processedPlaces.push(place);
      continue;
    }

    const placeId = place.placeId; // Guaranteed to be non-null at this point

    // Check if this place already exists in our database
    const { data: existingPlace, error } = await supabase
      .from('places')
      .select('*')
      .eq('source', 'google_maps')
      .eq('source_id', placeId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "row not found"
      console.error(`Error checking for existing place: ${error.message}`);
    }

    // If place exists, use that data but keep the original Google place data as well
    if (existingPlace) {
      // Merge the existing place data with the original Google place data
      // Keep original Google data for fields that might be more up to date
      processedPlaces.push({
        ...place,
        dbId: existingPlace.id,
        // Add any additional fields from the database that might be useful
      });
    } else {
      // Place doesn't exist, insert it
      const { data: newPlace, error: insertError } = await supabase
        .from('places')
        .insert({
          name: place.title,
          description: place.description || null,
          category: mapGoogleCategoryToDBCategory(place.category || null),
          address: place.address,
          latitude: place.latitude || null,
          longitude: place.longitude || null,
          rating: place.rating || null,
          rating_count: place.reviews || null,
          source: 'google_maps',
          source_id: placeId,
          suggested_by: userId
        })
        .select('*')
        .single();

      if (insertError) {
        console.error(`Error inserting new place: ${insertError.message}`);
        // Still add the original place to the results even if DB insert failed
        processedPlaces.push(place);
      } else {
        // Add the newly inserted place with its DB ID
        processedPlaces.push({
          ...place,
          dbId: newPlace.id
        });
      }
    }
  }

  return processedPlaces;
}

/**
 * Maps Google category strings to our database place_category enum values
 */
function mapGoogleCategoryToDBCategory(category: string | null): PlaceCategory {
  if (!category) return 'other';
  
  const lowerCategory = category.toLowerCase();
  
  if (lowerCategory.includes('restaurant') || 
      lowerCategory.includes('food') || 
      lowerCategory.includes('cafe') || 
      lowerCategory.includes('dining') ||
      lowerCategory.includes('bar')) {
    return 'restaurant';
  }
  
  if (lowerCategory.includes('hotel') || 
      lowerCategory.includes('lodging') || 
      lowerCategory.includes('accommodation')) {
    return 'accommodation';
  }
  
  if (lowerCategory.includes('museum') || 
      lowerCategory.includes('attraction') || 
      lowerCategory.includes('landmark') ||
      lowerCategory.includes('monument')) {
    return 'attraction';
  }
  
  if (lowerCategory.includes('airport') || 
      lowerCategory.includes('station') || 
      lowerCategory.includes('transit') ||
      lowerCategory.includes('transportation')) {
    return 'transportation';
  }
  
  if (lowerCategory.includes('park') ||
      lowerCategory.includes('beach') ||
      lowerCategory.includes('outdoors') ||
      lowerCategory.includes('nature')) {
    return 'outdoor';
  }
  
  if (lowerCategory.includes('shopping') ||
      lowerCategory.includes('store') ||
      lowerCategory.includes('mall')) {
    return 'shopping';
  }
  
  if (lowerCategory.includes('theater') ||
      lowerCategory.includes('cinema') ||
      lowerCategory.includes('entertainment') ||
      lowerCategory.includes('art')) {
    return 'entertainment';
  }
  
  return 'other';
} 