import { NextResponse } from 'next/server';
import { getDestinationPhoto, UnsplashPhoto } from '@/lib/unsplashService'; // Updated import path to use the new service file
import { imageService, ImageMetadata } from '@/lib/services/image-service'; // Import service for potential upsert
import { z } from 'zod';

// No need to extend UnsplashPhoto here if width/height are optional in the base type
// interface ExtendedUnsplashPhoto extends UnsplashPhoto {
//   width?: number; 
//   height?: number;
// }

const schema = z.object({
  destination: z.string().min(1, "Destination name is required"),
  // getDestinationPhoto requires city, country, and optional state.
  // We might need to parse these from the 'destination' string or require separate fields.
  // For simplicity, let's assume 'destination' is just the city for now and hardcode/omit others.
  // A better approach would be to require structured input: { city: string, country: string, state?: string }
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

    // Use validated city, country, state
    const { city, country, state } = validation.data;

    console.log(`API: Fetching destination photo for: ${city}, ${state ? state + ', ' : ''}${country}`);

    // Use the correct function getDestinationPhoto
    const result = await getDestinationPhoto(
        city,
        country,
        state || null
    );

    // Check if result is null
    if (!result) {
      return NextResponse.json({ error: 'No suitable image found for the destination' }, { status: 404 });
    }

    // getDestinationPhoto throws an error if no photo is found, so no need for explicit null check here
    const photo = result.photo;

    console.log(`API: Found photo ${photo.id} for ${city} via query "${result.sourceQuery}"`);

    // Prepare metadata using the returned photo and attribution
    const metadata: Omit<ImageMetadata, 'id' | 'created_at' | 'updated_at'> = {
      entity_type: 'destination',
      entity_id: `${city}-${country}`, // Create a simple entity ID, might need adjustment
      url: photo.urls.regular,
      alt_text: photo.description || photo.alt_description || `Travel photo of ${city}, ${country}`,
      attribution: result.attribution, // Use attribution from getDestinationPhoto
      attributionHtml: result.attributionHtml, // Add HTML attribution
      photographer_name: photo.user.name,
      photographer_url: photo.user.links.html,
      source: 'unsplash',
      source_id: photo.id,
      width: photo.width,
      height: photo.height,
    };

    // Return the prepared metadata directly
    return NextResponse.json(metadata);

  } catch (error: any) {
    console.error('Error fetching destination photo API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    // If the error is specifically about not finding an image, return 404
    if (errorMessage.startsWith('Could not find any suitable image')) {
        return NextResponse.json({ error: 'No suitable image found for the destination', details: errorMessage }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to fetch destination photo', details: errorMessage }, { status: 500 });
  }
}

export async function GET() {
    return NextResponse.json({ error: 'Method Not Allowed. Use POST.' }, { status: 405 });
} 