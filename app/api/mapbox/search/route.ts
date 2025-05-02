import { NextResponse } from 'next/server';

// Define the expected structure of a Mapbox Geocoding API feature
// See: https://docs.mapbox.com/api/search/geocoding/#geocoding-response-object
interface MapboxFeature {
  id: string;
  type: 'Feature';
  place_type: string[];
  relevance: number;
  properties: {
    accuracy?: string;
    mapbox_id?: string;
    wikidata?: string;
    short_code?: string; // Often country code
  };
  text: string; // Name of the feature (e.g., city, POI)
  place_name: string; // Full place name/address string
  bbox?: [number, number, number, number]; // Bounding box [minLng, minLat, maxLng, maxLat]
  center: [number, number]; // Coordinates [longitude, latitude]
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address?: string; // Often just the number
  context?: Array<{
    id: string;
    mapbox_id: string;
    wikidata?: string;
    short_code?: string; // e.g., country code like 'us'
    text: string; // e.g., 'Washington', 'United States'
  }>;
}

interface MapboxGeocodingResponse {
  type: 'FeatureCollection';
  query: string[];
  features: MapboxFeature[];
  attribution: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams?.get('query');
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!accessToken) {
    console.error('Mapbox access token (NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) is missing.');
    return NextResponse.json(
      { error: 'Server configuration error: Mapbox token missing.' },
      { status: 500 }
    );
  }

  if (!query || query.trim().length < 2) {
    // Return empty results for short or missing queries
    return NextResponse.json({ features: [] });
  }

  // Encode the query for the URL
  const encodedQuery = encodeURIComponent(query);

  // Construct the Mapbox API URL
  // Using autocomplete=true gives better suggestions as the user types
  // Limit results to save bandwidth/cost
  const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${accessToken}&autocomplete=true&limit=5`;

  try {
    const response = await fetch(mapboxUrl, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Mapbox API error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch from Mapbox API: ${response.status}`);
    }

    const data: MapboxGeocodingResponse = await response.json();

    // Return only the features array to the client
    return NextResponse.json({ features: data.features || [] });
  } catch (error: any) {
    console.error('Error fetching Mapbox data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location data.', details: error.message },
      { status: 500 }
    );
  }
}
