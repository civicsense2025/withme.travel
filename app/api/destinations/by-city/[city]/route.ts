import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { sanitizeString } from '@/utils/sanitize';
import { TABLES } from '@/utils/constants/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ city: string }> }
): Promise<NextResponse> {
  try {
    // Must await params in Next.js 15 before using them
    const { city } = await params;

    if (!city) {
      return NextResponse.json({ error: 'City parameter is required' }, { status: 400 });
    }

    const sanitizedCity = sanitizeString(decodeURIComponent(city));
    const supabase = await createRouteHandlerClient();

    const { data, error } = await supabase
      .from(TABLES.DESTINATIONS)
      .select('*')
      .ilike('city', `%${sanitizedCity}%`)
      .limit(10);

    if (error) {
      console.error('Error fetching destinations by city:', error);
      return NextResponse.json({ error: 'Failed to fetch destinations' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in destinations by city route:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
