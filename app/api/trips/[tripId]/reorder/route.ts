import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { TABLES } from '@/utils/constants/database';
import { TRIP_ROLES } from '@/utils/constants/status';
import { checkTripAccess } from '@/lib/trip-access';

// Define local field constants for database access
const FIELDS = {
  COMMON: {
    ID: 'id',
  },
  ITINERARY_ITEMS: {
    ORDER: 'order',
    TRIP_ID: 'trip_id',
    SECTION_ID: 'section_id',
    DAY: 'day',
  },
};

// Schema for validating input
const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      order: z.number().int().min(0),
    })
  ),
});

// POST /api/trips/[tripId]/reorder - Reorder itinerary items
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const supabase = createRouteHandlerClient();

    // Authenticate the user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if the user has edit access to this trip
    const accessResult = await checkTripAccess(user.id, tripId, [
      TRIP_ROLES.ADMIN,
      TRIP_ROLES.EDITOR,
    ]);
    if (!accessResult.allowed) {
      return NextResponse.json(
        { error: accessResult.error || 'You do not have permission to reorder items' },
        { status: 403 }
      );
    }

    // Parse and validate the request body
    let requestData;
    try {
      const body = await request.json();
      requestData = reorderSchema.parse(body);
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { error: error instanceof z.ZodError ? error.errors : 'Invalid request body' },
        { status: 400 }
      );
    }

    // Update each item's order in a transaction
    const { error: updateError } = await supabase.rpc('reorder_itinerary_items', {
      items_data: requestData.items.map((item) => ({
        item_id: item.id,
        new_order: item.order,
      })),
      trip_id: tripId,
    });

    if (updateError) {
      console.error('Error reordering items:', updateError);
      return NextResponse.json({ error: 'Failed to reorder items' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in reorder API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
