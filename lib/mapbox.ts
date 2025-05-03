// Helper function to format seconds into minutes/hours
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

// Define structure for the returned travel info
export interface TravelInfo {
  duration: number; // seconds
  mode: 'walking' | 'driving'; // Add 'cycling' or others if needed
  formattedDuration: string;
}

// Define structure to hold results for multiple modes
export interface TravelTimesResult {
  walking?: TravelInfo | null; // Optional: null if route not found/error
  driving?: TravelInfo | null;
}

// Define expected structure for itinerary items needed for calculation
interface ItineraryItemCoords {
  id: string | number;
  latitude: number | null;
  longitude: number | null;
  // We might need day_number or similar for grouping/sorting if not pre-sorted
  day_number?: number | null;
  position?: number | null;
  start_time?: string | null;
}

// Define structure for the Mapbox Directions API response
interface MapboxDirectionResponse {
  routes: Array<{
    duration: number;
  }>;
  code: string;
}

/**
 * Calculates travel times for multiple modes between consecutive itinerary items.
 * Assumes items are sorted correctly.
 * @param items Array of itinerary items with coordinates.
 * @returns A record mapping the starting item's ID to an object containing travel info for different modes.
 */
export async function calculateTravelTimes(
  items: ItineraryItemCoords[]
): Promise<Record<string | number, TravelTimesResult>> {
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  // Initialize with the new result structure
  const travelTimes: Record<string | number, TravelTimesResult> = {};

  if (!mapboxAccessToken) {
    console.error('Mapbox Access Token is not configured. Cannot calculate travel times.');
    return travelTimes;
  }
  if (!items || items.length < 2) {
    return travelTimes;
  }

  // Assume items might need grouping by day if day_number is provided
  const itemsByDay: Record<number, ItineraryItemCoords[]> = {};
  let hasDayNumber = false;
  items.forEach((item) => {
    if (item.day_number !== undefined && item.day_number !== null) {
      hasDayNumber = true;
      const day = item.day_number;
      if (!itemsByDay[day]) {
        itemsByDay[day] = [];
      }
      // Sort within day if position/start_time is available
      itemsByDay[day].push(item);
    } else {
      // Items without day number go into a default group (e.g., day 0)
      const day = 0;
      if (!itemsByDay[day]) {
        itemsByDay[day] = [];
      }
      itemsByDay[day].push(item);
    }
  });

  // Sort items within each day group if sorting fields are present
  for (const day in itemsByDay) {
    itemsByDay[day].sort((a, b) => { // Basic sort: position first, then start_time
      const posCompare = (a.position ?? Infinity) - (b.position ?? Infinity);
      if (posCompare !== 0) return posCompare;
      const timeA = a.start_time ?? '';
      const timeB = b.start_time ?? '';
      return timeA.localeCompare(timeB); });
  }

  const fetchPromises: Promise<void>[] = [];
  const profiles: ('walking' | 'driving')[] = ['walking', 'driving'];

  for (const day in itemsByDay) {
    const dayItems = itemsByDay[day];
    for (let i = 0; i < dayItems.length - 1; i++) {
      const startItem = dayItems[i];
      const endItem = dayItems[i + 1];

      if (startItem.latitude && startItem.longitude && endItem.latitude && endItem.longitude) {
        const promise = (async () => {
          // Initialize result for this segment
          const segmentResult: TravelTimesResult = {};

          for (const profile of profiles) {
            const startCoords = `${startItem.longitude},${startItem.latitude}`;
            const endCoords = `${endItem.longitude},${endItem.latitude}`;
            const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${startCoords};${endCoords}?access_token=${mapboxAccessToken}&overview=false`;

            try {
              const response = await fetch(url);
              if (!response.ok) {
                console.warn(
                  `Mapbox API error for ${profile} (${response.status}): ${await response.text()}`
                );
                segmentResult[profile] = null; // Indicate error/no route for this profile
                continue;
              }
              const data: MapboxDirectionResponse = await response.json();

              if (data.code === 'Ok' && data.routes?.length > 0) {
                const duration = data.routes[0].duration;
                segmentResult[profile] = {
                  duration,
                  mode: profile,
                  formattedDuration: formatDuration(duration),
                };
              } else {
                segmentResult[profile] = null; // No route found for this profile
              }
            } catch (fetchError) {
              console.error(`Error fetching Mapbox directions for ${profile}:`, fetchError);
              segmentResult[profile] = null; // Indicate fetch error for this profile
            }
          } // End profile loop

          // Store the results for this segment (walking/driving)
          travelTimes[startItem.id.toString()] = segmentResult;
        })();
        fetchPromises.push(promise);
      }
    }
  }

  await Promise.all(fetchPromises);
  return travelTimes;
}