import { getServerSupabase } from '@/utils/supabase-server';
import { TABLES } from '@/utils/constants/database';
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
      .from(TABLES.GROUPS)
      .select(`
        *,
        ${TABLES.GROUP_MEMBERS} (
          user_id,
          role,
          status
        ),
        trip_count:${TABLES.GROUP_TRIPS}(count)
      `)
      .eq(`${TABLES.GROUP_MEMBERS}.user_id`, userId)
      .eq(`${TABLES.GROUP_MEMBERS}.status`, 'active');
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