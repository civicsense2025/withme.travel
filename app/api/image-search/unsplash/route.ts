import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

// Unsplash API endpoint
const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const query = url.searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Check for API key
    const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!unsplashApiKey) {
      return NextResponse.json({ error: 'Unsplash API key is not configured' }, { status: 500 });
    }

    // Ensure the user is authenticated
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Search Unsplash API
    const response = await fetch(
      `${UNSPLASH_API_URL}?query=${encodeURIComponent(query)}&per_page=15`,
      {
        headers: {
          Authorization: `Client-ID ${unsplashApiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();

    // Save each image to the images table (if not already present)
    if (Array.isArray(data.results)) {
      for (const photo of data.results) {
        try {
          await supabase.from(TABLES.IMAGES).upsert(
            {
              external_id: photo.id,
              source: 'unsplash',
              url: photo.links?.html,
              image_url: photo.urls?.regular,
              thumb_url: photo.urls?.thumb,
              alt_text: photo.alt_description || photo.description || null,
              photographer: photo.user?.name,
              photographer_url: photo.user?.links?.html,
              width: photo.width,
              height: photo.height,
              created_at: new Date().toISOString(),
              created_by: user.id,
            },
            { onConflict: 'external_id,source' }
          );
        } catch (err) {
          console.error('Failed to upsert Unsplash image:', err);
        }
      }
    }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error searching Unsplash:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search Unsplash' },
      { status: 500 }
    );
  }
}
