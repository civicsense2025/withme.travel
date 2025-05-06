import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createServerComponentClient } from '@/utils/supabase/server';
import { FIELDS } from '@/utils/constants/database';
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
    .from('groups')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !group) {
    console.error('Group not found:', error);
    notFound();
  }

  // Check if user is authenticated
  if (!user) {
    redirect(`/login?redirect=/groups/${params.id}/plans`);
  }

  // Check if user is a member of the group
  const { data: membership, error: membershipError } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', params.id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();
  
  // If not a member, redirect to group page
  if (!membership) {
    redirect(`/groups/${params.id}`);
  }

  // Fetch initial plans to pass to client component - avoid selecting user_metadata directly
  const { data: plans, error: plansError } = await supabase
    .from('group_idea_plans')
    .select(`
      *,
      creator:created_by(
        id,
        email
      ),
      ideas:group_ideas(id)
    `)
    .eq('group_id', params.id)
    .order('created_at', { ascending: false });
  
  if (plansError) {
    console.error('Error fetching plans:', plansError);
  }
  
  // Process plans to include idea count
  const processedPlans = plans?.map(plan => ({
    ...plan,
    ideas_count: plan.ideas?.length || 0,
    ideas: undefined, // Don't pass all ideas to client, just the count
    creator: plan.creator ? {
      ...plan.creator,
      user_metadata: {} // Add an empty user_metadata object to match expected interface
    } : undefined
  })) || [];

  // Debug logs
  console.log('Plans page rendering with:');
  console.log('groupId:', params.id);
  console.log('user:', user?.id);
  console.log('membership:', membership?.role);
  console.log('plans count:', processedPlans.length);

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