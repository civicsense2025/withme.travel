import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { TABLES } from '@/utils/constants/tables';

// GET handler to fetch all reactions for an itinerary item
export async function GET(
  req: NextRequest,
  context: { params: { tripId: string; itemId: string } }
) {
  // Await the params object before using its properties
  const { tripId, itemId } = await context.params;
  const supabase = await createRouteHandlerClient();

  try {
    // Authenticate the request
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has access to this trip
    const { data: tripAccess } = await supabase
      .from(TABLES.TRIPS)
      .select('id')
      .eq('id', tripId)
      .or(`created_by.eq.${user.id},is_public.eq.true`)
      .single();

    if (!tripAccess) {
      return NextResponse.json({ error: 'Trip not found or no access' }, { status: 404 });
    }

    // Fetch all reactions for this itinerary item
    const { data: reactions, error } = await supabase
      .from(TABLES.ITINERARY_ITEM_REACTIONS)
      .select(
        `
        id,
        emoji,
        user_id,
        created_at,
        profiles:user_id!fk_itinerary_item_reactions_profiles (
          name,
          avatar_url
        )
      `
      )
      .eq('itinerary_item_id', itemId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reactions:', error);
      return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 });
    }

    return NextResponse.json({
      reactions: reactions.map((reaction) => ({
        ...reaction,
        user: reaction.profiles,
        profiles: undefined,
      })),
    });
  } catch (error) {
    console.error('Error processing reaction request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST handler for adding/removing a reaction
export async function POST(
  req: NextRequest,
  context: { params: { tripId: string; itemId: string } }
) {
  // Await the params object before using its properties
  const { tripId, itemId } = await context.params;
  const supabase = await createRouteHandlerClient();

  try {
    // Authenticate the request
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has access to this trip
    const { data: tripAccess } = await supabase
      .from(TABLES.TRIPS)
      .select('id')
      .eq('id', tripId)
      .or(`created_by.eq.${user.id},is_public.eq.true`)
      .single();

    if (!tripAccess) {
      return NextResponse.json({ error: 'Trip not found or no access' }, { status: 404 });
    }

    // Get the emoji from request body
    const { emoji } = await req.json();

    if (!emoji || typeof emoji !== 'string') {
      return NextResponse.json({ error: 'Valid emoji is required' }, { status: 400 });
    }

    // Check if user already reacted with this emoji
    const { data: existingReaction } = await supabase
      .from(TABLES.ITINERARY_ITEM_REACTIONS)
      .select('id')
      .eq('itinerary_item_id', itemId)
      .eq('user_id', user.id)
      .eq('emoji', emoji)
      .maybeSingle();

    // If reaction exists, toggle it off (remove it)
    if (existingReaction) {
      const { error: deleteError } = await supabase
        .from(TABLES.ITINERARY_ITEM_REACTIONS)
        .delete()
        .eq('id', existingReaction.id);

      if (deleteError) {
        console.error('Error removing reaction:', deleteError);
        return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
      }
    } else {
      // Create new reaction
      const { error: insertError } = await supabase.from(TABLES.ITINERARY_ITEM_REACTIONS).insert({
        itinerary_item_id: itemId,
        user_id: user.id,
        emoji,
      });

      if (insertError) {
        console.error('Error adding reaction:', insertError);
        return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
      }
    }

    // Fetch updated reactions
    const { data: reactions, error } = await supabase
      .from(TABLES.ITINERARY_ITEM_REACTIONS)
      .select(
        `
        id,
        emoji,
        user_id,
        created_at,
        profiles:user_id!fk_itinerary_item_reactions_profiles (
          name,
          avatar_url
        )
      `
      )
      .eq('itinerary_item_id', itemId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching updated reactions:', error);
      return NextResponse.json({ error: 'Failed to fetch updated reactions' }, { status: 500 });
    }

    return NextResponse.json({
      reactions: reactions.map((reaction) => ({
        ...reaction,
        user: reaction.profiles,
        profiles: undefined,
      })),
    });
  } catch (error) {
    console.error('Error processing reaction toggle:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
