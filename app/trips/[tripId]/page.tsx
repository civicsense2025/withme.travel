import { createServerComponentClient } from '@/utils/supabase/ssr-client';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import type { Database } from '@/types/database.types';
// Import TABLES but use type assertion
import { TABLES } from '@/utils/constants/database';
import { TRIP_ROLES } from '@/utils/constants/status';
import type { TripRole } from '@/types/trip';
import TripPageClientWrapper from './trip-page-client-wrapper';

// Define a more complete type for TABLES
type ExtendedTables = {
  TRIP_MEMBERS: string;
  TRIPS: string;
  [key: string]: string;
};

// Use the extended type with the existing TABLES constant
const Tables = TABLES as unknown as ExtendedTables;

export default async function TripPage({ params }: { params: Promise<{ tripId: string }> }) {
  // In Next.js 15, we must await the params
  const { tripId } = await params;

  // Use the (now refactored) client creator
  const supabase = createServerComponentClient();

  // Check authentication status using getUser() for security
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Handle potential auth errors (e.g., invalid token)
  if (authError) {
    console.error('Authentication error:', authError);
    // Redirect to login, clear potentially problematic cookies?
    redirect(`/login?redirectTo=${encodeURIComponent(`/trips/${tripId}`)}&error=auth_error`);
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(`/trips/${tripId}`)}`);
  }

  // Fetch trip and user's membership in parallel using Tables
  const [tripResult, memberResult] = await Promise.all([
    supabase.from(Tables.TRIPS).select('id, name').eq('id', tripId).single(),
    supabase
      .from(Tables.TRIP_MEMBERS)
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  const { data: trip, error: tripError } = tripResult;
  const { data: member, error: memberError } = memberResult;

  // Handle errors (e.g., network issues)
  if (tripError || memberError) {
    console.error('Error fetching trip or membership:', tripError || memberError);
    // Consider showing a more specific error page
    // Ensure RLS policies are checked if this happens frequently for authenticated users
    throw tripError || memberError || new Error('Failed to load trip data');
  }

  if (!trip) {
    // This could also indicate an RLS issue if the user should have access
    console.warn(`Trip not found or access denied for ID: ${tripId}, User: ${user.id}`);
    return notFound();
  }

  // Use TRIP_ROLES directly from status constants
  const userRole = member?.role as TripRole | undefined;
  const canEdit = userRole === TRIP_ROLES.ADMIN || userRole === TRIP_ROLES.EDITOR;

  return (
    <Suspense fallback={<div className="p-4">Loading trip...</div>}>
      <TripPageClientWrapper tripId={tripId} canEdit={canEdit} />
    </Suspense>
  );
}
