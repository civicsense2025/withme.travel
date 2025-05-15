import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/utils/supabase-server';
import { getGuestToken } from '@/utils/guest';
import GroupsLandingPageClient from './components/groups-landing-page-client';

// Add revalidation to prevent constant refreshing
export const revalidate = 300; // Revalidate every 5 minutes

// Groups page: public landing if not logged in, redirects to manage if logged in
export default async function GroupsPage() {
  // Always create a Supabase client (uses guest token if not logged in)
  const supabase = await getServerSupabase();

  // Guest logic: check for guest token and fetch their groups
  const guestToken = await getGuestToken();
  if (guestToken) {
    const { data: groupLinks } = await supabase
      .from('group_guest_members')
      .select('group_id')
      .eq('guest_token', guestToken);
    if (groupLinks && groupLinks.length > 0) {
      redirect('/groups/manage');
    }
  }

  // Show the landing page to everyone
  return <GroupsLandingPageClient />;
}
