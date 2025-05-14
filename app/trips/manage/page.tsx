import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/utils/supabase-server';
import { TABLES } from '@/utils/constants/tables';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { getGuestToken } from '@/utils/guest';
import { Metadata } from 'next';
import { requireAuthOrGuest } from '@/utils/auth/route-helpers';
import { TripTabs } from '../components/TripTabs';

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
  
  const supabase = await getServerSupabase();
  
  // Fetch trips for this user
  const { data: tripMembers, error } = await supabase
    .from(TABLES.MEMBERS)
    .select(`
      role,
      joined_at,
      trip:trip_id (
        id,
        name,
        start_date,
        end_date,
        created_at,
        status,
        destination_id,
        destination_name,
        cover_image_url, 
        created_by,
        is_public,
        privacy_setting,
        description
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('joined_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching trips:', error);
  }
  
  // Fetch user profile for personalized destinations
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
        initialTrips={tripMembers || []} 
        userId={user.id} 
        isGuest={isGuest}
        userProfile={userProfile || null}
      />
    </div>
  );
}
