import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES, FIELDS } from '@/utils/constants/database';
import type { Database, ItineraryItemReaction } from '@/types/database.types';

const ALLOWED_EMOJIS = ['👍', '❤️', '😂', '😮', '👎'];

// POST /api/trips/[tripId]/itinerary/[itemId]/reactions
// Body: { emoji: string }
export async function POST(request: NextRequest, { params }: { params: { tripId: string; itemId: string } }) {
  const { tripId, itemId } = params;
  const supabase = await createRouteHandlerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { emoji } = await request.json();
  if (!ALLOWED_EMOJIS.includes(emoji)) {
    return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 });
  }
  // Check if user already reacted with this emoji
  const { data: existing, error: fetchError } = await supabase
    .from(TABLES.ITINERARY_ITEM_REACTIONS)
    .select('*')
    .eq(FIELDS.ITINERARY_ITEM_REACTIONS.ITINERARY_ITEM_ID, itemId)
    .eq(FIELDS.ITINERARY_ITEM_REACTIONS.USER_ID, user.id)
    .eq(FIELDS.ITINERARY_ITEM_REACTIONS.EMOJI, emoji)
    .maybeSingle();
  if (fetchError) {
    return NextResponse.json({ error: 'Failed to check existing reaction' }, { status: 500 });
  }
  if (existing) {
    // Already reacted: remove reaction (toggle off)
    const { error: deleteError } = await supabase
      .from(TABLES.ITINERARY_ITEM_REACTIONS)
      .delete()
      .eq('id', existing.id);
    if (deleteError) {
      return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
    }
  } else {
    // Not reacted: add reaction
    const { error: insertError } = await supabase
      .from(TABLES.ITINERARY_ITEM_REACTIONS)
      .insert({
        itinerary_item_id: itemId,
        user_id: user.id,
        emoji,
      });
    if (insertError) {
      return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
    }
  }
  // Return updated reactions for this item
  const { data: reactions, error: reactionsError } = await supabase
    .from(TABLES.ITINERARY_ITEM_REACTIONS)
    .select('*')
    .eq(FIELDS.ITINERARY_ITEM_REACTIONS.ITINERARY_ITEM_ID, itemId);
  if (reactionsError) {
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 });
  }
  return NextResponse.json({ reactions });
}

// DELETE /api/trips/[tripId]/itinerary/[itemId]/reactions?emoji=...
export async function DELETE(request: NextRequest, { params }: { params: { tripId: string; itemId: string } }) {
  const { tripId, itemId } = params;
  const supabase = await createRouteHandlerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const emoji = searchParams.get('emoji');
  if (!emoji || !ALLOWED_EMOJIS.includes(emoji)) {
    return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 });
  }
  // Remove the reaction for this user/emoji/item
  const { error: deleteError } = await supabase
    .from(TABLES.ITINERARY_ITEM_REACTIONS)
    .delete()
    .eq(FIELDS.ITINERARY_ITEM_REACTIONS.ITINERARY_ITEM_ID, itemId)
    .eq(FIELDS.ITINERARY_ITEM_REACTIONS.USER_ID, user.id)
    .eq(FIELDS.ITINERARY_ITEM_REACTIONS.EMOJI, emoji);
  if (deleteError) {
    return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
  }
  // Return updated reactions for this item
  const { data: reactions, error: reactionsError } = await supabase
    .from(TABLES.ITINERARY_ITEM_REACTIONS)
    .select('*')
    .eq(FIELDS.ITINERARY_ITEM_REACTIONS.ITINERARY_ITEM_ID, itemId);
  if (reactionsError) {
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 });
  }
  return NextResponse.json({ reactions });
} 