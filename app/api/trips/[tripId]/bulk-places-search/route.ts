// This endpoint is deprecated because the 'places' table no longer exists in the database schema.
// This feature is deprecated and will be removed in a future release.
import { NextResponse } from 'next/server';
import { createApiRouteClient } from '@/utils/api-helpers/cookie-handlers';
import { TABLES } from '@/utils/constants/tables';

// Define the minimal place type for response
interface BulkPlaceResult {
  place_id: string;
  name: string;
  address: string;
  category: string | null;
  website: string | null;
}

// Helper to query Google Places API (Text Search + Details)
async function fetchPlaceFromGoogle(name: string): Promise<BulkPlaceResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  // 1. Text Search
  const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    name
  )}&key=${apiKey}`;
  const textRes = await fetch(textSearchUrl);
  const textData = await textRes.json();
  if (!textData.results || textData.results.length === 0) return null;
  const first = textData.results[0];
  const placeId = first.place_id;

  // 2. Place Details
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,types,website,place_id&key=${apiKey}`;
  const detailsRes = await fetch(detailsUrl);
  const detailsData = await detailsRes.json();
  const details = detailsData.result;
  if (!details) return null;

  return {
    place_id: details.place_id,
    name: details.name,
    address: details.formatted_address,
    category: Array.isArray(details.types) ? details.types[0] : null,
    website: details.website ?? null,
  };
}

export async function POST() {
  return NextResponse.json({ error: 'This endpoint is no longer available.' }, { status: 410 });
}
