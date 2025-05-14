import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLE_NAMES } from '@/utils/constants/tables';

/**
 * GET endpoint to retrieve random featured destinations
 *
 * @param {NextRequest} request - The incoming request
 * @returns {NextResponse} Response with random destinations
 */
export async function GET(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  const limit = Number(request.nextUrl.searchParams.get('limit')) || 3;

  try {
    // Get random destinations marked as featured
    const { data, error } = await supabase
      .from(TABLE_NAMES.DESTINATIONS)
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('random()')
      .limit(limit);

    if (error) {
      console.error('Error fetching random destinations:', error);
      return NextResponse.json({ error: 'Failed to fetch destinations' }, { status: 500 });
    }

    return NextResponse.json({ destinations: data || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
