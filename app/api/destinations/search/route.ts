import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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

// Use the public anon key to respect RLS policies
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key for destination search');
  // Avoid throwing error at module scope, handle in handler
}

// Note: Using the anon key means RLS policies WILL be applied.
// Ensure your policies allow authenticated (or relevant) users to SELECT from destinations.
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export async function GET(request: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // TODO: Add authentication check here if the search should be restricted to logged-in users
  // Example using a different client creation method if needed:
  // import { createApiRouteClient } from '@/utils/supabase/ssr-client'; // Assuming this exists
  // const supabaseUserClient = await createApiRouteClient();
  // const { data: { user } } = await supabaseUserClient.auth.getUser();
  // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Then use supabaseUserClient for the query instead of the module-scoped 'supabase'

  const { searchParams } = new URL(request.url);
  const query = searchParams?.get('query');

  if (!query || query.length < 2) {
    return NextResponse.json({ destinations: [] }); // Return empty array for short/missing queries
  }

  console.log(`[API Destinations Search] Searching for: "${query}"`);

  try {
    // Using the public client (respects RLS)
    const { data, error } = await supabase // Use the module-scoped client
      .from(Tables.DESTINATIONS)
      .select('*') // Select specific fields needed by PlaceSearch if possible
      .or(`city.ilike.%${query}%,country.ilike.%${query}%,state_province.ilike.%${query}%`)
      .limit(10); // Limit results

    if (error) {
      console.error('[API Destinations Search] Supabase error:', error);
      throw new Error(error.message);
    }

    console.log(`[API Destinations Search] Found ${data?.length || 0} results for "${query}"`);

    return NextResponse.json({ destinations: data || [] });
  } catch (error: any) {
    console.error('[API Destinations Search] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch destinations' },
      { status: 500 }
    );
  }
}
