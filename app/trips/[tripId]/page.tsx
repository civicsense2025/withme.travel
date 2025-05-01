import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import TripPageClientWrapper from './trip-page-client-wrapper';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import type { Database } from '@/types/database.types';
import { createServerComponentClient } from '@/utils/supabase/ssr-client';
import { TABLES } from '@/utils/constants/database';

// Table names for direct use in queries
const TABLE_NAMES = {
  TRIPS: 'trips',
  TRIP_MEMBERS: 'trip_members'
};

// Trip role literals for comparison
const TRIP_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  CONTRIBUTOR: 'contributor'
} as const;

// Define TripRole type locally
type TripRole = 'admin' | 'editor' | 'viewer' | 'contributor';

export default async function TripPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  // In Next.js 15, we must await the params
  const { tripId } = await params;

  // Use the async client creator for server components
  const supabase = await createServerComponentClient();
  
  // Check authentication status
  const { data: { session } } = await supabase.auth.getSession();
  
  // If user is not authenticated, redirect to login
  if (!session) {
    redirect(`/login?redirectTo=${encodeURIComponent(`/trips/${tripId}`)}`);
  }
  
  // Fetch trip and user's membership in parallel
  const [tripResult, memberResult] = await Promise.all([
    supabase
      .from(TABLE_NAMES.TRIPS)
      .select('id, name')
      .eq('id', tripId)
      .single(),
    supabase
      .from(TABLE_NAMES.TRIP_MEMBERS)
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', session.user.id)
      .maybeSingle(),
  ]);

  const { data: trip, error: tripError } = tripResult;
  const { data: member, error: memberError } = memberResult;

  // Handle errors (e.g., network issues)
  if (tripError || memberError) {
    console.error('Error fetching trip or membership:', tripError || memberError);
    // Consider showing a more specific error page
    throw tripError || memberError || new Error('Failed to load trip data');
  }

  if (!trip) {
    return notFound();
  }

  // Determine if the user can edit the trip using role constants
  const userRole = member?.role as TripRole | undefined;
  const canEdit = userRole === TRIP_ROLES.ADMIN || userRole === TRIP_ROLES.EDITOR;

  return (
    <Suspense fallback={<div className="p-4">Loading trip...</div>}>
      <TripPageClientWrapper tripId={tripId} canEdit={canEdit} />
    </Suspense>
  );
}
