import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { getGuestToken } from '@/utils/guest';
import { z } from 'zod';
import { TABLES } from '@/utils/constants/tables';

// Validation schema for vote data
const voteSchema = z.object({
  vote_type: z.enum(['UP', 'DOWN']),
  remove: z.boolean().optional()
});

/**
 * POST /api/groups/[id]/plans/[planId]/ideas/[ideaId]/vote
 * Adds a vote to an idea.
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string; ideaId: string } }
) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get the current user if authenticated
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    // Get guest token if not authenticated
    const guestToken = user ? null : await getGuestToken();
    
    // Require either user auth or guest token
    if (!user && !guestToken) {
      return NextResponse.json(
        { error: 'Authentication required to vote on ideas' },
        { status: 401 }
      );
    }
    
    // Verify the idea exists and belongs to the group
    const { data: idea, error: ideaError } = await supabase
      .from(TABLES.GROUP_IDEAS)
      .select('id')
      .eq('id', params.ideaId)
      .eq('group_id', params.id)
      .single();
    
    if (ideaError || !idea) {
      return NextResponse.json(
        { error: 'Idea not found or not accessible' },
        { status: 404 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    
    try {
      voteSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Validation error', 
            details: validationError.errors 
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Invalid vote data' },
        { status: 400 }
      );
    }
    
    // Check if this is a request to remove a vote
    if (body.remove) {
      // Delete any existing vote
      const { error: deleteError } = await supabase
        .from('group_idea_votes')
        .delete()
        .eq('idea_id', params.ideaId)
        .or(
          user 
            ? `user_id.eq.${user.id}`
            : `guest_token.eq.${guestToken}`
        );
      
      if (deleteError) {
        console.error('Error removing vote:', deleteError);
        return NextResponse.json(
          { error: 'Failed to remove vote' },
          { status: 500 }
        );
      }
      
      // Update the idea's vote counts
      await updateVoteCounts(supabase, params.ideaId);
      
      return NextResponse.json({ success: true });
    }
    
    // Check if the user/guest has already voted on this idea
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('group_idea_votes')
      .select('id, vote_type')
      .eq('idea_id', params.ideaId)
      .or(
        user 
          ? `user_id.eq.${user.id}`
          : `guest_token.eq.${guestToken}`
      )
      .maybeSingle();
    
    if (voteCheckError) {
      console.error('Error checking existing vote:', voteCheckError);
      return NextResponse.json(
        { error: 'Failed to check existing vote' },
        { status: 500 }
      );
    }
    
    // If there's an existing vote with the same type, just return success
    if (existingVote && existingVote.vote_type === body.vote_type) {
      return NextResponse.json({ success: true, changed: false });
    }
    
    // Create the vote data object
    const voteData = {
      idea_id: params.ideaId,
      user_id: user?.id || null,
      guest_token: !user ? guestToken : null,
      vote_type: body.vote_type
    };
    
    // If there's an existing vote with a different type, update it
    if (existingVote) {
      const { error: updateError } = await supabase
        .from('group_idea_votes')
        .update({ vote_type: body.vote_type })
        .eq('id', existingVote.id);
      
      if (updateError) {
        console.error('Error updating vote:', updateError);
        return NextResponse.json(
          { error: 'Failed to update vote' },
          { status: 500 }
        );
      }
    } else {
      // Otherwise, insert a new vote
      const { error: insertError } = await supabase
        .from('group_idea_votes')
        .insert(voteData);
      
      if (insertError) {
        console.error('Error creating vote:', insertError);
        return NextResponse.json(
          { error: 'Failed to create vote' },
          { status: 500 }
        );
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
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]/plans/[planId]/ideas/[ideaId]/vote
 * Removes a vote from an idea.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; ideaId: string } }
) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get the current user if authenticated
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    // Get guest token if not authenticated
    const guestToken = user ? null : await getGuestToken();
    
    // Require either user auth or guest token
    if (!user && !guestToken) {
      return NextResponse.json(
        { error: 'Authentication required to vote on ideas' },
        { status: 401 }
      );
    }
    
    // Delete any existing vote
    const { error: deleteError } = await supabase
      .from('group_idea_votes')
      .delete()
      .eq('idea_id', params.ideaId)
      .or(
        user 
          ? `user_id.eq.${user.id}`
          : `guest_token.eq.${guestToken}`
      );
    
    if (deleteError) {
      console.error('Error removing vote:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove vote' },
        { status: 500 }
      );
    }
    
    // Update the idea's vote counts
    await updateVoteCounts(supabase, params.ideaId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing vote:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to update vote counts for an idea
 */
async function updateVoteCounts(supabase: any, ideaId: string) {
  try {
    // Count up votes
    const { count: upVotes } = await supabase
      .from('group_idea_votes')
      .select('id', { count: 'exact', head: true })
      .eq('idea_id', ideaId)
      .eq('vote_type', 'UP');
    
    // Count down votes
    const { count: downVotes } = await supabase
      .from('group_idea_votes')
      .select('id', { count: 'exact', head: true })
      .eq('idea_id', ideaId)
      .eq('vote_type', 'DOWN');
    
    // Update the idea with the new vote counts
    await supabase
      .from(TABLES.GROUP_IDEAS)
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