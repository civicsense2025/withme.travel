import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import TripsClientPage from './trips-client';
import { getServerComponentClient } from '@/utils/supabase/unified';
import { TABLES } from '@/utils/constants/database';

// Define a more complete type for TABLES that includes missing properties
type ExtendedTables = {
  TRIP_MEMBERS: string;
  TRIPS: string;
  USERS: string;
  ITINERARY_ITEMS: string;
  ITINERARY_SECTIONS: string;
  [key: string]: string;
};

// Use the extended type with the existing TABLES constant
const Tables = TABLES as unknown as ExtendedTables;

// Force dynamic to ensure we get fresh data on each request
export const dynamic = 'force-dynamic';

export default async function TripsPage() {
  // Use the correct client creation function
  const supabase = await getServerComponentClient();
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
    .from('trip_members') // TODO: Add TRIP_MEMBERS to TABLES constant in @/utils/constants/database
    .select(
      `
      role, 
      joined_at,
      trip:${Tables.TRIPS} (
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
      foreignTable: Tables.TRIPS,
      ascending: false,
      nullsFirst: false,
    })
    .order('created_at', { foreignTable: Tables.TRIPS, ascending: false });

  // Log if there was a query error
  if (queryError) {
    console.error('[TripsPage Server] Error fetching tripMembers:', queryError);
  }

  // Log the fetched data (which we know is currently null)
  console.log(
    '[TripsPage Server] Fetched tripMembers result:',
    JSON.stringify(tripMembers, null, 2)
  );

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center">My Trips</h1>
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3 animate-pulse">
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-5 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <TripsClientPage initialTrips={tripMembers || []} userId={user.id} />
    </Suspense>
  );
}
