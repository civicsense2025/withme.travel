import { NextResponse, type NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams?.get('query');

    if (!query || query.length < 2) {
      return NextResponse.json({ destinations: [] }); // Return empty array for short/missing queries
    }

    console.log(`[API Destinations Search] Searching for: "${query}"`);

    // Create a Supabase client with proper error handling
    const supabase = await createRouteHandlerClient();

    // Using the client with the correct table from constants
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .or(
        `city.ilike.%${query}%,country.ilike.%${query}%,state_province.ilike.%${query}%,name.ilike.%${query}%`
      )
      .limit(10);

    if (error) {
      console.error('[API Destinations Search] Supabase error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to search destinations' },
        { status: 500 }
      );
    }

    console.log(`[API Destinations Search] Found ${data?.length || 0} results for "${query}"`);

    return NextResponse.json({ destinations: data || [] });
  } catch (error: any) {
    console.error('[API Destinations Search] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search destinations' },
      { status: 500 }
    );
  }
}
