import { redirect } from 'next/navigation';
import { Text } from '@/components/ui/Text';
import { Metadata } from 'next';
import { requireAuthOrGuest } from '@/utils/auth/route-helpers';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/Section';
import Link from 'next/link';
import GroupsClientPage from '../groups-client';

// We need to tell search engines not to index this authenticated page
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

// Set revalidation to prevent constant refreshing
export const revalidate = 300; // Revalidate every 5 minutes

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export default async function GroupsManagePage() {
  const { user, isGuest, guestToken } = await requireAuthOrGuest('/groups');
  let groups = [];
  let isGuestMode = false;

  try {
    let url = user
      ? `${getBaseUrl()}/api/groups`
      : `${getBaseUrl()}/api/groups?guestToken=${guestToken}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      groups = data.groups || [];
      isGuestMode = !!guestToken && !user;
    }
  } catch (err) {
    console.error('[GroupsManagePage] Error fetching groups:', err);
    groups = [];
  }

  if (groups.length > 0) {
    return (
      <>
        <Section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/50">
          <div className="text-center max-w-3xl mx-auto">
            <Text as="h1" className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              My Groups
          </Text>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/groups/create" passHref>
              <Button variant="default" className="px-8 py-3">
                Create Group
              </Button>
            </Link>
          </div>
        </div>
      </Section>
      <GroupsClientPage initialGroups={groups} isGuest={isGuestMode} />
      </>
    );
  }

  return (
    <Section>
      <div className="text-center p-8">
        <p className="mb-4">You don't have any groups yet.</p>
        <a href="/groups/create" className="text-blue-500 hover:underline">
          Create your first group
        </a>
      </div>
    </Section>
  );
}
