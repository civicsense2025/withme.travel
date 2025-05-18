import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { z } from 'zod';
import type { Database } from '@/utils/constants/database';

// Define schema for validating tag requests
const tagSchema = z.object({
  tags: z.array(z.string().min(1).max(50)),
});

/**
 * GET handler for retrieving tags associated with a note
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; noteId: string }> }
) {
  const { tripId, noteId } = await params;
  const supabase = await createRouteHandlerClient();

  try {
    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has access to this trip
    const { data: membership, error: membershipError } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Not a member of this trip' }, { status: 403 });
    }

    // Verify the note exists and belongs to this trip
    const { data: note, error: noteError } = await supabase
      .from('trip_notes')
      .select('id')
      .eq('id', noteId)
      .eq('trip_id', tripId)
      .single();

    if (noteError || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Get tags for this note by joining with tags table to get tag names
    const { data: tagData, error: tagsError } = await supabase
      .from('note_tags')
      .select('tags:tag_id(id, name)')
      .eq('note_id', noteId);

    if (tagsError) {
      console.error('Error fetching tags:', tagsError);
      return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }

    // Extract tag names from the join result
    const tags = tagData?.map((item) => item.tags?.name).filter(Boolean) || [];

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Unexpected error in GET /api/trips/[tripId]/notes/[noteId]/tags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT handler for updating tags associated with a note
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; noteId: string }> }
) {
  const { tripId, noteId } = await params;
  const supabase = await createRouteHandlerClient();

  try {
    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has access to this trip
    const { data: membership, error: membershipError } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Not a member of this trip' }, { status: 403 });
    }

    // Verify user has edit permissions
    const canEdit = ['admin', 'editor'].includes(membership.role);
    if (!canEdit) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Verify the note exists and belongs to this trip
    const { data: note, error: noteError } = await supabase
      .from('trip_notes')
      .select('id')
      .eq('id', noteId)
      .eq('trip_id', tripId)
      .single();

    if (noteError || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Validate request body
    const body = await request.json();
    const validation = tagSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid tag data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { tags: tagNames } = validation.data;

    // Start a transaction to update tags
    // 1. First, get or create tag IDs for all tag names
    const tagUpsertPromises = tagNames.map(async (tagName) => {
      // Check if tag exists
      const { data: existingTag, error: lookupError } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagName)
        .maybeSingle();

      if (lookupError) {
        console.error(`Error looking up tag '${tagName}':`, lookupError);
        throw new Error('Failed to look up tag');
      }

      if (existingTag) {
        return existingTag.id;
      }

      // Create new tag
      const { data: newTag, error: createError } = await supabase
        .from('tags')
        .insert({ name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, '-') })
        .select('id')
        .single();

      if (createError) {
        console.error(`Error creating tag '${tagName}':`, createError);
        throw new Error('Failed to create tag');
      }

      return newTag.id;
    });

    const tagIds = await Promise.all(tagUpsertPromises);

    // 2. Remove all existing tags for this note
    const { error: deleteError } = await supabase.from('note_tags').delete().eq('note_id', noteId);

    if (deleteError) {
      console.error('Error removing existing tags:', deleteError);
      return NextResponse.json({ error: 'Failed to update tags' }, { status: 500 });
    }

    // 3. Add new tags if any were provided
    if (tagIds.length > 0) {
      const tagObjects = tagIds.map((tagId) => ({
        note_id: noteId,
        tag_id: tagId,
        created_by: user.id,
      }));

      const { error: insertError } = await supabase.from('note_tags').insert(tagObjects);

      if (insertError) {
        console.error('Error adding new tags:', insertError);
        return NextResponse.json({ error: 'Failed to add new tags' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, tags: tagNames });
  } catch (error) {
    console.error('Unexpected error in PUT /api/trips/[tripId]/notes/[noteId]/tags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE handler for removing all tags from a note
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; noteId: string }> }
) {
  const { tripId, noteId } = await params;
  const supabase = await createRouteHandlerClient();

  try {
    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has access to this trip
    const { data: membership, error: membershipError } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Not a member of this trip' }, { status: 403 });
    }

    // Verify user has edit permissions
    const canEdit = ['admin', 'editor'].includes(membership.role);
    if (!canEdit) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Verify the note exists and belongs to this trip
    const { data: note, error: noteError } = await supabase
      .from('trip_notes')
      .select('id')
      .eq('id', noteId)
      .eq('trip_id', tripId)
      .single();

    if (noteError || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Remove all tags for this note
    const { error: deleteError } = await supabase.from('note_tags').delete().eq('note_id', noteId);

    if (deleteError) {
      console.error('Error removing tags:', deleteError);
      return NextResponse.json({ error: 'Failed to remove tags' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/trips/[tripId]/notes/[noteId]/tags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
