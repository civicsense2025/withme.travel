import { NextResponse, NextRequest } from 'next/server';
// Import the correct shared helper
import { createServerSupabaseClient } from '@/utils/supabase/server';
// Use the direct TABLES export as per constants guide
import { TABLES } from '@/utils/constants/database';
import type { Database } from '@/types/database.types';

export async function GET(
  request: NextRequest, // Route Handlers receive NextRequest
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    // Must await params in Next.js 15
    const { tripId } = await params;

    // UUID validation to prevent database errors
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!tripId || !UUID_REGEX.test(tripId)) {
      return NextResponse.json({ error: 'Invalid trip ID format' }, { status: 400 });
    }

    // Create the client using the correct helper
    const supabase = createServerSupabaseClient();

    // Use getUser() for a more secure auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error in members route:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch trip members using the correct TABLES constant
    const { data, error } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select(
        `
        *,
        profiles:${TABLES.PROFILES}(*)
      `
      )
      .eq('trip_id', tripId);

    if (error) {
      console.error('Error fetching members:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return only the data array as per original logic, assuming the consumer expects { data: [...] }
    return NextResponse.json({ data });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
