import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/utils/supabase-server';
import GroupsClientPage from './groups-client';
import GroupsLandingPage from './components/landing-page';
import { getGuestToken } from '@/utils/guest';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';
import { Section } from '@/components/ui/section';

// Add revalidation to prevent constant refreshing
export const revalidate = 300; // Revalidate every 5 minutes

// Groups page: public landing if not logged in, redirects to manage if logged in
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

  // If user is authenticated, redirect to the manage page
  if (user) {
    redirect('/groups/manage');
  }

  // Guest logic: check for guest token and fetch their groups
  const guestToken = await getGuestToken();
  let hasGuestGroups = false;

  if (guestToken) {
    const { data: groupLinks } = await supabase
      .from('group_guest_members')
      .select('group_id')
      .eq('guest_token', guestToken);

    if (groupLinks && groupLinks.length > 0) {
      hasGuestGroups = true;
      redirect('/groups/manage');
    }
  }

  // No user and no guest groups, show the landing page
  return (
    <PageContainer
      header={
        <Section>
          <div className="text-center">
            <Heading level={1} size="large" align="center">
              Groups
            </Heading>
            <Text variant="large" className="text-muted-foreground max-w-2xl mx-auto">
              Create and manage travel groups with friends and family.
            </Text>
          </div>
        </Section>
      }
    >
      <GroupsLandingPage />
    </PageContainer>
  );
}
