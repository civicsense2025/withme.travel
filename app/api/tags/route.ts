import { NextResponse } from 'next/server';
import { getRouteHandlerClient } from '@/utils/supabase/unified';
import { TABLES } from '@/utils/constants/database';


// Define a more complete type for TABLES that includes missing properties
type ExtendedTables = {
  TRIP_MEMBERS: string;
  TRIPS: string;
  USERS: string;
  ITINERARY_ITEMS: string;
  ITINERARY_SECTIONS: string;
  [key: string]: string;
};

// Use the extended type with the existing TABLES constant
const Tables = TABLES as unknown as ExtendedTables;

// Fetch all existing tags
export async function GET(request: Request) {
  try {
    // Use the route handler client from unified.ts
    const supabase = await getRouteHandlerClient(request);

    // Query tags
    const { data: tags, error } = await supabase
      .from('tags')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching tags:', error);
      return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Unexpected error fetching tags:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
