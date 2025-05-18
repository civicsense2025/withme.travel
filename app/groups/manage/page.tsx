import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Metadata } from 'next';
import { requireAuthOrGuest } from '@/utils/auth/route-helpers';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
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
    let url = user ? `${getBaseUrl()}/api/groups` : `${getBaseUrl()}/api/groups?guestToken=${guestToken}`;
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
      <PageContainer
        header={
          <PageHeader
            title="My Groups"
            description="Manage your travel groups"
            className="mb-6"
            centered={true}
            actions={
              <Link href="/groups/create" className="mt-16">
                <Button className="flex items-center rounded-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Group
                </Button>
              </Link>
            }
          />
        }
      >
        <GroupsClientPage initialGroups={groups} isGuest={isGuestMode} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="text-center p-8">
        <p className="mb-4">You don't have any groups yet.</p>
        <a href="/groups/create" className="text-blue-500 hover:underline">
          Create your first group
        </a>
      </div>
    </PageContainer>
  );
}
