import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { TABLES } from '@/utils/constants/tables';
import { ENUMS } from '@/utils/constants/tables';

// Schema for validating import data
const importSchema = z.object({
  places: z.array(
    z.object({
      name: z.string().min(1),
      address: z.string().optional(),
      latitude: z.number(),
      longitude: z.number(),
      placeId: z.string().optional(),
      category: z.string().optional(),
    })
  ),
});

/**
 * API endpoint to import places from Google Maps to a trip
 * @param request The incoming request
 * @param param1 Request parameters (tripId)
 * @returns JSON response with added itinerary items
 */
export async function POST(request: NextRequest, { params }: { params: { tripId: string } }) {
  const { tripId } = params;
  const supabase = await createRouteHandlerClient();

  try {
    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a member of this trip with edit permissions
    const { data: membership, error: membershipError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Not a member of this trip' }, { status: 403 });
    }

    // Check if user has edit permissions
    const canEdit = ['admin', 'editor'].includes(membership.role);
    if (!canEdit) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse and validate the request body
    const body = await request.json();
    const validation = importSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data format', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { places } = validation.data;

    // Transform the places into the correct itinerary item structure
    const transformedItems = places.map((place) => ({
      name: place.name,
      title: place.name,
      description: place.address || '',
      address: place.address || null,
      latitude: place.latitude,
      longitude: place.longitude,
      category: ENUMS.ITINERARY_CATEGORY.OTHER,
      type: 'place',
      trip_id: tripId,
      created_by: user.id,
      status: 'suggested' as const,
      details: JSON.stringify({
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
        place_id: place.placeId,
        category: place.category || 'other',
      }),
    }));

    // Insert the items into the database
    const { data: createdItems, error: insertError } = await supabase
      .from(TABLES.ITINERARY_ITEMS)
      .insert(transformedItems)
      .select();

    if (insertError) {
      console.error('Error importing Google Maps places:', insertError);
      return NextResponse.json({ error: 'Failed to import places' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${createdItems?.length || 0} places`,
      items: createdItems,
    });
  } catch (error) {
    console.error('Unexpected error during Google Maps import:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
