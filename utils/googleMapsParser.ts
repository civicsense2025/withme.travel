import type { ItineraryItem } from '@/types/database.types';

interface PlaceData {
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

interface ParsedGoogleMapsResult {
  success: boolean;
  places: PlaceData[];
  listTitle?: string;
  error?: string;
}

/**
 * Parses a Google Maps list URL to extract places data
 * This is a mock implementation, as we can't actually scrape Google Maps here
 */
export async function parseGoogleMapsList(url: string): Promise<ParsedGoogleMapsResult> {
  try {
    // This is a mock implementation
    // In a real implementation, we would make a request to the URL and parse the HTML
    
    // For now, return a success with mock data
    return {
      success: true,
      listTitle: "Sample Google Maps List",
      places: [
        {
          title: "Example Restaurant",
          address: "123 Main St, City, Country",
          rating: 4.5,
          reviews: 100,
          category: "Restaurant",
          description: "A great place to eat",
          website: "https://example.com",
          phone: "+1 123-456-7890",
          placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
          latitude: 37.7749,
          longitude: -122.4194
        },
        {
          title: "Example Attraction",
          address: "456 Park Ave, City, Country",
          rating: 4.8,
          reviews: 250,
          category: "Tourist Attraction",
          description: "A must-see attraction",
          placeId: "ChIJP3Sa8ziYEmsRUKgyFmh9AQM",
          latitude: 37.7694,
          longitude: -122.4862
        }
      ]
    };
  } catch (error: any) {
    return {
      success: false,
      places: [],
      error: `Failed to parse Google Maps list: ${error.message}`
    };
  }
}

/**
 * Extract places information from Google Maps HTML
 */
function extractPlacesFromHtml(html: string): PlaceData[] {
  try {
    // Implementation removed as we're not using cheerio
    return [];
  } catch (error) {
    console.error('Error extracting places:', error);
    return [];
  }
}

/**
 * Converts place data to itinerary items format
 */
export function convertToItineraryItems(places: PlaceData[], tripId: string): Partial<ItineraryItem>[] {
  return places.map((place, index) => {
    return {
      title: place.title,
      description: place.description || `${place.title} - ${place.address}`,
      location: place.address,
      latitude: place.latitude || undefined,
      longitude: place.longitude || undefined,
      url: place.placeId ? `https://www.google.com/maps/place/?q=place_id:${place.placeId}` : undefined,
      category: getCategoryFromPlace(place),
      position: index,
      trip_id: tripId
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
  
  if (category.includes('restaurant') || category.includes('café') || 
      category.includes('cafe') || category.includes('food')) {
    return 'restaurant';
  }
  
  if (category.includes('hotel') || category.includes('lodging') || 
      category.includes('accommodation')) {
    return 'accommodation';
  }
  
  if (category.includes('airport') || category.includes('station') || 
      category.includes('transportation')) {
    return 'transportation';
  }
  
  if (category.includes('museum') || category.includes('attraction') || 
      category.includes('landmark')) {
    return 'attraction';
  }
  
  return 'activity';
} 