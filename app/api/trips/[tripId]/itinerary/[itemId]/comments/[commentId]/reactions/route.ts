import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { Database } from '@/types/database.types';
import { z } from 'zod';

// Define the schema for reaction validation
const reactionSchema = z.object({
  reaction: z.string().min(1).max(10),
});

/**
 * POST handler to add a reaction to a comment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string; itemId: string; commentId: string } }
) {
  const { tripId, itemId, commentId } = params;
  const supabase = await createRouteHandlerClient();

  try {
    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate the reaction data
    const body = await request.json();
    const validation = reactionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid reaction data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { reaction } = validation.data;

    // First check if the user has access to the trip
    const { data: membership, error: membershipError } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Not a member of this trip' }, { status: 403 });
    }

    // Check if the comment exists and belongs to the specified item and trip
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('id')
      .eq('id', commentId)
      .eq('item_id', itemId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if the reaction already exists
    const { data: existingReaction, error: reactionError } = await supabase
      .from('comment_reactions')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .eq('reaction', reaction)
      .single();

    // If reaction exists, remove it (toggle behavior)
    if (!reactionError && existingReaction) {
      const { error: deleteError } = await supabase
        .from('comment_reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (deleteError) {
        return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: 'removed' });
    }

    // Add the new reaction
    const { data: newReaction, error: insertError } = await supabase
      .from('comment_reactions')
      .insert({
        comment_id: commentId,
        user_id: user.id,
        reaction: reaction,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error adding reaction:', insertError);
      return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      action: 'added',
      reaction: newReaction,
    });
  } catch (error) {
    console.error('Unexpected error handling comment reaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE handler to remove all reactions by a user on a comment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tripId: string; itemId: string; commentId: string } }
) {
  const { tripId, commentId } = params;
  const supabase = await createRouteHandlerClient();

  try {
    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user has access to the trip
    const { data: membership, error: membershipError } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Not a member of this trip' }, { status: 403 });
    }

    // Delete all reactions by this user on this comment
    const { error: deleteError } = await supabase
      .from('comment_reactions')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error removing reactions:', deleteError);
      return NextResponse.json({ error: 'Failed to remove reactions' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error removing comment reactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
