import { redirect } from 'next/navigation';
import TripsClientPage from './trips-client';
import { getServerComponentClient } from '@/utils/supabase/unified';
import { TABLES } from '@/utils/constants/database';
import { TripsFeedbackButton } from './TripsFeedbackButton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Trips</h1>
        <div className="flex items-center gap-4">
          <TripsFeedbackButton />
          <Button asChild>
            <Link href="/trips/create">Create Trip</Link>
          </Button>
        </div>
      </div>
      
      <TripsClientPage initialTrips={tripMembers || []} userId={user.id} />
    </div>
  );
}
