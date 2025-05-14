import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

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

// --- Types ---
interface Tag {
  id: string;
  name: string;
}

interface TagResponse {
  tags: Tag[];
  success: true;
  message?: string;
}

interface ErrorResponse {
  error: string;
  code?: string;
  success: false;
}

// Fetch all existing tags
export async function GET(request: Request): Promise<NextResponse> {
  try {
    // Use the route handler client from unified.ts
    const supabase = await createRouteHandlerClient();

    // Query tags
    const { data, error } = await supabase
      .from(TABLES.TAGS)
      .select('id, name')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching tags:', error);
      return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }

    return NextResponse.json({ tags: data });
  } catch (error) {
    console.error('Unexpected error fetching tags:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
