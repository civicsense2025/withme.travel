import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

// GET: /api/group-plan-idea-comments?ideaId=...&limit=20&offset=0
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ideaId = searchParams.get('ideaId');
  const limit = Number(searchParams.get('limit') ?? 20);
  const offset = Number(searchParams.get('offset') ?? 0);

  if (!ideaId) {
    return NextResponse.json({ error: 'Missing ideaId' }, { status: 400 });
  }

  const supabase = await createRouteHandlerClient();
  const { data, error } = await supabase
    .from(TABLES.GROUP_PLAN_IDEA_COMMENTS)
    .select('*')
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comments: data });
}

// POST: /api/group-plan-idea-comments
export async function POST(request: NextRequest) {
  const supabase = await createRouteHandlerClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get request body
  const { idea_id, user_id, content, parent_id } = await request.json();

  // Use authenticated user's ID if user_id isn't provided
  const effectiveUserId = user_id || user?.id;

  if (!idea_id || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!effectiveUserId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from(TABLES.GROUP_PLAN_IDEA_COMMENTS)
    .insert([
      {
        idea_id,
        user_id: effectiveUserId,
        content,
        parent_id: parent_id ?? null,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comment: data });
}

// PATCH: /api/group-plan-idea-comments (edit comment)
export async function PATCH(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  const { id, user_id, content } = await request.json();
  if (!id || !user_id || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  // Only allow editing if user_id matches
  const { data: comment, error: fetchError } = await supabase
    .from(TABLES.GROUP_PLAN_IDEA_COMMENTS)
    .select('user_id')
    .eq('id', id)
    .maybeSingle();
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!comment || comment.user_id !== user_id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { data, error } = await supabase
    .from(TABLES.GROUP_PLAN_IDEA_COMMENTS)
    .update({ content })
    .eq('id', id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comment: data });
}

// DELETE: /api/group-plan-idea-comments?id=...&user_id=...
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const user_id = searchParams.get('user_id');
  if (!id || !user_id)
    return NextResponse.json({ error: 'Missing id or user_id' }, { status: 400 });
  const supabase = await createRouteHandlerClient();
  // Only allow deleting if user_id matches
  const { data: comment, error: fetchError } = await supabase
    .from(TABLES.GROUP_PLAN_IDEA_COMMENTS)
    .select('user_id')
    .eq('id', id)
    .maybeSingle();
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!comment || comment.user_id !== user_id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { error } = await supabase.from(TABLES.GROUP_PLAN_IDEA_COMMENTS).delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
