import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { checkTripAccess, type TripRole } from '@/lib/trip-access';
import { z } from 'zod';
import { Database } from '@/types/database.types';
import { TRIP_ROLES } from '@/utils/constants/status';

// Define table names directly as string literals
const ITINERARY_ITEMS_TABLE = 'itinerary_items';

const notesSchema = z.object({
  content: z.string().max(10000).optional() // Allow optional for update
});

// --- GET Handler --- //
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  try {
    const { tripId, itemId } = await params;
    const supabase = createRouteHandlerClient();

    // Get the user from auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check access (Viewer allowed)
    const access = await checkTripAccess(
      user.id,
      tripId,
      [TRIP_ROLES.ADMIN, TRIP_ROLES.EDITOR, TRIP_ROLES.CONTRIBUTOR, TRIP_ROLES.VIEWER] as TripRole[]
    );
    
    if (!access.allowed) {
      return NextResponse.json({ error: access.error?.message || 'Forbidden' }, { status: access.error?.status || 403 });
    }

    // Fetch the specific itinerary item to get notes
    const { data: item, error } = await supabase
      .from(ITINERARY_ITEMS_TABLE)
      .select('notes')
      .eq('id', itemId)
      .eq('trip_id', tripId)
      .single();

    if (error) {
      console.error('Error fetching itinerary item notes:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Itinerary item not found' }, { status: 404 });
      }
      throw new Error('Failed to fetch item notes');
    }

    return NextResponse.json({ notes: item?.notes || '' }); // Return notes or empty string
  } catch (error) {
    console.error('[API Itinerary Item Notes GET] Error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// --- POST Handler (Update Notes) --- //
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  try {
    const { tripId, itemId } = await params;
    const supabase = createRouteHandlerClient();

    // Get the user from auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check access (editor or admin)
    const access = await checkTripAccess(
      user.id,
      tripId,
      [TRIP_ROLES.ADMIN, TRIP_ROLES.EDITOR] as TripRole[]
    );
    
    if (!access.allowed) {
      return NextResponse.json({ error: access.error?.message || 'Forbidden' }, { status: access.error?.status || 403 });
    }

    const body = await request.json();
    const validation = notesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // Update the itinerary item notes
    const { data, error } = await supabase
      .from(ITINERARY_ITEMS_TABLE)
      .update({ notes: content })
      .eq('id', itemId)
      .eq('trip_id', tripId)
      .select('notes')
      .single();

    if (error) {
      console.error('Error updating itinerary item notes:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Itinerary item not found' }, { status: 404 });
      }
      throw new Error('Failed to update item notes');
    }

    return NextResponse.json({ notes: data?.notes });
  } catch (error) {
    console.error('[API Itinerary Item Notes POST] Error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Retain PUT as an alias for POST for potential backward compatibility or specific use cases
export { POST as PUT };
