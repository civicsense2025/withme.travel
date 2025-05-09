import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { TABLES } from '@/utils/constants/tables';

// Define a more complete type for TABLES that includes missing properties
interface ExtendedTables {
  USERS: string;
  TRIPS: string;
  DESTINATIONS: string;
  TRIP_ITEM_COMMENTS: string;
  PROFILES: string;
  TRIP_COMMENT_LIKES: string;
  TRIP_MEMBERS: string;
  [key: string]: string;
}

// Use the extended type with the existing TABLES constant
const Tables = TABLES as unknown as ExtendedTables;

// Define all needed FIELDS locally for what's needed
const FIELDS = {
  TRIP_ITEM_COMMENTS: {
    USER_ID: 'user_id',
    CONTENT: 'content',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    TRIP_ID: 'trip_id',
    ITEM_ID: 'item_id',
  },
  COMMON: {
    ID: 'id',
    CREATED_AT: 'created_at',
  },
  PROFILES: {
    NAME: 'name',
    AVATAR_URL: 'avatar_url',
  },
  TRIP_MEMBERS: {
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
  },
  TRIP_COMMENT_LIKES: {
    USER_ID: 'user_id',
  },
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

    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from(Tables.TRIP_ITEM_COMMENTS)
      .select(
        `
        *,
        ${Tables.PROFILES}:${'user_id'} (
          ${'name'},
          ${'avatar_url'}
        ),
        likes:${Tables.TRIP_COMMENT_LIKES} (
          ${'id'},
          ${'user_id'}
        )
      `
      )
      .eq('trip_id', tripId)
      .eq('item_id', itemId)
      .order('created_at', { ascending: false });

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

    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: member, error: memberError } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (memberError || !member) {
      return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 });
    }

    const insertObject = {
      trip_id: tripId,
      item_id: itemId,
      user_id: user.id,
      content: content.trim(),
    };

    const { data, error } = await supabase
      .from(Tables.TRIP_ITEM_COMMENTS)
      .insert(insertObject)
      .select(
        `
        *,
        ${Tables.PROFILES}:${'user_id'} (
          ${'name'},
          ${'avatar_url'}
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
