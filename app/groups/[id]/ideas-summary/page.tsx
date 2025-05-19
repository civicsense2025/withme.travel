/**
 * Group Plan Ideas Summary Page
 *
 * Provides an overview of all ideas across all plans in a group
 * with filtering, sorting, and visualization options.
 */

import { notFound } from 'next/navigation';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';
import IdeasSummaryClient from './ideas-summary-client';

/**
 * Group Ideas Summary Page component
 */
export default async function GroupIdeasSummaryPage({ params }: { params: { id: string } }) {
  // Initialize data variables
  let group: any = null;
  let ideas: any[] = [];
  let isAuthenticated = false;
  let memberRole = null;

  try {
    // Get Supabase client
    const supabase = await createRouteHandlerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.get-ser();
    isAuthenticated = !!user;

    // Fetch group data
    const { data: groupData, error: groupError } = await supabase
      .from(TABLES.GROUPS)
      .select('*')
      .eq('id', params.id)
      .single();

    if (groupError || !groupData) {
      console.error('Error fetching group:', groupError);
      return notFound();
    }

    group = groupData;

    // If authenticated, check membership and role
    if (user) {
      const { data: memberData, error: memberError } = await supabase
        .from(TABLES.GROUP_MEMBERS)
        .select('role')
        .eq('group_id', params.id)
        .eq('user_id', user.id)
        .single();

      if (!memberError && memberData) {
        memberRole = memberData.role;
      }
    }

    // Fetch all ideas for this group
    const { data: ideasData, error: ideasError } = await supabase
      .from(TABLES.GROUP_PLAN_IDEAS)
      .select(
        `
        *,
        creator:created_by(id, email, user_metadata),
        plan:plan_id(id, name, description)
      `
      )
      .eq('group_id', params.id)
      .order('created_at', { ascending: false });

    if (ideasError) {
      console.error('Error fetching ideas:', ideasError);
    } else {
      ideas = ideasData || [];
    }
  } catch (error) {
    console.error('Error in Group Ideas Summary Page:', error);
    return notFound();
  }

  // Return 404 if group not found
  if (!group) {
    return notFound();
  }

  return (
    <IdeasSummaryClient
      group={group}
      ideas={ideas}
      isAuthenticated={isAuthenticated}
      memberRole={memberRole}
    />
  );
}
