import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { updateComment, deleteComment } from '@/utils/db-comments';
import type { CommentUpdateInput } from '@/types/comments';
import { captureException } from '@sentry/nextjs';

interface Params {
  params: {
    id: string;
  };
}

/**
 * PUT /api/comments/[id]
 * Update an existing comment
 */
export async function PUT(req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { id } = params;
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = (await req.json()) as CommentUpdateInput;
    const { content, attachment_url, attachment_type, metadata } = body;

    if (!content) {
      return NextResponse.json({ error: 'Missing required field: content' }, { status: 400 });
    }

    const updatedComment = await updateComment(
      id,
      user.id,
      content,
      attachment_url || null,
      attachment_type || null,
      metadata || null
    );

    if (!updatedComment) {
      return NextResponse.json(
        { error: 'Failed to update comment or comment does not exist' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('Error handling PUT /api/comments/[id]:', error);
    captureException(error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

/**
 * DELETE /api/comments/[id]
 * Delete a comment (soft delete)
 */
export async function DELETE(req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { id } = params;
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const success = await deleteComment(id, user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete comment or comment does not exist' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling DELETE /api/comments/[id]:', error);
    captureException(error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
