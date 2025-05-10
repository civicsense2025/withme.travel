import TripsClientPage from './trips-client';
import { getServerSupabase } from '@/utils/supabase-server';
import { TABLES } from '@/utils/constants/tables';
import { getGuestToken } from '@/utils/guest';
import { Suspense } from 'react';
import TripsLandingPage from './components/landing-page';

// Force dynamic to ensure we get fresh data on each request
export const dynamic = 'force-dynamic';

export default async function TripsPage() {
  // Use the appropriate Supabase client (works for both authenticated users and guests)
  const supabase = await getServerSupabase();
  
  // Try to get the user (will be null for guests)
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      user = data.user;
    }
  } catch (err) {
    console.error('[TripsPage Server] Error fetching user:', err);
    user = null;
  }

  // If user is authenticated, show dashboard with their trips
  if (user) {
    const { data: tripMembers, error: queryError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
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

    if (queryError) {
      console.error('[TripsPage Server] Error fetching tripMembers:', queryError);
    }

    return (
      <main>
        <TripsClientPage initialTrips={tripMembers || []} userId={user.id} />
      </main>
    );
  }

  // Guest logic: check for guest token and fetch their trips if any
  const guestToken = await getGuestToken();
  let guestTrips: any[] = [];
  
  if (guestToken) {
    // Try to fetch trips accessible to this guest
    try {
      const { data: guestMembers } = await supabase
        .from('guest_trip_members')
        .select(`
          trip_id,
          role,
          trips!inner (
            id, name, start_date, 
            end_date, created_at,
            status, destination_id, destination_name,
            cover_image_url, created_by, is_public,
            privacy_setting, description
          )
        `)
        .eq('guest_token', guestToken);
        
      if (guestMembers && guestMembers.length > 0) {
        guestTrips = guestMembers.map(member => ({
          role: member.role,
          joined_at: null,
          trip: member.trips
        }));
        
        // If guest has trips, show them the client page
        return (
          <main>
            <TripsClientPage initialTrips={guestTrips} isGuest={true} />
          </main>
        );
      }
    } catch (err) {
      console.error('[TripsPage Server] Error fetching guest trips:', err);
    }
  }
  
  // Show the trips landing page for guests with no trips
  return (
    <main>
      <TripsLandingPage />
    </main>
  );
}
