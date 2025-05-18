import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

/**
 * GET endpoint to retrieve popular destinations
 *
 * @param {NextRequest} req - The incoming request
 * @returns {NextResponse} Response with popular destinations
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '8', 10);

    const { data, error } = await supabase.from(TABLES.DESTINATIONS).select('*').limit(limit);

    if (error) {
      console.error('Error fetching popular destinations:', error);
      return NextResponse.json({ error: 'Failed to fetch destinations' }, { status: 500 });
    }

    return NextResponse.json({ destinations: data });
  } catch (err) {
    console.error('Unexpected error in popular destinations API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
