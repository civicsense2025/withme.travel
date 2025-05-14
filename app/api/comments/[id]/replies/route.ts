import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { getComments } from '@/app/api/db-utils';
import { captureException } from '@sentry/nextjs';

interface Params {
  params: {
    id: string;
  };
}

/**
 * GET /api/comments/[id]/replies
 * Get replies to a comment
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

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Call the utility function to get replies
    // We pass the comment ID as the parentId parameter
    const repliesData = await getComments(
      // These parameters aren't used when a parentId is provided
      'group_idea', // Placeholder, not used when parentId is provided
      'placeholder', // Placeholder, not used when parentId is provided
      limit,
      offset,
      id // The parent comment ID
    );

    return NextResponse.json(repliesData);
  } catch (error) {
    console.error('Error handling GET /api/comments/[id]/replies:', error);
    captureException(error);
    return NextResponse.json({ error: 'Failed to fetch comment replies' }, { status: 500 });
  }
}
