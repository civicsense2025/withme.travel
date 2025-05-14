import { notFound } from 'next/navigation';
import { getServerSupabase } from '@/utils/supabase-server';
import { getGuestToken } from '@/utils/guest';
import GroupDetailClient from './group-detail-client';
import { GroupMember, GroupTrip } from '@/types/groups';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';

// Group details page - Shows details for a specific group
export default async function GroupDetailPage({ groupId }: { groupId: string }) {
  // Get supabase client
  const supabase = await getServerSupabase();

  // Get user securely, but don't throw if there's no session
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error) {
      user = data.user;
    } else if (process.env.NODE_ENV === 'development') {
      console.log('[GroupDetailPage] No authenticated user:', error);
    }
  } catch (err) {
    console.error('[GroupDetailPage] Error getting user:', err);
  }

  // Get guest token from cookies
  const guestToken = await getGuestToken();

  // Fetch group details, including creator profile
  const { data: group, error } = await supabase
    .from('groups')
    .select(
      `
      *,
      created_by_profile:profiles!created_by(*),
      ${'group_members'} (
        user_id,
        role,
        status,
        joined_at,
        updated_at,
        user:profiles!user_id (
          id,
          avatar_url,
          first_name,
          username
        )
      ),
      trip_count:${'group_trips'}(count)
    `
    )
    .eq('id', groupId)
    .single();

  if (error || !group) {
    console.error('Error loading group:', error);
    return notFound();
  }

  // Only check membership if user exists
  let membership: GroupMember | null = null;
  let userId: string | null = null;
  if (user) {
    userId = user.id;
    membership =
      group.group_members?.find(
        (member: GroupMember) => member.user_id === userId && member.status === 'active'
      ) || null;
  }

  // Get the trips associated with this group (most recent 5)
  const { data: trips, error: tripsError } = await supabase
    .from('group_trips')
    .select(
      `
      added_at,
      added_by,
      trip:${'trips'}!trip_id (
        id,
        name,
        start_date,
        end_date,
        created_by,
        destination_id,
        destinations:${'destinations'}!destination_id (
          id,
          name,
          country,
          image_url
        )
      )
    `
    )
    .eq('group_id', groupId)
    .order('added_at', { ascending: false })
    .limit(5);

  if (tripsError) {
    console.error('Error loading group trips:', tripsError);
  }

  // Map API result to GroupTrip[]
  const groupTrips: GroupTrip[] = (trips || []).map((t: any) => ({
    group_id: t.group_id,
    trip_id: t.trip_id,
    ...t,
  }));

  // If neither user nor guest token, show a friendly error
  if (!user && !guestToken) {
    return (
      <div className="container max-w-2xl py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">You need to join this group to view details</h2>
        <p className="mb-6">Sign up or use a guest invite link to access this group.</p>
        <Link href="/signup">
          <Button>Sign Up</Button>
        </Link>
      </div>
    );
  }

  return (
    <GroupDetailClient
      group={group}
      membership={membership}
      recentTrips={groupTrips}
      isAuthenticated={!!user}
      guestToken={guestToken}
    />
  );
}
