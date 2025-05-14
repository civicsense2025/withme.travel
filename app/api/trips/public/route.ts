import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { PRIVACY_SETTINGS } from '@/utils/constants/status';

export const runtime = 'nodejs';

/**
 * GET /api/trips/public
 *
 * Fetches random public trips for use in demos such as thumbnail generation
 * No authentication required, only returns public data
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    const supabase = await createRouteHandlerClient();

    // Fetch public trips that have cover images and are fully public (not just shared with link)
    const { data: trips, error } = await supabase
      .from('trips')
      .select(
        `
        id, 
        name, 
        description,
        destination_id,
        destination_name,
        start_date,
        end_date,
        cover_image_url
      `
      )
      .eq('privacy_setting', PRIVACY_SETTINGS.PUBLIC)
      .not('cover_image_url', 'is', null)
      .not('public_slug', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching public trips:', error);
      return NextResponse.json({ error: 'Failed to fetch public trips' }, { status: 500 });
    }

    return NextResponse.json({ trips });
  } catch (error) {
    console.error('Error in public trips API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
