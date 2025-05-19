import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/tables';

/**
 * GET handler to retrieve a specific city in a trip
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string; city_id: string } }
) {
  try {
    const { tripId, city_id: cityId } = params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are not set');
    }
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, { cookies: cookieStore });

    // Check if user has access to the trip
    const { data: isMember, error: memberError } = await supabase.rpc('is_trip_member', {
      p_trip_id: tripId,
    });

    if (memberError) {
      console.error('Error checking trip membership:', memberError);
      return NextResponse.json({ error: 'Failed to verify trip access' }, { status: 500 });
    }

    // Get trip privacy setting if not a member
    if (!isMember) {
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('privacy_setting')
        .eq('id', tripId)
        .single();

      if (tripError) {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
      }

      if (trip.privacy_setting !== 'public' && trip.privacy_setting !== 'shared_with_link') {
        return NextResponse.json({ error: 'Not authorized to access this trip' }, { status: 403 });
      }
    }

    // Get the trip city with city data
    const { data: tripCity, error: cityError } = await supabase
      .from(TABLES.TRIP_CITIES)
      .select(
        `
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
      `
      )
      .eq('trip_id', tripId)
      .eq('city_id', cityId)
      .single();

    if (cityError) {
      console.error('Error fetching trip city:', cityError);
      return NextResponse.json({ error: 'City not found in this trip' }, { status: 404 });
    }

    return NextResponse.json({ trip_city: tripCity });
  } catch (error) {
    console.error('Unexpected error in GET trip city:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * PATCH handler to update a city in a trip
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { tripId: string; city_id: string } }
) {
  try {
    const { tripId, city_id: cityId } = params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are not set');
    }
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, { cookies: cookieStore });

    // Check if user can edit this trip
    const { data: hasEditAccess, error: accessError } = await supabase.rpc('can_edit_trip', {
      p_trip_id: tripId,
    });

    if (accessError || !hasEditAccess) {
      return NextResponse.json({ error: 'Not authorized to edit this trip' }, { status: 403 });
    }

    // Get and validate request data
    const requestData = await request.json();
    const { arrival_date, departure_date } = requestData;

    // Find the trip city
    const { data: tripCity, error: findError } = await supabase
      .from(TABLES.TRIP_CITIES)
      .select('id')
      .eq('trip_id', tripId)
      .eq('city_id', cityId)
      .single();

    if (findError) {
      return NextResponse.json({ error: 'City not found in this trip' }, { status: 404 });
    }

    // Update the trip city
    const { data: updatedTripCity, error: updateError } = await supabase
      .from(TABLES.TRIP_CITIES)
      .update({
        arrival_date,
        departure_date,
      })
      .eq('id', tripCity.id)
      .select(
        `
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
      `
      )
      .single();

    if (updateError) {
      console.error('Error updating trip city:', updateError);
      return NextResponse.json({ error: 'Failed to update city in trip' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'City updated successfully',
      trip_city: updatedTripCity,
    });
  } catch (error) {
    console.error('Unexpected error in PATCH trip city:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * DELETE handler to remove a city from a trip
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tripId: string; city_id: string } }
) {
  try {
    const { tripId, city_id: cityId } = params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are not set');
    }
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, { cookies: cookieStore });

    // Check if user can edit this trip
    const { data: hasEditAccess, error: accessError } = await supabase.rpc('can_edit_trip', {
      p_trip_id: tripId,
    });

    if (accessError || !hasEditAccess) {
      return NextResponse.json({ error: 'Not authorized to edit this trip' }, { status: 403 });
    }

    // Find the trip city to get its position
    const { data: tripCity, error: findError } = await supabase
      .from(TABLES.TRIP_CITIES)
      .select('id, position')
      .eq('trip_id', tripId)
      .eq('city_id', cityId)
      .single();

    if (findError) {
      return NextResponse.json({ error: 'City not found in this trip' }, { status: 404 });
    }

    // Get all itinerary sections that belong to this trip city
    const { data: sections, error: sectionsError } = await supabase
      .from('itinerary_sections')
      .select('id')
      .eq('trip_city_id', tripCity.id);

    if (sectionsError) {
      console.error('Error finding itinerary sections:', sectionsError);
      return NextResponse.json({ error: 'Failed to process itinerary sections' }, { status: 500 });
    }

    // Start a transaction to ensure data consistency
    // Since we can't directly use transactions in the Edge runtime,
    // we need to handle this carefully with multiple operations

    // 1. Update any itinerary sections to remove the trip_city_id reference
    if (sections && sections.length > 0) {
      const sectionIds = sections.map((section) => section.id);
      const { error: updateSectionsError } = await supabase
        .from('itinerary_sections')
        .update({ trip_city_id: null })
        .in('id', sectionIds);

      if (updateSectionsError) {
        console.error('Error updating itinerary sections:', updateSectionsError);
        return NextResponse.json({ error: 'Failed to update itinerary sections' }, { status: 500 });
      }
    }

    // 2. Delete the trip city
    const { error: deleteError } = await supabase
      .from(TABLES.TRIP_CITIES)
      .delete()
      .eq('id', tripCity.id);

    if (deleteError) {
      console.error('Error deleting trip city:', deleteError);
      return NextResponse.json({ error: 'Failed to remove city from trip' }, { status: 500 });
    }

    // 3. Update positions of other cities to maintain order
    // Supabase JS client does not support .sql, so we need to fetch and update manually
    const { data: affectedCities, error: fetchAffectedError } = await supabase
      .from(TABLES.TRIP_CITIES)
      .select('id, position')
      .eq('trip_id', tripId)
      .gt('position', tripCity.position);

    if (!fetchAffectedError && Array.isArray(affectedCities) && affectedCities.length > 0) {
      for (const city of affectedCities) {
        await supabase
          .from(TABLES.TRIP_CITIES)
          .update({ position: city.position - 1 })
          .eq('id', city.id);
      }
    }

    return NextResponse.json({
      message: 'City removed from trip successfully',
      removed_city_id: cityId,
    });
  } catch (error) {
    console.error('Unexpected error in DELETE trip city:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
