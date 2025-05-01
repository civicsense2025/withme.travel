import { getServerComponentClient } from '@/utils/supabase/unified';
import { TABLES, DB_FIELDS } from '@/utils/constants/database';
import { ItineraryItem } from '@/types/database.types';
import { AddItineraryItemClient } from './add-item-client'; // Import the new client component

// Define the structure expected from the Supabase query
// Keep this interface here as it's used for data fetching
interface DestinationInfo {
  id: string;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  google_place_id: string | null;
}

interface TripWithDestination {
  destination_id: string | null;
  destination: DestinationInfo | null;
}

export default async function AddItineraryItemPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const supabase = await getServerComponentClient();

  let initialDestination: DestinationInfo | null = null;
  try {
    const { data: tripData, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select(
        `
        ${DB_FIELDS.TRIPS.DESTINATION_ID},
        destination:destinations (
          id,
          city,
          country,
          latitude,
          longitude,
          google_place_id
        )
      `
      )
      .eq(DB_FIELDS.TRIPS.ID, tripId)
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
