import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/utils/supabase-server';
import { Metadata } from 'next';
import { getGuestToken } from '@/utils/guest';
import TripsLandingPage from './components/landing-page';

// Force dynamic to ensure we get fresh data on each request
export const dynamic = 'force-dynamic';

// Instead of forcing dynamic rendering on every request, use ISR with a reasonable revalidation period
export const revalidate = 300; // Revalidate every 5 minutes

// We need to tell search engines to index this public landing page
export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

export default async function TripsPage() {
  const supabase = await getServerSupabase();
  
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthenticated = !!session?.user;
  
  // Check if this is a guest user
  const guestToken = getGuestToken();
  
  // Check if guest has any trips
  let hasGuestTrips = false;
  if (guestToken) {
    const { data: guestTrips } = await supabase
      .from('guest_trip_access')
      .select('trip_id')
      .eq('guest_token', guestToken);
    
    hasGuestTrips = !!(guestTrips && guestTrips.length > 0);
  }
  
  // If user is authenticated or guest has trips, redirect to manage page
  if (isAuthenticated || hasGuestTrips) {
    return redirect('/trips/manage');
  }
  
  // Show the landing page for guests with no trips
  return <TripsLandingPage />;
}
