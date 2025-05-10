import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/database-multi-city';

/**
 * GET handler to retrieve all cities for a trip
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const { tripId } = await params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are not set');
    }
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, { cookies: cookieStore });

    // Check if user has access to the trip
    const { data: isMember, error: memberError } = await supabase.rpc(
      'is_trip_member',
      { p_trip_id: tripId }
    );

    if (memberError) {
      console.error('Error checking trip membership:', memberError);
      return NextResponse.json(
        { error: 'Failed to verify trip access' },
        { status: 500 }
      );
    }

    // Get trip privacy setting if not a member
    if (!isMember) {
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('privacy_setting')
        .eq('id', tripId)
        .single();

      if (tripError) {
        return NextResponse.json(
          { error: 'Trip not found' },
          { status: 404 }
        );
      }

      if (trip.privacy_setting !== 'public' && trip.privacy_setting !== 'shared_with_link') {
        return NextResponse.json(
          { error: 'Not authorized to access this trip' },
          { status: 403 }
        );
      }
    }

    // Get cities for the trip with city data
    const { data: tripCities, error: citiesError } = await supabase
      .from(TABLES.TRIP_CITIES)
      .select(`
        id,
        trip_id,
        city_id,
        position,
        arrival_date,
        departure_date,
        city:cities(
          id,
          name,
          country,
          region,
          continent,
          latitude,
          longitude,
          timezone
        )
      `)
      .eq('trip_id', tripId)
      .order('position');

    if (citiesError) {
      console.error('Error fetching trip cities:', citiesError);
      return NextResponse.json(
        { error: 'Failed to fetch trip cities' },
        { status: 500 }
      );
    }

    return NextResponse.json({ cities: tripCities });
  } catch (error) {
    console.error('Unexpected error in GET trip cities:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST handler to add a city to a trip
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const { tripId } = await params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are not set');
    }
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, { cookies: cookieStore });
    
    // Check if user can edit this trip
    const { data: hasEditAccess, error: accessError } = await supabase.rpc(
      'can_edit_trip',
      { p_trip_id: tripId }
    );

    if (accessError || !hasEditAccess) {
      return NextResponse.json(
        { error: 'Not authorized to edit this trip' },
        { status: 403 }
      );
    }

    // Get and validate request data
    const requestData = await request.json();
    const { city_id, position, arrival_date, departure_date } = requestData;

    if (!city_id) {
      return NextResponse.json(
        { error: 'city_id is required' },
        { status: 400 }
      );
    }

    // Check if the city exists
    const { data: cityExists, error: cityCheckError } = await supabase
      .from(TABLES.CITIES)
      .select('id')
      .eq('id', city_id)
      .single();

    if (cityCheckError || !cityExists) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }

    // Check if this city is already in the trip
    const { data: existingTripCity, error: existingCheckError } = await supabase
      .from(TABLES.TRIP_CITIES)
      .select('id')
      .eq('trip_id', tripId)
      .eq('city_id', city_id)
      .maybeSingle();

    if (existingTripCity) {
      return NextResponse.json(
        { error: 'This city is already part of the trip' },
        { status: 409 }
      );
    }

    // Use the add_city_to_trip function to handle positioning correctly
    const { data: newTripCity, error: addCityError } = await supabase.rpc(
      'add_city_to_trip',
      {
        p_trip_id: tripId,
        p_city_id: city_id,
        p_position: position || null,
        p_arrival_date: arrival_date || null,
        p_departure_date: departure_date || null
      }
    );

    if (addCityError) {
      console.error('Error adding city to trip:', addCityError);
      return NextResponse.json(
        { error: 'Failed to add city to trip' },
        { status: 500 }
      );
    }

    // Get the newly created trip city with city data
    const { data: tripCityWithData, error: fetchError } = await supabase
      .from(TABLES.TRIP_CITIES)
      .select(`
        id,
        trip_id,
        city_id,
        position,
        arrival_date,
        departure_date,
        city:cities(
          id,
          name,
          country,
          region,
          continent,
          latitude,
          longitude,
          timezone
        )
      `)
      .eq('id', newTripCity)
      .single();

    if (fetchError) {
      console.error('Error fetching new trip city data:', fetchError);
      return NextResponse.json(
        { 
          message: 'City added to trip but failed to fetch complete data',
          trip_city_id: newTripCity 
        },
        { status: 207 } // Partial Content
      );
    }

    return NextResponse.json(
      { 
        message: 'City added to trip successfully',
        trip_city: tripCityWithData 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST trip city:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * PUT handler to reorder cities in a trip
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const { tripId } = await params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are not set');
    }
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, { cookies: cookieStore });
    
    // Check if user can edit this trip
    const { data: hasEditAccess, error: accessError } = await supabase.rpc(
      'can_edit_trip',
      { p_trip_id: tripId }
    );

    if (accessError || !hasEditAccess) {
      return NextResponse.json(
        { error: 'Not authorized to edit this trip' },
        { status: 403 }
      );
    }

    // Get and validate request data
    const requestData = await request.json();
    const { city_ids } = requestData;

    if (!city_ids || !Array.isArray(city_ids) || city_ids.length === 0) {
      return NextResponse.json(
        { error: 'city_ids array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Call the function to reorder cities
    const { error: reorderError } = await supabase.rpc(
      'reorder_trip_cities',
      {
        p_trip_id: tripId,
        p_city_ids: city_ids
      }
    );

    if (reorderError) {
      console.error('Error reordering trip cities:', reorderError);
      return NextResponse.json(
        { error: 'Failed to reorder cities' },
        { status: 500 }
      );
    }

    // Get the updated trip cities list
    const { data: tripCities, error: fetchError } = await supabase
      .from(TABLES.TRIP_CITIES)
      .select(`
        id,
        trip_id,
        city_id,
        position,
        arrival_date,
        departure_date,
        city:cities(
          id,
          name,
          country,
          region
        )
      `)
      .eq('trip_id', tripId)
      .order('position');

    if (fetchError) {
      console.error('Error fetching updated trip cities:', fetchError);
      return NextResponse.json(
        { message: 'Cities reordered but failed to fetch updated data' },
        { status: 207 } // Partial Content
      );
    }

    return NextResponse.json({ 
      message: 'Cities reordered successfully',
      cities: tripCities 
    });
  } catch (error) {
    console.error('Unexpected error in PUT trip cities:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 