import { NextResponse } from 'next/server';
import { createApiRouteClient } from '@/utils/api-helpers/cookie-handlers';
import { TABLES as TABLES_RAW } from '@/utils/constants/database';
import type { SupabaseClient } from '@supabase/supabase-js';

// Explicitly type TABLES_FULL as the type of the real TABLES object
const TABLES_FULL: typeof import('@/utils/constants/database').TABLES = TABLES_RAW;

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

export async function POST(request: Request, { params }: { params: { tripId: string } }) {
  try {
    const { names } = await request.json();
    if (!Array.isArray(names) || names.length === 0) {
      return NextResponse.json({ success: false, error: 'No place names provided.' }, { status: 400 });
    }

    const supabase = await createApiRouteClient();
    const results: BulkPlaceResult[] = [];
    for (const name of names) {
      // 1. Check cache (places table)
      const { data: cached, error: cacheError } = await supabase
        .from(TABLES_FULL.PLACES)
        .select('place_id, name, address, category, website')
        .ilike('name', name)
        .single();
      if (cached && !cacheError) {
        results.push(cached as BulkPlaceResult);
        continue;
      }
      // 2. Query Google Places API
      const googlePlace = await fetchPlaceFromGoogle(name);
      if (googlePlace) {
        // 3. Store in DB (if not already present)
        await supabase.from(TABLES_FULL.PLACES).upsert([
          {
            place_id: googlePlace.place_id,
            name: googlePlace.name,
            address: googlePlace.address,
            category: googlePlace.category,
            website: googlePlace.website,
            source: 'google_places',
          },
        ], { onConflict: 'place_id' });
        results.push(googlePlace);
      }
    }
    return NextResponse.json({ success: true, places: results });
  } catch (error: any) {
    console.error('Bulk places search error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
} 