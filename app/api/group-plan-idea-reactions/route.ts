import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

// GET: /api/group-plan-idea-reactions?ideaId=...&commentId=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ideaId = searchParams.get('ideaId');
  const commentId = searchParams.get('commentId');
  if (!ideaId && !commentId) {
    return NextResponse.json({ error: 'Missing ideaId or commentId' }, { status: 400 });
  }
  const supabase = await createRouteHandlerClient();
  let query = supabase.from(TABLES.GROUP_PLAN_IDEA_REACTIONS).select('*');
  if (ideaId) query = query.eq('idea_id', ideaId);
  if (commentId) query = query.eq('comment_id', commentId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reactions: data });
}

// POST: /api/group-plan-idea-reactions
export async function POST(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  const { idea_id, comment_id, user_id, emoji } = await request.json();
  if (!user_id || !emoji || (!idea_id && !comment_id)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from(TABLES.GROUP_PLAN_IDEA_REACTIONS)
    .insert([{ idea_id, comment_id, user_id, emoji }])
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reaction: data });
}

// PATCH: /api/group-plan-idea-reactions (edit reaction)
export async function PATCH(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  const { id, emoji } = await request.json();
  if (!id || !emoji) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from(TABLES.GROUP_PLAN_IDEA_REACTIONS)
    .update({ emoji })
    .eq('id', id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reaction: data });
}

// DELETE: /api/group-plan-idea-reactions?id=...
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const supabase = await createRouteHandlerClient();
  const { error } = await supabase.from(TABLES.GROUP_PLAN_IDEA_REACTIONS).delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
