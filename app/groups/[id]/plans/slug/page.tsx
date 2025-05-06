import { notFound, redirect } from 'next/navigation';
import { createServerComponentClient } from '@/utils/supabase/server';
import { TABLES, FIELDS } from '@/utils/constants/database';
import PlanIdeasClient from './plan-ideas-client';

interface PlanPageProps {
  params: {
    id: string;    // Group ID
    slug: string; // Plan slug
  };
}

export default async function PlanPage({ params }: PlanPageProps) {
  const supabase = await createServerComponentClient();
  
  // Get user securely
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  // If not authenticated, redirect to login
  if (!user) {
    redirect(`/login?redirect=/groups/${params.id}/plans/${params.slug}`);
  }
  
  // Fetch the group to check membership
  const { data: group } = await supabase
    .from(TABLES.GROUPS)
    .select('*, members:group_members(*)')
    .eq('id', params.id)
    .single();
  
  if (!group) {
    notFound();
  }
  
  // Check if user is a member
  const isMember = group.members.some((member: any) => member.user_id === user.id);
  if (!isMember) {
    redirect(`/groups/${params.id}`);
  }
  
  // Fetch the plan by slug
  const { data: plan } = await supabase
    .from(TABLES.GROUP_IDEA_PLANS)
    .select('*')
    .eq('group_id', params.id)
    .eq('slug', params.slug)
    .single();
  
  if (!plan) {
    notFound();
  }
  
  // Fetch ideas for this plan
  const { data: ideas } = await supabase
    .from(TABLES.GROUP_IDEAS)
    .select('*')
    .eq('plan_id', plan.id)
    .order('created_at', { ascending: false });
  
  // Determine if user is admin or creator
  const isAdmin = group.members.some((member: any) => 
    member.user_id === user.id && member.role === 'admin'
  );
  const isCreator = plan.created_by === user.id;
  
  return (
    <main className="flex-1 pb-16">
      <PlanIdeasClient
        groupId={params.id}
        planId={plan.id}
        planSlug={params.slug}
        planName={plan.name}
        groupName={group.name}
        initialIdeas={ideas || []}
        isAdmin={isAdmin}
        isCreator={isCreator}
        userId={user.id}
      />
    </main>
  );
} 