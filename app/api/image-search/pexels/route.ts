import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

// Pexels API endpoint
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const query = url.searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Check for API key
    const pexelsApiKey = process.env.PEXELS_API_KEY;
    if (!pexelsApiKey) {
      return NextResponse.json({ error: 'Pexels API key is not configured' }, { status: 500 });
    }

    // Ensure the user is authenticated
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Search Pexels API
    const response = await fetch(
      `${PEXELS_API_URL}?query=${encodeURIComponent(query)}&per_page=15`,
      {
        headers: {
          Authorization: pexelsApiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();

    // Save each image to the images table (if not already present)
    if (Array.isArray(data.photos)) {
      for (const photo of data.photos) {
        try {
          await supabase.from(TABLES.IMAGES).upsert(
            {
              external_id: photo.id?.toString(),
              source: 'pexels',
              url: photo.url,
              image_url: photo.src?.large || photo.src?.original,
              thumb_url: photo.src?.medium || photo.src?.small,
              alt_text: photo.alt || null,
              photographer: photo.photographer,
              photographer_url: photo.photographer_url,
              width: photo.width,
              height: photo.height,
              created_at: new Date().toISOString(),
              created_by: user.id,
            },
            { onConflict: 'external_id,source' }
          );
        } catch (err) {
          console.error('Failed to upsert Pexels image:', err);
        }
      }
    }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error searching Pexels:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search Pexels' },
      { status: 500 }
    );
  }
}
