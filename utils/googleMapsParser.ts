import type { ItineraryItem } from '@/types/database.types';

export interface PlaceData {
  title: string;
  address: string;
  rating?: number | null;
  reviews?: number | null;
  category?: string | null;
  description?: string | null;
  website?: string | null;
  phone?: string | null;
  imageUrl?: string | null;
  placeId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ParsedGoogleMapsResult {
  success: boolean;
  places: PlaceData[];
  listTitle?: string;
  error?: string;
}

/**
 * Fetches and parses a public Google Maps "List" URL.
 */
export async function parseGoogleMapsList(
  url: string
): Promise<ParsedGoogleMapsResult> {
  try {
    // 1. Expand short-link / follow redirects
    const expandRes = await fetch(url, { redirect: 'follow' });
    const finalUrl = expandRes.url;
    console.log('Expanded URL:', finalUrl);
    
    // Try to extract listId from various URL formats
    let listId = null;
    const parsedUrl = new URL(finalUrl);
    const params = parsedUrl.searchParams;
    
    // Check for mid parameter (traditional lists)
    listId = params.get('mid') || params.get('list_cid');
    
    // Check for data parameter (newer format)
    if (!listId) {
      const dataParam = params.get('data');
      if (dataParam) {
        // Extract list ID from data parameter which might be in format "!1m4!1m3!1m2!1slistId!2stitle"
        const match = dataParam.match(/!1m2!1s([^!]+)!/);
        if (match && match[1]) {
          listId = match[1];
        }
      }
    }
    
    // Check for list ID in path structure (maps.app.goo.gl URLs)
    if (!listId && finalUrl.includes('maps.app.goo.gl')) {
      // For maps.app URLs, we need to fetch the content and extract list IDs
      const pageContent = await fetch(finalUrl).then(res => res.text());
      
      // Look for list IDs in the HTML content
      const midMatch = pageContent.match(/listId":"([^"]+)"/);
      if (midMatch && midMatch[1]) {
        listId = midMatch[1];
      }
      
      // Alternative pattern
      if (!listId) {
        const altMatch = pageContent.match(/2s([0-9a-zA-Z_-]+)/);
        if (altMatch && altMatch[1]) {
          listId = altMatch[1];
        }
      }
    }
    
    if (!listId) {
      throw new Error('Could not find a list ID (mid) in that URL. Please try a different Google Maps list URL format.');
    }

    // 2. Construct the RPC payload
    const rpcPayload = JSON.stringify([
      ['ListRPCService.GetListById', [listId, 'en'], null, 'generic']
    ]);

    // 3. Call Google's internal list RPC endpoint
    const rpcRes = await fetch(
      'https://www.google.com/maps/preview/list',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: `f.req=${encodeURIComponent(rpcPayload)}`
      }
    );
    
    if (!rpcRes.ok) {
      throw new Error(`RPC returned ${rpcRes.status}`);
    }

    // 4. Strip anti-XSSI prefix and parse
    let text = await rpcRes.text();
    if (text.startsWith(")]}'")) text = text.slice(4);
    const rpcJson = JSON.parse(text);

    // 5. Locate list data
    const listBlock = rpcJson[0][2][0];
    const listTitle = listBlock[0] as string;
    const rawItems = listBlock[2] as any[];

    // 6. Map to our shape
    const places: PlaceData[] = rawItems.map((item) => {
      const title = item[0] as string;
      const detail = item[1];
      return {
        title,
        address: detail[1] as string,
        placeId: detail[0] as string,
        latitude: (detail[8] && detail[8][0]) as number,
        longitude: (detail[8] && detail[8][1]) as number,
        category: (detail[3] as string) || null,
        description: (detail[6] as string) || null,
        rating: detail[4] ? parseFloat(detail[4]) : null,
        reviews: detail[5] ? parseInt(detail[5]) : null,
        phone: (detail[9] as string) || null,
        website: (detail[7] as string) || null
      };
    });

    return { success: true, listTitle, places };
  } catch (err: any) {
    console.error('Google Maps parsing error:', err);
    return {
      success: false,
      places: [],
      error: err.message || 'Unknown error parsing list'
    };
  }
}

/**
 * Converts place data to itinerary items format
 */
export function convertToItineraryItems(
  places: PlaceData[],
  tripId: string
): Partial<ItineraryItem>[] {
  return places.map((place, index) => {
    return {
      title: place.title,
      description: place.description || `${place.title} - ${place.address}`,
      location: place.address,
      latitude: place.latitude || undefined,
      longitude: place.longitude || undefined,
      url: place.placeId
        ? `https://www.google.com/maps/place/?q=place_id:${place.placeId}`
        : undefined,
      category: getCategoryFromPlace(place),
      position: index,
      trip_id: tripId,
    };
  });
}

/**
 * Determines a category for a place based on its data
 * @private
 */
function getCategoryFromPlace(place: PlaceData): string {
  if (!place.category) return 'attraction';

  const category = place.category.toLowerCase();

  if (
    category.includes('restaurant') ||
    category.includes('café') ||
    category.includes('cafe') ||
    category.includes('food') ||
    category.includes('bar') ||
    category.includes('dining')
  ) {
    return 'restaurant';
  }

  if (
    category.includes('hotel') ||
    category.includes('lodging') ||
    category.includes('accommodation') ||
    category.includes('resort') ||
    category.includes('motel')
  ) {
    return 'accommodation';
  }

  if (
    category.includes('airport') ||
    category.includes('station') ||
    category.includes('transportation') ||
    category.includes('transit') ||
    category.includes('terminal')
  ) {
    return 'transportation';
  }

  if (
    category.includes('museum') ||
    category.includes('attraction') ||
    category.includes('landmark') ||
    category.includes('monument') ||
    category.includes('point of interest')
  ) {
    return 'attraction';
  }

  if (
    category.includes('park') ||
    category.includes('garden') ||
    category.includes('trail') ||
    category.includes('beach') ||
    category.includes('outdoor')
  ) {
    return 'activity';
  }

  if (
    category.includes('nightlife') ||
    category.includes('club') ||
    category.includes('theater') ||
    category.includes('entertainment')
  ) {
    return 'nightlife';
  }

  return 'activity';
}
