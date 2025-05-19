import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@/utils/supabase/server';
import VotingClient from './voting-client';

// Add above VotingPage:
type Idea = {
  id: string;
  title: string;
  description?: string;
  type: 'destination' | 'date' | 'activity' | 'budget' | 'other';
  votes_up: number;
  votes_down: number;
  created_by?: string;
  created_at: string;
};

/**
 * Voting Page - Shows all ideas in a structured format for voting
 */
export default async function VotingPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  // Await params to access its properties
  const { id, slug } = await params;

  const supabase = await createServerComponentClient();

  // Get user securely
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Check if user is authenticated
  if (userError || !user) {
    console.warn('[VotingPage] User not authenticated or error fetching user:', userError);
    redirect(`/login?callback-rl=/groups/${id}/plans/${slug}/vote`);
  }

  // Fetch the group data to verify it exists and user has access
  const { data: group, error } = await supabase.from('groups').select('*').eq('id', id).single();

  if (error || !group) {
    notFound();
  }

  // Check if user is a member of the group
  const { data: membership, error: membershipError } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  // If not a member and the group is not public, redirect to group page
  if (!membership && group.visibility !== 'public') {
    redirect(`/groups/${id}`);
  }

  // Fetch all ideas for this group
  const { data: ideas } = await supabase
    .from('group_plan_ideas')
    .select('*')
    .eq('group_id', id)
    .order('type');

  // Define the Member type that matches the expected structure in VotingClient
  type Member = {
    id: string;
    user_id: string;
    profiles: {
      email: string;
      full_name: string;
      avatar_url?: string;
    };
  };

  // Get all group members
  const { data: members } = await supabase
    .from('group_members')
    .select(
      `
      id,
      user_id,
      profiles:user_id (
        email,
        full_name,
        avatar_url
      )
    `
    )
    .eq('group_id', id)
    .eq('status', 'active');

  return (
    <VotingClient
      groupId={id}
      groupName={group.name}
      initialIdeas={(ideas as Idea[]) || []}
      members={(members || []).map((member: any) => ({
        id: member?.id || '',
        user_id: member?.user_id || '',
        profiles: {
          email: member?.profiles?.[0]?.email || '',
          full_name: member?.profiles?.[0]?.full_name || '',
          avatar_url: member?.profiles?.[0]?.avatar_url || '',
        },
      }))}
      currentUserId={user.id}
    />
  );
}
