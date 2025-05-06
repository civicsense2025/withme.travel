import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSupabase } from '@/utils/supabase-server';
import { TABLES, FIELDS } from '@/utils/constants/database';
import GroupDetailClient from './group-detail-client';
import { GroupMember, GroupTrip } from '@/types/groups';
import { v4 as uuidv4 } from 'uuid';
import { createServerComponentClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';

// Group details page - Shows details for a specific group
export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = await params; // Await params (Next.js 15)

  // Get supabase client
  const supabase = await getServerSupabase();
  // Get user securely
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error('[GroupPage] Error checking user auth:', userError);
    // Depending on desired behavior, you might redirect or show an error
    // For now, continue but assume not logged in
  }

  // --- Backend guest record logic ---
  let guestToken: string | null = null;
  if (!user) {
    // Try to get guest token from cookies
    const cookieStore = await cookies();
    guestToken = cookieStore.get('guest_group_token')?.value || null;
    if (!guestToken) {
      // Generate a new guest token and set it in cookies (client-side JS should also set this for future requests)
      guestToken = uuidv4();
      // Note: In a real app, set this cookie in a middleware or API route response
      // For now, just use it in-memory for this request
    }
    // TODO: Use guestToken to fetch or create a guest group record in the DB
    // Example: await supabase.from(TABLES.GROUPS).upsert({ id: groupId, guest_token: guestToken, ... })
    // For now, continue to fetch the group as normal
  }

  // Fetch group details (fix join syntax)
  const { data: group, error } = await supabase
    .from(TABLES.GROUPS)
    .select(`
      *,
      ${TABLES.GROUP_MEMBERS} (
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
      trip_count:${TABLES.GROUP_TRIPS}(count)
    `)
    .eq(FIELDS.GROUPS.ID, groupId)
    .single();
  
  if (error || !group) {
    console.error('Error loading group:', error);
    return notFound();
  }
  
  // Only check membership if session exists
  let membership: GroupMember | null = null;
  let userId: string | null = null;
  if (user) { // Use the user object from getUser()
    userId = user.id;
    membership = group.group_members?.find((member: GroupMember) => member.user_id === userId && member.status === 'active') || null;
  }
  // TODO: For guests, you could also check if guestToken matches a guest member record

  // Get the trips associated with this group (most recent 5)
  const { data: trips, error: tripsError } = await supabase
    .from(TABLES.GROUP_TRIPS)
    .select(`
      added_at,
      added_by,
      trip:${TABLES.TRIPS}!trip_id (
        id,
        name,
        start_date,
        end_date,
        created_by,
        destination_id,
        destinations:${TABLES.DESTINATIONS}!destination_id (
          id,
          name,
          country,
          image_url
        )
      )
    `)
    .eq(FIELDS.GROUP_TRIPS.GROUP_ID, groupId)
    .order('added_at', { ascending: false })
    .limit(5);
  
  if (tripsError) {
    console.error('Error loading group trips:', tripsError);
  }
  
  // Map API result to GroupTrip[]
  const groupTrips: GroupTrip[] = (trips || []).map((t: any) => ({
    group_id: t.group_id,
    trip_id: t.trip_id,
    ...t
  }));
  
  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {group.emoji && <span className="mr-2">{group.emoji}</span>}
            {group.name}
          </h1>
          <p className="text-gray-500">{group.description}</p>
        </div>
        
        <Link href={`/groups/${groupId}/whiteboard`}>
          <Button className="flex items-center gap-2" size="lg">
            <PencilIcon className="h-4 w-4" />
            Collaborative Whiteboard
          </Button>
        </Link>
      </div>

      <GroupDetailClient 
        group={group} 
        membership={membership} 
        recentTrips={groupTrips} 
        isAuthenticated={!!user}
      />
    </>
  );
} 