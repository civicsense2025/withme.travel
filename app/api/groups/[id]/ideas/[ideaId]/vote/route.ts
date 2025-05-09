import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES, ENUMS } from '@/utils/constants/tables';
import { z } from 'zod';

// Validation schema for vote data
const voteSchema = z.object({
  vote_type: z.enum(['up', 'down']),
  remove: z.boolean().optional()
});

/**
 * POST /api/groups/[id]/ideas/[ideaId]/vote
 * Adds or updates a vote on a group idea.
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string; ideaId: string } }
) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Check if the user is a member of the group
    const { data: membership, error: membershipError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('*')
      .eq('group_id', params.id)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (membershipError) {
      console.error('Error checking group membership:', membershipError);
      return NextResponse.json({ error: 'Error checking group membership' }, { status: 500 });
    }
    
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }
    
    // Check if the idea exists and belongs to the group
    const { data: idea, error: ideaError } = await supabase
      .from(TABLES.GROUP_PLAN_IDEAS)
      .select('id')
      .eq('id', params.ideaId)
      .eq('group_id', params.id)
      .single();
    
    if (ideaError || !idea) {
      return NextResponse.json({ error: 'Idea not found or does not belong to this group' }, { status: 404 });
    }
    
    // Parse and validate the request body
    const body = await request.json();
    
    try {
      voteSchema.parse(body);
    } catch (validationError) {
      return NextResponse.json({ error: 'Invalid vote data' }, { status: 400 });
    }
    
    // Check if this is a request to remove a vote
    if (body.remove) {
      // Delete any existing vote
      const { error: deleteError } = await supabase
        .from(TABLES.GROUP_PLAN_IDEA_VOTES)
        .delete()
        .eq('idea_id', params.ideaId)
        .eq('user_id', user.id);
      
      if (deleteError) {
        console.error('Error removing vote:', deleteError);
        return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 });
      }
      
      // Update vote counts
      await updateVoteCounts(supabase, params.ideaId);
      
      return NextResponse.json({ success: true, message: 'Vote removed successfully' });
    }
    
    // Check if the user has already voted on this idea
    const { data: existingVote, error: voteCheckError } = await supabase
      .from(TABLES.GROUP_PLAN_IDEA_VOTES)
      .select('id, vote_type')
      .eq('idea_id', params.ideaId)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (voteCheckError) {
      console.error('Error checking existing vote:', voteCheckError);
      return NextResponse.json({ error: 'Failed to check existing vote' }, { status: 500 });
    }
    
    // If there's an existing vote with the same type, return success
    if (existingVote && existingVote.vote_type === body.vote_type) {
      return NextResponse.json({ success: true, changed: false });
    }
    
    // Create vote data object
    const voteData = {
      idea_id: params.ideaId,
      user_id: user.id,
      vote_type: body.vote_type
    };
    
    // If there's an existing vote with a different type, update it
    if (existingVote) {
      const { error: updateError } = await supabase
        .from(TABLES.GROUP_PLAN_IDEA_VOTES)
        .update({ vote_type: body.vote_type })
        .eq('id', existingVote.id);
      
      if (updateError) {
        console.error('Error updating vote:', updateError);
        return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 });
      }
    } else {
      // Otherwise, insert a new vote
      const { error: insertError } = await supabase
        .from(TABLES.GROUP_PLAN_IDEA_VOTES)
        .insert(voteData);
      
      if (insertError) {
        console.error('Error creating vote:', insertError);
        return NextResponse.json({ error: 'Failed to create vote' }, { status: 500 });
      }
    }
    
    // Update the idea's vote counts
    await updateVoteCounts(supabase, params.ideaId);
    
    return NextResponse.json({ 
      success: true, 
      changed: true,
      vote_type: body.vote_type
    });
    
  } catch (error) {
    console.error('Error processing vote request:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * Helper function to update vote counts for an idea
 */
async function updateVoteCounts(supabase: any, ideaId: string) {
  try {
    // Count up votes
    const { count: upVotes } = await supabase
      .from(TABLES.GROUP_PLAN_IDEA_VOTES)
      .select('id', { count: 'exact', head: true })
      .eq('idea_id', ideaId)
      .eq('vote_type', 'up');
    
    // Count down votes
    const { count: downVotes } = await supabase
      .from(TABLES.GROUP_PLAN_IDEA_VOTES)
      .select('id', { count: 'exact', head: true })
      .eq('idea_id', ideaId)
      .eq('vote_type', 'down');
    
    // Update the idea with the new vote counts
    await supabase
      .from(TABLES.GROUP_PLAN_IDEAS)
      .update({
        votes_up: upVotes || 0,
        votes_down: downVotes || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', ideaId);
    
  } catch (error) {
    console.error('Error updating vote counts:', error);
  }
} 