import { createServerComponentClient } from '@/utils/supabase/server';
import type { Tables } from '@/types/database.types';
import { AddItineraryItemClient } from './add-item-client'; // Import the new client component

// Define the structure expected from the Supabase query
// Keep this interface here as it's used for data fetching
interface DestinationInfo {
  id: string;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  mapbox_id: string | null;
}

interface TripWithDestination {
  destination_id: string | null;
  destination: DestinationInfo | null;
}

type ItineraryItem = Tables<'itinerary_items'>;

export default async function AddItineraryItemPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;

  // Get the supabase client using the project's standard approach
  const supabase = await createServerComponentClient();

  let initialDestination: DestinationInfo | null = null;
  try {
    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .select(
        `
        destination_id,
        destination:destinations (
          id,
          city,
          country,
          latitude,
          longitude,
          mapbox_id
        )
      `
      )
      .eq('id', tripId)
      .maybeSingle<TripWithDestination>();

    if (tripError) throw tripError;

    if (tripData?.destination) {
      initialDestination = tripData.destination;
    }
  } catch (error) {
    console.error('Error fetching trip destination for add-item page:', error);
    // Optionally handle the error state in the UI, maybe pass an error prop to the client component
  }

  // Render the client component, passing the fetched data as props
  return <AddItineraryItemClient tripId={tripId} initialDestination={initialDestination} />;
}

// ALL CLIENT COMPONENT CODE HAS BEEN MOVED TO add-item-client.tsx
