import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createServerComponentClient } from '@/utils/supabase/server';
import { TABLES, FIELDS } from '@/utils/constants/database';
import PlansClient from './plans-client';

/**
 * Group Plans Page - Shows all idea boards for a group
 */
export default async function PlansPage({ params }: { params: { id: string } }) {
  const supabase = await createServerComponentClient();
  
  // Get user securely
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  // Fetch the group data to verify it exists and user has access
  const { data: group, error } = await supabase
    .from(TABLES.GROUPS)
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !group) {
    notFound();
  }

  // Check if user is authenticated
  if (!user) {
    redirect(`/login?redirect=/groups/${params.id}/plans`);
  }

  // Check if user is a member of the group
  const { data: membership, error: membershipError } = await supabase
    .from(TABLES.GROUP_MEMBERS)
    .select('*')
    .eq('group_id', params.id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();
  
  // If not a member, redirect to group page
  if (!membership) {
    redirect(`/groups/${params.id}`);
  }

  // Fetch initial plans to pass to client component
  const { data: plans } = await supabase
    .from(TABLES.GROUP_IDEA_PLANS)
    .select(`
      *,
      creator:${FIELDS.GROUP_IDEA_PLANS.CREATED_BY}(
        id,
        email,
        user_metadata
      ),
      ideas:${TABLES.GROUP_IDEAS}(id)
    `)
    .eq(FIELDS.GROUP_IDEA_PLANS.GROUP_ID, params.id)
    .order(FIELDS.GROUP_IDEA_PLANS.CREATED_AT, { ascending: false });
  
  // Process plans to include idea count
  const processedPlans = plans?.map(plan => ({
    ...plan,
    ideas_count: plan.ideas?.length || 0,
    ideas: undefined // Don't pass all ideas to client, just the count
  })) || [];

  // Check if user is an admin of the group
  const isAdmin = membership.role === 'admin' || membership.role === 'owner';

  return (
    <Suspense fallback={<div className="flex justify-center p-6">Loading plans...</div>}>
      <PlansClient 
        groupId={params.id}
        initialPlans={processedPlans}
        groupName={group.name}
        groupEmoji={group.emoji}
        isAdmin={isAdmin}
        userId={user.id}
      />
    </Suspense>
  );
} 