import { NextResponse } from 'next/server';
import { createApi } from 'unsplash-js';

// Ensure API key is set in environment variables
const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

if (!unsplashAccessKey) {
  console.error("UNSPLASH_ACCESS_KEY environment variable is not set.");
  // Optionally throw an error during build/startup if needed
}

// Initialize Unsplash client (handle case where key might be missing at runtime)
const unsplash = unsplashAccessKey ? createApi({ accessKey: unsplashAccessKey }) : null;

export async function GET(request: Request) {
  if (!unsplash) {
    return NextResponse.json({ error: 'Unsplash API key not configured.' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('per_page') || '20', 10);

  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  try {
    const result = await unsplash.search.getPhotos({
      query,
      page,
      perPage,
      orientation: 'landscape', // Prefer landscape for covers
    });

    if (result.errors) {
      console.error('Unsplash API Error:', result.errors);
      return NextResponse.json({ error: 'Failed to fetch from Unsplash', details: result.errors }, { status: 500 });
    }

    // Map results to a simpler format if desired, e.g., only URLs and descriptions
    // Add type for the photo object based on accessed properties
    type UnsplashPhoto = {
      id: string;
      urls: { regular: string; thumb: string; };
      alt_description: string | null;
      description: string | null;
      user: {
        name: string;
        links: { html: string; };
      };
    };

    const photos = result.response?.results.map((photo: UnsplashPhoto) => ({
      id: photo.id,
      url: photo.urls.regular, // Or 'full', 'small', etc.
      thumbUrl: photo.urls.thumb,
      description: photo.alt_description || photo.description || 'Unsplash Image',
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
    }));

    return NextResponse.json({ photos: photos || [], totalPages: result.response?.total_pages });

  } catch (error: any) {
    console.error('Error fetching Unsplash photos:', error);
    return NextResponse.json({ error: 'Internal server error fetching Unsplash photos', details: error.message }, { status: 500 });
  }
} 