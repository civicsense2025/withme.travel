import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/utils/supabase-server';
import { getGuestToken } from '@/utils/guest';
import TripsLandingPage from './components/landing-page';

// Force dynamic to ensure we get fresh data on each request
export const dynamic = 'force-dynamic';

// Instead of forcing dynamic rendering on every request, use ISR with a reasonable revalidation period
export const revalidate = 300; // Revalidate every 5 minutes

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

  // If user is authenticated, redirect to the manage page
  if (user) {
    redirect('/trips/manage');
  }

  // Guest logic: check for guest token and fetch their trips if any
  const guestToken = await getGuestToken();
  let hasGuestTrips = false;

  if (guestToken) {
    // Try to fetch trips accessible to this guest
    try {
      const { data: guestTrips } = await supabase
        .from('guest_trip_members')
        .select('trip_id')
        .eq('guest_token', guestToken);

      // If guest has trips, redirect to manage
      if (guestTrips && guestTrips.length > 0) {
        hasGuestTrips = true;
        redirect('/trips/manage');
      }
    } catch (err) {
      console.error('[TripsPage Server] Error fetching guest trips:', err);
    }
  }

  // Show the trips landing page for guests with no trips
  return <TripsLandingPage />;
}
