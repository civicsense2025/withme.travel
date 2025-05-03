import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams?.get('q');
    const type = searchParams?.get('type') || 'all'; // all, destinations, trips

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const supabase = await createRouteHandlerClient();

    let destinations = [];
    let trips = [];

    // Search destinations if type is "all" or "destinations"
    if (type === 'all' || type === 'destinations') {
      const { data: destinationsData, error: destinationsError } = await supabase
        .from('destinations')
        .select('*')
        .or(
          `city.ilike.%${query}%,state_province.ilike.%${query}%,country.ilike.%${query}%,name.ilike.%${query}%`
        )
        .order('popularity', { ascending: false })
        .limit(20);

      if (destinationsError) {
        console.error('Error searching destinations:', destinationsError);
      } else {
        destinations = destinationsData || [];
      }
    }

    // Search trips if type is "all" or "trips" and user is authenticated
    if (type === 'all' || type === 'trips') {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { data: tripsData, error: tripsError } = await supabase
          .from('trips')
          .select('*')
          .or(`title.ilike.%${query}%,destination.ilike.%${query}%,description.ilike.%${query}%`)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (tripsError) {
          console.error('Error searching trips:', tripsError);
        } else {
          trips = tripsData || [];
        }
      }
    }

    return NextResponse.json({
      results: {
        destinations,
        trips,
      },
    });
  } catch (error: any) {
    console.error('Unexpected error in search:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}