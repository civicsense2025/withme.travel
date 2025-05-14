import { createRouteHandlerClient } from '@/utils/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Database } from '@/types/database.types';

// Define types for comment data
interface TripComment {
  id: string;
  trip_id: string;
  user_id: string;
  message: string;
  created_at: string;
  updated_at: string | null;
  parent_id: string | null;
  profiles?: {
    id: string;
    name: string;
    username: string | null;
    avatar_url: string | null;
  } | null;
  reactions?: Array<{
    id: string;
    comment_id: string;
    user_id: string;
    reaction_type: string;
    created_at: string;
  }>;
}

type TripCommentInsert = Pick<TripComment, 'trip_id' | 'user_id' | 'message' | 'parent_id'>;

// Comment schema for validation
const commentSchema = z.object({
  message: z.string().min(1).max(1000),
  parentId: z.string().optional(),
});

// GET /api/trips/[tripId]/comments - Get all comments for a trip
export async function GET(request: NextRequest, { params }: { params: { tripId: string } }) {
  const { tripId } = params;
  const supabase = await createRouteHandlerClient();

  // Get searchParams
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parentId') || null;

  try {
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to this trip
    const { data: membership } = await supabase
      .from('trip_members')
      .select('*')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this trip' }, { status: 403 });
    }

    // Get comments for the trip
    const query = supabase
      .from('trip_comments')
      .select(
        `
        *,
        profiles(id, name, username, avatar_url),
        reactions(*)
      `
      )
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });

    // Filter by parent if provided
    if (parentId) {
      query.eq('parent_id', parentId);
    } else {
      query.is('parent_id', null);
    }

    const { data: comments, error } = await query;

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/trips/[tripId]/comments - Create a new comment for a trip
export async function POST(request: NextRequest, { params }: { params: { tripId: string } }) {
  const { tripId } = params;
  const supabase = await createRouteHandlerClient();

  try {
    // Get and validate the comment data
    const data = await request.json();
    const validation = commentSchema.safeParse(data);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid comment data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { message, parentId } = validation.data;

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to this trip
    const { data: membership } = await supabase
      .from('trip_members')
      .select('*')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this trip' }, { status: 403 });
    }

    // Create comment with proper typing
    const commentData: TripCommentInsert = {
      trip_id: tripId,
      user_id: user.id,
      message: message,
      parent_id: parentId || null,
    };

    // Create the comment
    const { data: comment, error } = await supabase
      .from('trip_comments')
      .insert(commentData)
      .select('*, profiles(id, name, username, avatar_url)')
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
