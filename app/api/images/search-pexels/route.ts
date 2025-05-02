import { NextResponse } from 'next/server';
import { createClient } from 'pexels';

// Ensure API key is set in environment variables
const pexelsApiKey = process.env.PEXELS_API_KEY;

if (!pexelsApiKey) {
  console.error('PEXELS_API_KEY environment variable is not set.');
}

// Initialize Pexels client
const pexelsClient = pexelsApiKey ? createClient(pexelsApiKey) : null;

export async function GET(request: Request) {
  if (!pexelsClient) {
    return NextResponse.json({ error: 'Pexels API key not configured.' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams?.get('query');
  const page = parseInt(searchParams?.get('page') || '1', 10);
  const perPage = parseInt(searchParams?.get('per_page') || '20', 10);

  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  try {
    // Pexels SDK types might be inaccurate or incomplete, using 'as any' as a workaround
    // if needed, but prefer explicit typing if possible.
    const response = await pexelsClient.photos.search({
      query,
      page,
      per_page: perPage,
      orientation: 'landscape', // Prefer landscape
    });

    // Check if the response indicates an error (structure might vary)
    if ('error' in response) {
      console.error('Pexels API Error:', (response as any).error);
      return NextResponse.json(
        { error: 'Failed to fetch from Pexels', details: (response as any).error },
        { status: 500 }
      );
    }

    // Check if photos exist in the response (structure may vary based on SDK version)
    if (!('photos' in response) || !Array.isArray(response.photos)) {
      console.error('Pexels API Error: Invalid response structure', response);
      return NextResponse.json({ error: 'Invalid response from Pexels API' }, { status: 500 });
    }

    // Define expected photo structure based on Pexels API docs
    type PexelsPhoto = {
      id: number;
      src: {
        original: string;
        large2x: string;
        large: string;
        medium: string;
        small: string;
        portrait: string;
        landscape: string;
        tiny: string;
      };
      alt: string | null;
      photographer: string;
      photographer_url: string;
    };

    // Map results
    const photos = response.photos.map((photo: PexelsPhoto) => ({
      id: photo.id.toString(), // Convert ID to string for consistency
      url: photo.src.large, // Choose appropriate size
      thumbUrl: photo.src.small,
      description: photo.alt || 'Pexels Image',
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
    }));

    // Determine if there are more pages (Pexels API might include next_page URL)
    const totalPages = response.total_results ? Math.ceil(response.total_results / perPage) : page;

    return NextResponse.json({ photos: photos, totalPages });
  } catch (error: any) {
    console.error('Error fetching Pexels photos:', error);
    return NextResponse.json(
      { error: 'Internal server error fetching Pexels photos', details: error.message },
      { status: 500 }
    );
  }
}
