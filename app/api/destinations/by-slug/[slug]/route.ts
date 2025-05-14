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

    // Handle special cases for null values being passed in the URL
    if (slug.startsWith('null-') || slug === 'null') {
      // Return a structured response with minimal data for null destinations
      return NextResponse.json({
        destination: {
          id: 'placeholder',
          name: 'Placeholder Destination',
          city: 'Example City',
          country: 'Example Country',
          continent: 'Example Continent',
          description: 'This is a placeholder for a destination that could not be found.',
          image_url: '/images/placeholder-destination.jpg',
        },
      });
    }

    // Check if this looks like an image/asset filename request
    if (slug.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|avif)$/i)) {
      // Return a JSON response with placeholder data instead of redirecting
      return NextResponse.json({
        destination: {
          id: 'image-placeholder',
          name: 'Image Placeholder',
          city: 'Image Request',
          country: 'Example Country',
          continent: 'Example Continent',
          description: 'This is a placeholder for an image request.',
          image_url: '/images/placeholder-destination.jpg',
        },
      });
    }

    // Check if this is a UUID pattern which is likely an error
    if (slug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return NextResponse.json(
        {
          error: 'Invalid slug format: UUID detected, expected a slug string',
          destination: {
            id: 'uuid-placeholder',
            name: 'UUID Placeholder',
            city: 'UUID Request',
            country: 'Example Country',
            continent: 'Example Continent',
            description: 'This is a placeholder for a UUID request.',
            image_url: '/images/placeholder-destination.jpg',
          },
        },
        { status: 200 } // Return 200 with error message and fallback data
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
      // Return a structured response with placeholder data instead of 404
      return NextResponse.json({
        error: 'Destination not found',
        destination: {
          id: 'not-found-placeholder',
          name: 'Destination Not Found',
          city: sanitizedSlug.replace(/-/g, ' '),
          country: 'Unknown',
          continent: 'Unknown',
          description: 'We could not find this destination in our database.',
          image_url: '/images/placeholder-destination.jpg',
        },
      });
    }

    return NextResponse.json({ destination: data });
  } catch (error) {
    console.error('Error in destinations by slug route:', error);
    // Always return valid JSON with fallback data, never a raw error
    return NextResponse.json({
      error: 'Internal server error',
      destination: {
        id: 'error-placeholder',
        name: 'Error Placeholder',
        city: 'Error',
        country: 'Example Country',
        continent: 'Example Continent',
        description: 'There was an error processing this request.',
        image_url: '/images/placeholder-destination.jpg',
      },
    });
  }
}
