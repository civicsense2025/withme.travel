import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';

// POST handler for adding a reaction to a comment
export async function POST(
  req: NextRequest,
  { params }: { params: { tripId: string; itemId: string; commentId: string } }
) {
  const { tripId, itemId, commentId } = params;
  const supabase = await createRouteHandlerClient();

  try {
    // Authenticate the request
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has access to this trip
    const { data: tripAccess } = await supabase
      .from(TABLES.TRIPS)
      .select('id')
      .eq('id', tripId)
      .or(`created_by.eq.${user.id},is_public.eq.true`)
      .single();

    if (!tripAccess) {
      return NextResponse.json(
        { error: 'Trip not found or no access' },
        { status: 404 }
      );
    }

    // Verify comment exists and belongs to this item
    const { data: comment } = await supabase
      .from('itinerary_item_comments')
      .select('id')
      .eq('id', commentId)
      .eq('item_id', itemId)
      .single();

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Get the emoji from request body
    const { emoji } = await req.json();

    if (!emoji || typeof emoji !== 'string') {
      return NextResponse.json(
        { error: 'Valid emoji is required' },
        { status: 400 }
      );
    }

    // Check if user already reacted with this emoji
    const { data: existingReaction } = await supabase
      .from('itinerary_comment_reactions')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .eq('emoji', emoji)
      .maybeSingle();

    // If reaction exists, toggle it off (remove it)
    if (existingReaction) {
      const { error: deleteError } = await supabase
        .from('itinerary_comment_reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (deleteError) {
        console.error('Error removing reaction:', deleteError);
        return NextResponse.json(
          { error: 'Failed to remove reaction' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        action: 'removed',
        emoji 
      });
    }

    // Create new reaction
    const { data: newReaction, error: insertError } = await supabase
      .from('itinerary_comment_reactions')
      .insert({
        comment_id: commentId,
        user_id: user.id,
        emoji
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error adding reaction:', insertError);
      return NextResponse.json(
        { error: 'Failed to add reaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      action: 'added',
      reaction: newReaction 
    });
  } catch (error) {
    console.error('Error processing reaction request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 