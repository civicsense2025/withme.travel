import { notFound, redirect } from 'next/navigation';
import { createServerComponentClient } from '@/utils/supabase/server';
import { getGuestToken } from '@/utils/guest';
import { TABLES } from '@/utils/constants/tables';
import PlansClient from './plans-client';

export default async function PlanDetail({
  params,
}: {
  params: { id: string; slug: string };
}) {
  const supabase = await createServerComponentClient();
  
  // Get user securely
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser().catch(error => {
    console.error('Error getting user:', error);
    // Return empty data to prevent app from crashing
    return { data: { user: null }, error };
  });
  
  // Get the guest token for non-authenticated users
  const guestToken = await getGuestToken().catch(error => {
    console.error('Error getting guest token:', error);
    return null;
  });
  
  // Check if user is authenticated or has a guest token
  if (!user && !guestToken) {
    redirect(`/login?redirect=/groups/${params.id}/plans/${params.slug}`);
  }
  
  // Fetch the group to verify it exists
  const { data: group, error: groupError } = await supabase
    .from(TABLES.GROUPS)
    .select('*')
    .eq('id', params.id)
    .single();
  
  if (groupError || !group) {
    console.error('Group not found:', groupError);
    notFound();
  }
  
  // Fetch the plan by slug
  const { data: plan, error: planError } = await supabase
    .from(TABLES.GROUP_PLANS)
    .select('*')
    .eq('group_id', params.id)
    .eq('slug', params.slug)
    .single();
  
  if (planError || !plan) {
    console.error('Plan not found:', planError);
    notFound();
  }
  
  // Check if user is a member of the group
  let membership = null;
  if (user) {
    const { data: memberData } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('*')
      .eq('group_id', params.id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    
    membership = memberData;
  }
  
  // If authenticated but not a member, redirect to group page
  if (user && !membership && !user.app_metadata?.is_admin) {
    redirect(`/groups/${params.id}`);
  }
  
  // Determine if the user is an admin or creator
  const isAdmin = membership?.role === 'admin' || membership?.role === 'owner' || !!user?.app_metadata?.is_admin;
  const isCreator = plan.created_by === user?.id;
  const isGuest = !user && !!guestToken;
  
  // Fetch ideas for this plan
  const { data: ideas } = await supabase
    .from(TABLES.GROUP_PLAN_IDEAS)
    .select('*')
    .eq('plan_id', plan.id)
    .order('created_at', { ascending: false });
  
  const userId = user?.id || `guest:${guestToken}`;
  
  return (
    <PlansClient
      groupId={params.id}
      planId={plan.id}
      planSlug={params.slug}
      planName={plan.name}
      groupName={group.name}
      initialIdeas={ideas || []}
      isAdmin={isAdmin}
      isCreator={isCreator}
      userId={userId}
      isAuthenticated={!!user}
      isGuest={isGuest}
      guestToken={guestToken}
    />
  );
}
