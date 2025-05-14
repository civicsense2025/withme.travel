import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLE_NAMES } from '@/utils/constants/tables';

/**
 * GET endpoint to retrieve popular destinations
 *
 * @param {NextRequest} request - The incoming request
 * @returns {NextResponse} Response with popular destinations
 */
export async function GET(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  const limit = Number(request.nextUrl.searchParams.get('limit')) || 10;
  const page = Number(request.nextUrl.searchParams.get('page')) || 1;
  const offset = (page - 1) * limit;

  try {
    // Get most popular destinations
    const { data, error } = await supabase
      .from(TABLE_NAMES.DESTINATIONS)
      .select('*')
      .eq('is_popular', true)
      .eq('is_active', true)
      .order('popularity_score', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching popular destinations:', error);
      return NextResponse.json({ error: 'Failed to fetch destinations' }, { status: 500 });
    }

    return NextResponse.json({ destinations: data || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
