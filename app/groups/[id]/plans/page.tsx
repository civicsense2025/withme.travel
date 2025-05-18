import { notFound } from 'next/navigation';
import PlansClient from './plans-client';

/**
 * Group Plans Page - Shows all idea boards for a group
 */
export default async function GroupPlansPage({ params }: { params: { id: string } }) {
  let plans = [];
  let group = null;
  let isAuthenticated = false;
  let guestToken = null;

  try {
    const res = await fetch(`/api/groups/${params.id}/plans`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      plans = data.plans || [];
      group = data.group || null;
      isAuthenticated = data.isAuthenticated || false;
      guestToken = data.guestToken || null;
    }
  } catch (err) {
    console.error('Error loading group plans:', err);
    return notFound();
  }

  if (!group) {
    return notFound();
  }

  return (
    <PlansClient
      group={group}
      plans={plans}
      isAuthenticated={isAuthenticated}
      guestToken={guestToken}
    />
  );
}
