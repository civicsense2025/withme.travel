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
import { SharedPresenceSection } from '@/components/ui/SharedPresenceSection';
import { ExpenseMarketingSection } from './components/ExpenseMarketingSection';
import { getUserTrips, TripMember } from '@/lib/api';

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
      try {
        // Use our type-safe data fetching pattern
        const tripMembers = await getUserTrips(session!.user.id);

        return (
          <div className="container mx-auto px-4 py-8">
            <PageHeader 
              title="My Trips" 
              description="Manage and view all your travel plans" 
              actions={
                <Button size="sm" className="rounded-full px-4" asChild>
                  <Link href="/trips/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Trip
                  </Link>
                </Button>
              }
            />
            <TripsClient 
              initialTrips={tripMembers} 
              userId={session?.user.id} 
            />
          </div>
        );
      } catch (error) {
        console.error('Error fetching trips:', error);
        // Show the landing page if we fail to fetch trips
        return renderLandingPage();
      }
    } 
    
    // For guests with trips
    if (hasGuestTrips) {
      return redirect('/trips/manage');
    }
  }
  
  // For non-authenticated users, render the landing page
  return renderLandingPage();
}

// Landing page component for non-authenticated users
function renderLandingPage() {
  return (
    <>
      <HeroSectionWrapper 
        heading="Plan your perfect trip with friends and family" 
        subheading="Collaborate on itineraries, share ideas, and make memories together – all in one place."
        ctaText="Create a Trip"
        ctaHref="/trips/create"
        showBackground={true}
      />
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Component First on Mobile, Second on Desktop */}
          <div className="order-1 md:order-2">
            <SharedPresenceSection />
          </div>
          {/* Copy Second on Mobile, First on Desktop */}
          <div className="order-2 md:order-1 flex flex-col justify-center h-full">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Plan together, in real time</h2>
            <p className="text-lg text-muted-foreground mb-6">
              See who's online, brainstorm ideas, and make decisions as a group. withme.travel brings everyone together—no more lost messages or missed updates.
            </p>
          </div>
        </div>
      </section>
      <ExpenseMarketingSection />
    </>
  );
}
