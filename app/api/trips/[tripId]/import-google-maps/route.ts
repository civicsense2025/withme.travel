import { NextResponse } from 'next/server';
import { createApiRouteClient } from '@/utils/api-helpers/cookie-handlers';
import { parseGoogleMapsList, convertToItineraryItems, type PlaceData } from '@/utils/googleMapsParser';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * API endpoint for importing Google Maps places to a trip
 */
export async function POST(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  const tripId = params.tripId;

  // Extract the Google Maps URL from the request body
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'Missing URL parameter' },
        { status: 400 }
      );
    }

    // Authenticate the user
    const supabase = await createApiRouteClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has access to this trip
    const { data: memberData, error: memberError } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', session.user.id)
      .single();

    if (memberError || !memberData) {
      return NextResponse.json(
        { success: false, error: 'No access to this trip' },
        { status: 403 }
      );
    }

    // Parse the Google Maps list
    const result = await parseGoogleMapsList(url);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to parse Google Maps list' },
        { status: 400 }
      );
    }

    // Process the places and add them to our database
    await processAndStorePlaces(supabase, result.places, session.user.id);

    // Convert places to itinerary items
    const itineraryItems = convertToItineraryItems(result.places, tripId);

    // Insert the itinerary items into the trip
    const { data: insertedItems, error: insertError } = await supabase
      .from('itinerary_items')
      .insert(itineraryItems)
      .select('id, title');

    if (insertError) {
      console.error('Error inserting itinerary items:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to import places to trip' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${insertedItems.length} places to trip`,
      items: insertedItems
    });
  } catch (error: any) {
    console.error('Error importing Google Maps places:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred while importing places'
      },
      { status: 500 }
    );
  }
}

/**
 * Process and store places in the database
 */
async function processAndStorePlaces(
  supabase: SupabaseClient,
  places: PlaceData[],
  userId: string
): Promise<void> {
  if (!places || places.length === 0) return;

  for (const place of places) {
    if (!place.placeId) continue;

    // Check if place already exists
    const { data: existingPlace } = await supabase
      .from('places')
      .select('id')
      .eq('source', 'google_maps')
      .eq('source_id', place.placeId)
      .single();

    if (existingPlace) continue; // Place already exists, skip insertion

    // Insert new place
    await supabase
      .from('places')
      .insert({
        name: place.title,
        description: place.description || null,
        category: mapCategoryFromGoogle(place.category || null),
        address: place.address,
        latitude: place.latitude || null,
        longitude: place.longitude || null,
        rating: place.rating || null,
        rating_count: place.reviews || null,
        source: 'google_maps',
        source_id: place.placeId,
        suggested_by: userId
      })
      .single();
  }
}

/**
 * Maps Google category strings to database place category enum
 */
function mapCategoryFromGoogle(category: string | null): string {
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