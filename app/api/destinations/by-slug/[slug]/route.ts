import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { sanitizeString } from '@/utils/sanitize';

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

    // Check if this looks like an image/asset filename request
    if (slug.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|avif)$/i)) {
      return NextResponse.json(
        { error: 'Invalid slug format: Image file extension detected' }, 
        { status: 400 }
      );
    }

    // Check if this is a UUID pattern which is likely an error
    if (slug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return NextResponse.json(
        { error: 'Invalid slug format: UUID detected, expected a slug string' }, 
        { status: 400 }
      );
    }

    const sanitizedSlug = sanitizeString(decodeURIComponent(slug));
    const supabase = await createRouteHandlerClient();

    const { data, error } = await supabase
      .from('destinations')
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
