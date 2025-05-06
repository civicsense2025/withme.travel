import { getServerSupabase } from '@/utils/supabase-server';
import GroupsClientPage from './groups-client';
import GroupsLandingPage from './components/landing-page';

// Groups page: public landing if not logged in, dashboard if logged in
export default async function GroupsPage() {
  const supabase = await getServerSupabase();
  // Get user securely
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('Error fetching user:', userError);
    // Handle error as appropriate, maybe redirect to login with error
  }

  if (!user) {
    // Not logged in: show public landing page
    return <GroupsLandingPage />;
  }

  const userId = user.id;
  let groups = [];
  try {
    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        ${'group_members'} (
          user_id,
          role,
          status
        ),
        trip_count:${'group_trips'}(count)
      `)
      .eq(`${'group_members'}.user_id`, userId)
      .eq(`${'group_members'}.status`, 'active');
    if (error) {
      console.error('Error loading groups:', error);
    } else {
      groups = data || [];
    }
  } catch (err) {
    console.error('Unexpected error loading groups:', err);
  }

  return <GroupsClientPage initialGroups={groups} />;
} 