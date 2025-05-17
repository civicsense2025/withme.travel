import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/utils/supabase-server';
import { TABLES } from '@/utils/constants/tables';
import GroupsClientPage from '../groups-client';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { getGuestToken } from '@/utils/guest';
import { Metadata } from 'next';
import { requireAuthOrGuest } from '@/utils/auth/route-helpers';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

// We need to tell search engines not to index this authenticated page
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

// Set revalidation to prevent constant refreshing
export const revalidate = 300; // Revalidate every 5 minutes

export default async function GroupsManagePage() {
  // Check for authentication or guest status
  const { user, isGuest, guestToken } = await requireAuthOrGuest('/groups');

  // Get the Supabase client
  const supabase = await getServerSupabase();

  // If user is authenticated, fetch their groups
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
      console.error('[GroupsManagePage] Error fetching user groups:', err);
      groups = [];
    }

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
        <GroupsClientPage initialGroups={groups} />
      </PageContainer>
    );
  }

  // If this is a guest user, fetch their groups
  if (isGuest && guestToken) {
    try {
      const { data: groupLinks, error: guestError } = await supabase
        .from('group_guest_members')
        .select(
          `
          group_id, 
          groups!inner(
            id, 
            name, 
            description,
            created_at,
            updated_at,
            cover_image_url,
            visibility,
            created_by,
            emoji,
            status,
            slug
          )
        `
        )
        .eq('guest_token', guestToken);

      if (guestError) {
        console.error('[GroupsManagePage] Error fetching guest groups:', guestError);
      }

      if (groupLinks && groupLinks.length > 0) {
        // Use type assertion for now since we know the expected structure
        const guestGroups = groupLinks.map((link) => {
          const groupData = Array.isArray(link.groups) ? link.groups[0] : link.groups;

          return {
            id: groupData.id,
            name: groupData.name,
            description: groupData.description || null,
            created_at: groupData.created_at,
            updated_at: groupData.updated_at || groupData.created_at,
            cover_image_url: groupData.cover_image_url || null,
            visibility: groupData.visibility || 'private',
            created_by: groupData.created_by,
            emoji: groupData.emoji || null,
            status: groupData.status || 'active',
            slug: groupData.slug || `group-${groupData.id}`, // Add slug with fallback
            group_members: [], // Empty as we don't have member data
            trip_count: [{ count: 0 }], // Default to 0 trips
          };
        });

        return (
          <PageContainer>
            <GroupsClientPage initialGroups={guestGroups} isGuest={true} />
          </PageContainer>
        );
      }
    } catch (err) {
      console.error('[GroupsManagePage] Error processing guest groups:', err);
    }
  }

  // If we reach here, there are no groups for this user or guest
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
