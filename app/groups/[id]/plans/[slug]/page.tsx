import { notFound, redirect } from 'next/navigation';
import { createServerComponentClient } from '@/utils/supabase/server';
import IdeasWhiteboard from './ideas-whiteboard';
import { getGuestToken, setGuestToken } from '@/utils/guest';

interface PlanPageProps {
  params: {
    id: string;    // Group ID
    slug: string; // Plan slug
  };
}

export default async function PlanPage({ params: rawParams }: PlanPageProps) {
  // Properly await all dynamic route params
  const params = await Promise.resolve(rawParams);
  const groupId = params.id;
  const planSlug = params.slug;
  
  // Create Supabase client first - this is an async operation
  const supabase = await createServerComponentClient();
  
  // Get current user session or guest token
  const { data: { user } } = await supabase.auth.getUser();
  
  // Use synchronous getGuestToken (no await needed)
  let guestToken = getGuestToken();
  
  // If no user and no guest token, create a new guest token
  if (!user && !guestToken) {
    guestToken = setGuestToken();
  }

  // Check if group exists and user has access to it (member, admin, or guest)
  const { data: group } = await supabase
    .from('groups')
    .select('*, members:group_members(*)')
    .eq('id', groupId)
    .single();
  
  if (!group) {
    return notFound();
  }
  
  // Get the plan by slug
  const { data: plan } = await supabase
    .from('group_idea_plans')
    .select('*')
    .eq('group_id', groupId)
    .eq('slug', planSlug)
    .single();
  
  if (!plan) {
    return notFound();
  }

  // Check user's membership or if guest token is the creator of this plan
  const isGuest = !user && !!guestToken;
  const isCreator = user ? plan.created_by === user.id : plan.created_by_guest_token === guestToken;
  const isAdmin = user && group.members?.some((member: any) => member.user_id === user.id && member.role === 'admin');
  const isGroupMember = user && group.members?.some((member: any) => member.user_id === user.id);

  // Allow access to the plan for all users, including guests
  // This is because we want to enable collaboration with minimal friction

  // Render the whiteboard if the user has access
  return (
    <IdeasWhiteboard 
      groupId={groupId}
      groupName={group.name}
      isAuthenticated={!!user}
      isGuest={isGuest}
      guestToken={guestToken}
      isAdmin={!!isAdmin}
      isCreator={isCreator}
      planSlug={planSlug}
      planId={plan.id}
    />
  );
} 