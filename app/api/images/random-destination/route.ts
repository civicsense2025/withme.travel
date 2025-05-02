import { NextResponse } from 'next/server';
import { getDestinationPhoto } from '@/lib/unsplashService';
import { createServerSupabaseClient } from "@/utils/supabase/server"; // Use server client
import { z } from 'zod';

// Function to get a random element from an array
function getRandomElement<T>(arr: T[]): T | undefined {
  if (!arr || arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- GET Handler for truly random image ---
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    // 1. Fetch a list of popular destinations with images
    // Adjust query as needed (e.g., filter by popularity, ensure state/country present)
    const { data: destinations, error: dbError } = await supabase
      .from('destinations')
      .select('city, country, state_province') // Select necessary fields
      .not('image_url', 'is', null) // Ensure they have potential images
      .limit(20); // Fetch a reasonable number to pick from

    if (dbError) {
      console.error('Error fetching destinations for random image:', dbError);
      throw new Error('Database error fetching destinations.');
    }

    if (!destinations || destinations.length === 0) {
      console.warn('No destinations found to pick a random image from.');
      // Optionally return a default placeholder URL
      return NextResponse.json({ imageUrl: '/images/placeholder.svg' }, { status: 404 });
    }

    // 2. Pick a random destination
    const randomDestination = getRandomElement(destinations);
    if (!randomDestination) {
      // Should theoretically not happen if destinations array is not empty
      throw new Error('Failed to select a random destination.');
    }

    // 3. Fetch image using Unsplash service
    console.log(`API: Getting random image for: ${randomDestination.city}`);
    const result = await getDestinationPhoto(
      randomDestination.city,
      randomDestination.country,
      randomDestination.state_province || null
    );

    if (!result?.photo?.urls?.regular) {
      console.warn(
        `API: Could not find Unsplash image for random destination: ${randomDestination.city}`
      );
      // Optionally return a default placeholder URL
      return NextResponse.json({ imageUrl: '/images/placeholder.svg' }, { status: 404 });
    }

    const imageUrl = result.photo.urls.regular;
    console.log(`API: Found random image URL: ${imageUrl}`);

    // 4. Return just the image URL
    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error('Error in GET /api/images/random-destination:', error);
    // Return a generic placeholder on error
    return NextResponse.json({ imageUrl: '/images/placeholder.svg' }, { status: 500 });
  }
}

// --- POST Handler (Keep or Remove?) ---
// Commenting out POST handler as GET seems more appropriate for "random-destination"
/*
const schema = z.object({
  // ... (existing schema) ...
  city: z.string().min(1, "City name is required"),
  country: z.string().min(1, "Country name is required"),
  state: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request body', details: validation.error.errors }, { status: 400 });
    }

    const { city, country, state } = validation.data;
    console.log(`API: Fetching destination photo for: ${city}, ${state ? state + ', ' : ''}${country}`);

    const result = await getDestinationPhoto(
        city,
        country,
        state || null
    );

    if (!result) {
      return NextResponse.json({ error: 'No suitable image found for the destination' }, { status: 404 });
    }
    const photo = result.photo;
    console.log(`API: Found photo ${photo.id} for ${city} via query "${result.sourceQuery}"`);

    // Prepare metadata (Original POST returned full metadata)
    const metadata = { // : Omit<ImageMetadata, 'id' | 'created_at' | 'updated_at'> = {
      entity_type: 'destination',
      entity_id: `${city}-${country}`,
      url: photo.urls.regular,
      alt_text: photo.description || photo.alt_description || `Travel photo of ${city}, ${country}`,
      attribution: result.attribution,
      attributionHtml: result.attributionHtml,
      photographer_name: photo.user.name,
      photographer_url: photo.user.links.html,
      source: 'unsplash',
      source_id: photo.id,
      width: photo.width,
      height: photo.height,
    };

    return NextResponse.json(metadata);

  } catch (error: any) {
    console.error('Error fetching destination photo API (POST):', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    if (errorMessage.startsWith('Could not find any suitable image')) {
        return NextResponse.json({ error: 'No suitable image found for the destination', details: errorMessage }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to fetch destination photo', details: errorMessage }, { status: 500 });
  }
}
*/
