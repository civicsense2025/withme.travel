import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { sanitizeString } from '@/utils/sanitize';

export async function GET(
  request: NextRequest,
  { params }: { params: { city: string } }
): Promise<NextResponse> {
  try {
    const city = params.city || '';

    if (!city) {
      return NextResponse.json({ error: 'City parameter is required' }, { status: 400 });
    }

    const sanitizedCity = sanitizeString(decodeURIComponent(city));
    const supabase = createRouteHandlerClient();

    const { data, error } = await supabase
      .from('destinations')
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
