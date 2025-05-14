import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/utils/supabase-server';
import { Metadata } from 'next';
import { getGuestToken } from '@/utils/guest';
import TripsLandingPage from './components/landing-page';

// Force dynamic to ensure we get fresh data on each request
export const dynamic = 'force-dynamic';

// Instead of forcing dynamic rendering on every request, use ISR with a reasonable revalidation period
export const revalidate = 300; // Revalidate every 5 minutes

// We need to tell search engines not to index this authenticated page
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TripsPage() {
  const supabase = await getServerSupabase();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Check if this is a guest user
  const guestToken = getGuestToken();
  
  // Redirect to login if not authenticated and not a guest
  if (!session?.user && !guestToken) {
    return redirect('/login?redirect=/trips/manage');
  }
  
  // Redirect to manage page for authenticated or guest users
  return redirect('/trips/manage');
}
