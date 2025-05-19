import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@/utils/supabase/server';
import TripTourClient from './tour-client';

/**
 * Trip Tour Page - Onboarding tour for a newly created trip
 */
export default async function TripTourPage({ params }: { params: { tripId: string } }) {
  const supabase = await createServerComponentClient();

  // Get user securely
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Check if user is authenticated
  if (userError || !user) {
    console.warn('[TripTourPage] User not authenticated or error fetching user:', userError);
    redirect(`/login?callback-rl=/trips/${params.tripId}/tour`);
  }

  // Fetch the trip data
  const { data: trip, error } = await supabase
    .from('trips')
    .select(
      `
      *,
      groups:group_id (name)
    `
    )
    .eq('id', params.tripId)
    .single();

  if (error || !trip) {
    notFound();
  }

  // Check if user is a member of the trip
  const { data: membership, error: membershipError } = await supabase
    .from('trip_members')
    .select('*')
    .eq('trip_id', params.tripId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  // Defensive: check trip shape before accessing visibility
  if (
    !membership &&
    typeof trip === 'object' &&
    'visibility' in trip &&
    trip.visibility !== 'public'
  ) {
    redirect(`/trips/${params.tripId}`); // Redirect to trip page if not a member
  }

  // Defensive: check trip.groups shape before accessing name
  const groupName =
    typeof trip === 'object' &&
    trip.groups &&
    typeof trip.groups === 'object' &&
    'name' in trip.groups
      ? (trip.groups as { name?: string }).name || 'Your Group'
      : 'Your Group';

  return (
    <div className="container mx-auto">
      <TripTourClient trip={trip} groupName={groupName} />
    </div>
  );
}
