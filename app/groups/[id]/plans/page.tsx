import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createServerComponentClient } from '@/utils/supabase/server';
import { FIELDS } from '@/utils/constants/database';
import PlansClient from './plans-client';
import { getGuestToken } from '@/utils/guest';

/**
 * Group Plans Page - Shows all idea boards for a group
 */
export default async function PlansPage({ params }: { params: { id: string } }) {
  const awaitedParams = await params;
  const supabase = await createServerComponentClient();

  // Get user securely
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Fetch the group data to verify it exists
  const { data: group, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', awaitedParams.id)
    .single();

  if (error || !group) {
    console.error('Group not found:', error);
    notFound();
  }

  // Check if user is authenticated - if not, try to get guest token
  let membership = null;
  let isGuest = false;
  let isAdmin = false;
  let guestToken = null;

  if (user) {
    // Check if authenticated user is a member of the group
    const { data: memberData, error: membershipError } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', awaitedParams.id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    membership = memberData;

    // If authenticated but not a member, redirect to group page
    if (!membership) {
      redirect(`/groups/${awaitedParams.id}`);
    }

    // Set admin status for authenticated user
    isAdmin = membership?.role === 'admin' || membership?.role === 'owner';
  } else {
    // Handle guest access
    guestToken = await getGuestToken();

    if (!guestToken) {
      // If no guest token, redirect to login
      redirect(`/login?redirect=/groups/${awaitedParams.id}/plans`);
    }

    isGuest = true;
    // Guests are not admins
    isAdmin = false;
  }

  // Fetch initial plans to pass to client component - avoid selecting user_metadata directly
  const { data: plans, error: plansError } = await supabase
    .from('group_plans')
    .select(
      `
      *,
      creator:created_by(
        id,
        email,
        name,
        avatar_url,
        username
      ),
      ideas:group_ideas(id)
    `
    )
    .eq('group_id', awaitedParams.id)
    .order('created_at', { ascending: false });

  if (plansError) {
    console.error('Error fetching plans:', plansError);
  }

  // Process plans to include idea count
  const processedPlans =
    plans?.map((plan) => ({
      ...plan,
      group_id: plan.group_id ?? '',
      id: plan.id ?? '',
      name: plan.name ?? '',
      slug: plan.slug ?? '',
      created_by: plan.created_by ?? '',
      created_at: plan.created_at ?? '',
      updated_at: plan.updated_at ?? '',
      ideas_count: plan.ideas?.length || 0,
      ideas: undefined, // Don't pass all ideas to client, just the count
      is_archived: plan.is_archived ?? false,
      creator: plan.creator
        ? {
            id: plan.creator.id ?? '',
            email: plan.creator.email ?? '',
            user_metadata: {},
          }
        : { id: '', email: '', user_metadata: {} },
    })) || [];

  // Debug logs
  console.log('Plans page rendering with:');
  console.log('groupId:', awaitedParams.id);
  console.log('user:', user?.id || 'guest');
  console.log('isGuest:', isGuest);
  console.log('membership:', membership?.role || 'none');
  console.log('plans count:', processedPlans.length);

  return (
    <Suspense fallback={<div className="flex justify-center p-6">Loading plans...</div>}>
      <PlansClient
        groupId={awaitedParams.id}
        initialPlans={processedPlans}
        groupName={group.name}
        groupEmoji={group.emoji}
        isAdmin={isAdmin}
        userId={user?.id || `guest:${guestToken}`}
        isGuest={isGuest}
      />
    </Suspense>
  );
}
