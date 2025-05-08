import { getServerSupabase } from '@/utils/supabase-server';
import GroupsClientPage from './groups-client';
import GroupsLandingPage from './components/landing-page';
import { getGuestToken } from '@/utils/guest';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';

// Groups page: public landing if not logged in, dashboard if logged in
export default async function GroupsPage() {
  // Always create a Supabase client (uses guest token if not logged in)
  const supabase = await getServerSupabase();

  // Try to get the user (will be null for guests)
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      user = data.user;
    }
  } catch (err) {
    user = null;
  }

  // If user is authenticated, show dashboard
  if (user) {
    // Fetch groups for authenticated user
    let groups = [];
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`*, group_members(user_id, role, status), trip_count:group_trips(count)`)
        .eq('group_members.user_id', user.id)
        .eq('group_members.status', 'active');
      if (!error && data) {
        groups = data;
      }
    } catch (err) {
      groups = [];
    }
    return <GroupsClientPage initialGroups={groups} />;
  }

  // Guest logic: check for guest token and fetch their groups
  const guestToken = await getGuestToken();
  let guestGroups: any[] = [];
  if (guestToken) {
    const { data: groupLinks } = await supabase
      .from('group_guest_members')
      .select('group_id, groups!inner(id, name, emoji)')
      .eq('guest_token', guestToken);
    if (groupLinks && groupLinks.length > 0) {
      guestGroups = groupLinks.map(link => link.groups);
    }
  }

  return (
    <>

      <GroupsLandingPage />
    </>
  );
} 