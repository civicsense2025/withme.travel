import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/utils/supabase-server';
import { Metadata } from 'next';
import { getGuestToken } from '@/utils/guest';
import HeroSectionWrapper from './components/HeroSectionWrapper';
import TripsClient from './trips-client';
import { PageHeader } from '@/components/layout/page-header';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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

// Define Trip and TripMember interfaces to match what trips-client expects
interface Trip {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  status: string | null;
  destination_id: string | null;
  destination_name: string | null;
  cover_image_url: string | null;
  created_by: string;
  is_public: boolean | null;
  privacy_setting: string | null;
  description: string | null;
}

interface TripMember {
  role: string;
  joined_at: string | null;
  trip: Trip;
}

export default async function TripsPage() {
  const supabase = await getServerSupabase();
  
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthenticated = !!session?.user;
  
  // Check if this is a guest user
  const guestToken = getGuestToken();
  
  // Check if guest has any trips
  let hasGuestTrips = false;
  let guestTrips = [];
  
  if (guestToken) {
    const { data } = await supabase
      .from('guest_trip_access')
      .select('trip_id')
      .eq('guest_token', guestToken);
    
    guestTrips = data || [];
    hasGuestTrips = !!(guestTrips && guestTrips.length > 0);
  }
  
  // If user is authenticated or guest has trips
  if (isAuthenticated || hasGuestTrips) {
    // For authenticated users, fetch their trips
    if (isAuthenticated) {
      const { data: tripMembers } = await supabase
        .from('trip_members')
        .select(`
          role,
          joined_at,
          trip:trips(*)
        `)
        .eq('user_id', session!.user.id)
        .order('joined_at', { ascending: false });

      // Properly cast the type by first converting to unknown, then to our expected type
      const typedTripMembers = (tripMembers || []) as unknown as TripMember[];

      return (
        <div className="container mx-auto px-4 py-8">
          <PageHeader 
            title="My Trips" 
            description="Manage and view all your travel plans" 
            actions={
              <Link href="/trips/create">
                <Button size="sm" className="rounded-full px-4">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Trip
                </Button>
              </Link>
            }
          />
          <TripsClient 
            initialTrips={typedTripMembers} 
            userId={session?.user.id} 
          />
        </div>
      );
    } 
    
    // For guests with trips
    if (hasGuestTrips) {
      return redirect('/trips/manage');
    }
  }
  
  // Show the hero section with 2-column layout for the landing page (non-authenticated users)
  return <HeroSectionWrapper 
    heading="Plan your perfect trip with friends and family" 
    subheading="Collaborate on itineraries, share ideas, and make memories together – all in one place."
    ctaText="Create a Trip"
    ctaHref="/trips/create"
    showBackground={true}
  />;
}
