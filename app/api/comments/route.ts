import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { getComments, createComment } from '@/utils/db-comments';
import type { CommentableContentType, CommentCreateInput } from '@/types/comments';
import { captureException } from '@sentry/nextjs';

/**
 * GET /api/comments
 * Get comments for a specific content item
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = req.nextUrl.searchParams;
    const contentType = searchParams.get('contentType') as CommentableContentType;
    const contentId = searchParams.get('contentId');
    const parentId = searchParams.get('parentId') || null;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!contentType || !contentId) {
      return NextResponse.json(
        { error: 'Missing required parameters contentType and contentId' },
        { status: 400 }
      );
    }

    const validContentTypes: CommentableContentType[] = [
      'destination',
      'group_idea',
      'itinerary_item',
      'trip',
      'image',
      'note',
    ];

    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json(
        { error: `Invalid contentType. Must be one of: ${validContentTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const comments = await getComments(contentType, contentId, limit, offset, parentId);

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error handling GET /api/comments:', error);
    captureException(error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

/**
 * POST /api/comments
 * Create a new comment
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = (await req.json()) as CommentCreateInput;
    const {
      content,
      content_type,
      content_id,
      parent_id,
      attachment_url,
      attachment_type,
      metadata,
    } = body;

    if (!content || !content_type || !content_id) {
      return NextResponse.json(
        { error: 'Missing required fields: content, content_type, content_id' },
        { status: 400 }
      );
    }

    const validContentTypes: CommentableContentType[] = [
      'destination',
      'group_idea',
      'itinerary_item',
      'trip',
      'image',
      'note',
    ];

    if (!validContentTypes.includes(content_type)) {
      return NextResponse.json(
        { error: `Invalid content_type. Must be one of: ${validContentTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Only pass the arguments supported by createComment (userId, contentType, contentId, text, parentId)
    const comment = await createComment(
      user.id,
      content_type,
      content_id,
      content,
      parent_id || null
    );

    if (!comment) {
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error handling POST /api/comments:', error);
    captureException(error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
