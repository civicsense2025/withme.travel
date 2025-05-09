import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/route-handler-client';
import { convertToItineraryItems, parseGoogleMapsList } from '@/utils/googleMapsParser';
import { TABLES } from '@/utils/constants/database';

/**
 * API endpoint to import places from Google Maps to a trip
 * @param request The incoming request
 * @param param1 Request parameters (tripId)
 * @returns JSON response with added itinerary items
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  const supabase = createRouteHandlerClient();
  const { tripId } = params;

  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has access to this trip
    const { data: memberData, error: memberError } = await supabase
      .from(TABLES.MEMBERS)
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (memberError || !memberData) {
      return NextResponse.json(
        { success: false, error: 'You do not have access to this trip' },
        { status: 403 }
      );
    }

    // Get the request body
    const requestBody = await request.json();
    const { places } = requestBody;
    
    if (!places || !Array.isArray(places)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: places array is required' },
        { status: 400 }
      );
    }

    // Convert places to itinerary items
    const itineraryItems = convertToItineraryItems(places, tripId);

    // Insert items into database
    const { data: insertedItems, error: insertError } = await supabase
      .from(TABLES.ITINERARY_ITEMS)
      .insert(itineraryItems)
      .select();

    if (insertError) {
      console.error('Error inserting itinerary items:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to add places to trip' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Successfully added ${insertedItems.length} places to trip`,
        items: insertedItems
      }
    });

  } catch (error) {
    console.error('Error importing Google Maps places:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to import places' 
      },
      { status: 500 }
    );
  }
} 