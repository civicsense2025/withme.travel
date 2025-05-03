import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient, TypedSupabaseClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { TABLES } from '@/utils/constants/database';

// Define FIELDS locally for what's needed
const FIELDS = {
  TRIP_ITEM_COMMENTS: {
    USER_ID: 'user_id',
    CONTENT: 'content',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
  COMMON: {
    ID: 'id'
  },
  PROFILES: {
    NAME: 'name',
    AVATAR_URL: 'avatar_url'
  }
};
import type { Database } from '@/types/database.types';

export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
): Promise<NextResponse> {
  try {
    const { tripId } = params;
    const url = new URL(request.url);
    const itemId = url.searchParams?.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from(TABLES.TRIP_ITEM_COMMENTS)
      .select(
        `
        *,
        ${TABLES.PROFILES}:${FIELDS.TRIP_ITEM_COMMENTS.USER_ID} (
          ${FIELDS.PROFILES.NAME},
          ${FIELDS.PROFILES.AVATAR_URL}
        ),
        likes:${TABLES.TRIP_COMMENT_LIKES} (
          ${FIELDS.COMMON.ID},
          ${FIELDS.TRIP_COMMENT_LIKES.USER_ID}
        )
      `
      )
      .eq(FIELDS.TRIP_ITEM_COMMENTS.TRIP_ID, tripId)
      .eq(FIELDS.TRIP_ITEM_COMMENTS.ITEM_ID, itemId)
      .order(FIELDS.COMMON.CREATED_AT, { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string } }
): Promise<NextResponse> {
  try {
    const { tripId } = params;
    const { itemId, content } = await request.json();

    if (!itemId || !content) {
      return NextResponse.json({ error: 'Item ID and content are required' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: member, error: memberError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select(FIELDS.COMMON.ID)
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(FIELDS.TRIP_MEMBERS.USER_ID, user.id)
      .maybeSingle();

    if (memberError || !member) {
      return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from(TABLES.TRIP_ITEM_COMMENTS)
      .insert({
        [FIELDS.TRIP_ITEM_COMMENTS.TRIP_ID]: tripId,
        [FIELDS.TRIP_ITEM_COMMENTS.ITEM_ID]: itemId,
        [FIELDS.TRIP_ITEM_COMMENTS.USER_ID]: user.id,
        [FIELDS.TRIP_ITEM_COMMENTS.CONTENT]: content.trim(),
      })
      .select(
        `
        *,
        ${TABLES.PROFILES}:${FIELDS.TRIP_ITEM_COMMENTS.USER_ID} (
          ${FIELDS.PROFILES.NAME},
          ${FIELDS.PROFILES.AVATAR_URL}
        )
      `
      )
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}