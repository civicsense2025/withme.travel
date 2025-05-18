import { notFound } from 'next/navigation';
import PlansClient from './plans-client';

export default async function PlanDetailPage({ params }: { params: { id: string; slug: string } }) {
  let plan = null;
  let group = null;
  let ideas = [];
  let isAuthenticated = false;
  let guestToken = null;

  try {
    const planRes = await fetch(`/api/groups/${params.id}/plans/${params.slug}`, { cache: 'no-store' });
    if (planRes.ok) {
      const planData = await planRes.json();
      plan = planData.plan;
      group = planData.group || null;
      isAuthenticated = planData.isAuthenticated || false;
      guestToken = planData.guestToken || null;
    }
    const ideasRes = await fetch(`/api/groups/${params.id}/plans/${params.slug}/ideas`, { cache: 'no-store' });
    if (ideasRes.ok) {
      const ideasData = await ideasRes.json();
      ideas = ideasData.ideas || [];
    }
  } catch (err) {
    console.error('Error loading plan details:', err);
    return notFound();
  }

  if (!plan || !group) {
    return notFound();
  }

  return (
    <PlansClient
      group={group}
      plan={plan}
      ideas={ideas}
      isAuthenticated={isAuthenticated}
      guestToken={guestToken}
    />
  );
}
