import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { sanitizeString } from '@/utils/sanitize';
import { TABLES } from '@/utils/constants/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    // Must await params in Next.js 15 before using them
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
    }

    const sanitizedSlug = sanitizeString(decodeURIComponent(slug));
    const supabase = await createRouteHandlerClient();

    const { data, error } = await supabase
      .from(TABLES.DESTINATIONS)
      .select('*')
      .eq('slug', sanitizedSlug)
      .single();

    if (error || !data) {
      console.error('Error fetching destination by slug:', error);
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
    }

    return NextResponse.json({ destination: data });
  } catch (error) {
    console.error('Error in destinations by slug route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
