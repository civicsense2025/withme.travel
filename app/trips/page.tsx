import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import TripsClientPage from './trips-client';
import { createServerComponentClient } from '@/utils/supabase/ssr-client';

// Force dynamic to ensure we get fresh data on each request
export const dynamic = 'force-dynamic';

export default async function TripsPage() {
  // Authenticate on the server using the async client creator
  const supabase = await createServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect('/login?redirectTo=/trips');
  }
  
  // Fetch initial trips data for server side rendering
  const { data: tripMembers } = await supabase
    .from('trip_members')
    .select(`
      role, 
      joined_at,
      trip:trips (
        id, name, start_date, 
        end_date, created_at,
        status, destination_id, destination_name,
        cover_image_url, created_by, is_public,
        privacy_setting, description
      )
    `)
    .eq('user_id', session.user.id)
    .order('start_date', {
      foreignTable: 'trips',
      ascending: false,
      nullsFirst: false,
    })
    .order('created_at', { foreignTable: 'trips', ascending: false });
  
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center">My Trips</h1>
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3 animate-pulse">
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-5 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <TripsClientPage initialTrips={tripMembers || []} userId={session.user.id} />
    </Suspense>
  );
}
