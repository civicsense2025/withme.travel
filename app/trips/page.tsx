import { redirect } from 'next/navigation';
import TripsClientPage from './trips-client';
import { getServerComponentClient } from '@/utils/supabase/unified';
import { TABLES } from '@/utils/constants/tables';

// Define a more complete type for TABLES that includes missing properties
type ExtendedTables = {
  TRIP_MEMBERS: string;
  TRIPS: string;
  USERS: string;
  ITINERARY_ITEMS: string;
  ITINERARY_SECTIONS: string;
  [key: string]: string;
};

// Force dynamic to ensure we get fresh data on each request
export const dynamic = 'force-dynamic';

export default async function TripsPage() {
  // Use the correct client creation function
  const supabase = getServerComponentClient();
  // Get user directly instead of session for better security
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated or error fetching user
  if (userError || !user) {
    if (userError) {
      console.error('[TripsPage Server] Error fetching user:', userError);
    }
    redirect('/login?redirectTo=/trips');
  }

  // Log the specific User ID being used for the query
  console.log('[TripsPage Server] Using User ID for query:', user.id);

  // Fetch initial trips data for server side rendering
  const { data: tripMembers, error: queryError } = await supabase
    .from(TABLES.TRIP_MEMBERS) // Use constant from imported TABLES
    .select(
      `
      role, 
      joined_at,
      trip:${TABLES.TRIPS} (
        id, name, start_date, 
        end_date, created_at,
        status, destination_id, destination_name,
        cover_image_url, created_by, is_public,
        privacy_setting, description
      )
    `
    )
    .eq('user_id', user.id)
    .order('start_date', {
      foreignTable: TABLES.TRIPS,
      ascending: false,
      nullsFirst: false,
    })
    .order('created_at', { foreignTable: TABLES.TRIPS, ascending: false });

  // Log if there was a query error
  if (queryError) {
    console.error('[TripsPage Server] Error fetching tripMembers:', queryError);
  }

  return (
    <main>
      <TripsClientPage initialTrips={tripMembers || []} userId={user.id} />
    </main>
  );
}
