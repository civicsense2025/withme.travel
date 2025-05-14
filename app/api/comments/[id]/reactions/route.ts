import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import {
  getCommentReactions,
  addCommentReaction,
  removeCommentReaction,
} from '@/utils/db-comments';
import type { CommentReactionInput } from '@/types/comments';
import { captureException } from '@sentry/nextjs';

interface Params {
  params: {
    id: string;
  };
}

/**
 * GET /api/comments/[id]/reactions
 * Get all reactions for a comment
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const reactions = await getCommentReactions(id);

    return NextResponse.json({ reactions });
  } catch (error) {
    console.error('Error handling GET /api/comments/[id]/reactions:', error);
    captureException(error);
    return NextResponse.json({ error: 'Failed to fetch comment reactions' }, { status: 500 });
  }
}

/**
 * POST /api/comments/[id]/reactions
 * Add a reaction to a comment
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = (await req.json()) as Partial<CommentReactionInput>;
    const { emoji } = body;

    if (!emoji) {
      return NextResponse.json({ error: 'Missing required field: emoji' }, { status: 400 });
    }

    // Validate emoji - keep it simple for now
    if (typeof emoji !== 'string' || emoji.length > 8) {
      return NextResponse.json({ error: 'Invalid emoji format' }, { status: 400 });
    }

    const reaction = await addCommentReaction(id, user.id, emoji);

    if (!reaction) {
      return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
    }

    return NextResponse.json(reaction, { status: 201 });
  } catch (error) {
    console.error('Error handling POST /api/comments/[id]/reactions:', error);
    captureException(error);
    return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
  }
}

/**
 * DELETE /api/comments/[id]/reactions
 * Remove a reaction from a comment
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const emoji = searchParams.get('emoji');

    if (!emoji) {
      return NextResponse.json({ error: 'Missing required parameter: emoji' }, { status: 400 });
    }

    const success = await removeCommentReaction(id, user.id, emoji);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to remove reaction or reaction does not exist' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling DELETE /api/comments/[id]/reactions:', error);
    captureException(error);
    return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
  }
}
