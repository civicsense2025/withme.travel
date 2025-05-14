import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/utils/supabase-server';
import { TABLES } from '@/utils/constants/tables';
import TripsClientPage from '../trips-client';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { getGuestToken } from '@/utils/guest';
import { Metadata } from 'next';
import { requireAuthOrGuest } from '@/utils/auth/route-helpers';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

// We need to tell search engines not to index this authenticated page
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

// Set revalidation to prevent constant refreshing
export const revalidate = 300; // Revalidate every 5 minutes

// Helper function to transform response data to the format expected by TripsClientPage
function formatTrips(tripMembers: any[]) {
  return tripMembers.map((member) => {
    // If trip is an array (as sometimes returned by Supabase), use the first element
    const tripData = Array.isArray(member.trip) ? member.trip[0] : member.trip;

    return {
      role: member.role,
      joined_at: member.joined_at,
      trip: tripData,
    };
  });
}

export default async function TripsManagePage() {
  // Check for authentication or guest status
  const { user, isGuest, guestToken } = await requireAuthOrGuest('/trips');

  // Get the Supabase client
  const supabase = await getServerSupabase();

  // If user is authenticated, fetch their trips
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
      console.error('[TripsManagePage] Error fetching tripMembers:', queryError);
    }

    // Format the trips data to match expected structure
    const formattedTrips = formatTrips(tripMembers || []);

    return (
      <PageContainer
        header={
          <PageHeader
            title="My Trips"
            description="Manage your travel adventures"
            className="mb-6"
            centered={true}
            actions={
              <a href="/trips/create">
                <Button className="flex items-center rounded-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Trip
                </Button>
              </a>
            }
          />
        }
      >
        <TripsClientPage initialTrips={formattedTrips} userId={user.id} />
      </PageContainer>
    );
  }

  // If this is a guest user, fetch their trips
  if (isGuest && guestToken) {
    try {
      const { data: guestMembers, error: guestError } = await supabase
        .from('guest_trip_members')
        .select(
          `
          trip_id,
          role,
          trips!inner (
            id, name, start_date, 
            end_date, created_at,
            status, destination_id, destination_name,
            cover_image_url, created_by, is_public,
            privacy_setting, description
          )
        `
        )
        .eq('guest_token', guestToken);

      if (guestError) {
        console.error('[TripsManagePage] Error fetching guest trips:', guestError);
      }

      if (guestMembers && guestMembers.length > 0) {
        // Transform guest trip data to match the expected format
        const guestTrips = guestMembers.map((member) => ({
          role: member.role,
          joined_at: null,
          trip: Array.isArray(member.trips) ? member.trips[0] : member.trips,
        }));

        return (
          <PageContainer
            header={
              <PageHeader
                title="My Trips"
                description="Manage your travel adventures"
                className="mb-6"
                centered={true}
                actions={
                  <a href="/trips/create">
                    <Button className="flex items-center rounded-full">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Trip
                    </Button>
                  </a>
                }
              />
            }
          >
            <TripsClientPage initialTrips={guestTrips} isGuest={true} />
          </PageContainer>
        );
      }
    } catch (err) {
      console.error('[TripsManagePage] Error processing guest trips:', err);
    }
  }

  // If we reach here, there are no trips for this user or guest
  return (
    <PageContainer
      header={
        <PageHeader
          title="My Trips"
          description="No trips found"
          className="mb-6"
          centered={true}
        />
      }
    >
      <div className="text-center p-8">
        <p className="mb-4">You don't have any trips yet.</p>
        <a href="/trips/create" className="text-blue-500 hover:underline">
          Create your first trip
        </a>
      </div>
    </PageContainer>
  );
}
