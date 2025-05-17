import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Metadata } from 'next';
import { requireAuthOrGuest } from '@/utils/auth/route-helpers';
import { TripTabs } from '../components/TripTabs';
import { getServerSupabase } from '@/utils/supabase-server';
import { TABLES } from '@/utils/constants/tables';
import { getUserTrips } from '@/lib/api';

// We need to tell search engines not to index this authenticated page
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

// Set revalidation to prevent constant refreshing
export const revalidate = 3600; // 1 hour

export default async function TripsManagePage() {
  // Get session and authentication info
  const { user, isGuest } = await requireAuthOrGuest();
  if (!user) {
    return redirect(`/login?redirect=${encodeURIComponent('/trips/manage')}`);
  }
  
  try {
    // Use our new type-safe data fetching pattern
    const tripMembers = await getUserTrips(user.id);
    
    // Fetch user profile for personalized destinations
    const supabase = await getServerSupabase();
    const { data: userProfile } = await supabase
      .from(TABLES.PROFILES)
      .select('id, interests, home_location_name, travel_personality')
      .eq('id', user.id)
      .single();

    return (
      <div className="max-w-3xl mx-auto px-4">
        <PageHeader
          title="My Trips"
          description="Manage your trip plans and itineraries"
          className="mb-10"
          centered={true}
        />
        <TripTabs 
          initialTrips={tripMembers} 
          userId={user.id} 
          isGuest={isGuest}
          userProfile={userProfile || null}
        />
      </div>
    );
  } catch (error) {
    console.error('Error in TripsManagePage:', error);
    return (
      <div className="max-w-3xl mx-auto px-4">
        <PageHeader
          title="My Trips"
          description="Manage your trip plans and itineraries"
          className="mb-10"
          centered={true}
        />
        <div className="text-center p-8 bg-card rounded-xl border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Error Loading Trips</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't load your trips. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
