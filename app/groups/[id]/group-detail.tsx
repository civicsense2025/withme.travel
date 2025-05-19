import { notFound } from 'next/navigation';
import GroupDetailClient from './group-detail-client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Group details page - Shows details for a specific group
export default async function GroupDetailPage({ groupId }: { groupId: string }) {
  let group = null;
  let membership = null;
  let recentTrips = [];
  let isAuthenticated = false;
  let guestToken = null;

  try {
    // Use absolute URL for server-side fetches in Next.js
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/groups/${groupId}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      group = data.group;
      membership = data.membership || null;
      recentTrips = data.recentTrips || [];
      isAuthenticated = data.isAuthenticated || false;
      guestToken = data.guestToken || null;
    }
  } catch (err) {
    console.error('Error loading group:', err);
    return notFound();
  }

  if (!group) {
    return notFound();
  }

  if (!isAuthenticated && !guestToken) {
    return (
      <div className="container max-w-2xl py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">You need to join this group to view details</h2>
        <p className="mb-6">Sign up or use a guest invite link to access this group.</p>
        <Link href="/signup">
          <Button>Sign up</Button>
        </Link>
      </div>
    );
  }

  return (
    <GroupDetailClient
      group={group}
      membership={membership}
      recentTrips={recentTrips}
      isAuthenticated={isAuthenticated}
      guestToken={guestToken}
    />
  );
}
