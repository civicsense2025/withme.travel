import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from 'next/server';
import { TABLES, FIELDS, ENUMS } from "@/utils/constants/database";
import { type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Helper function - Assume is_trip_member_with_role exists from previous migration
// Or define locally/import if moved to shared utils
async function checkTripMembershipAndRole(
  supabase: SupabaseClient<Database>,
  tripId: string,
  userId: string,
  roles: string[]
) {
  // Added validation for inputs
  if (!supabase || !tripId || !userId || !Array.isArray(roles)) {
    console.error('Invalid arguments passed to checkTripMembershipAndRole');
    throw new Error('Internal server error checking permissions.');
  }
  const { data, error } = await supabase.rpc('is_trip_member_with_role', {
    _trip_id: tripId,
    _user_id: userId,
    _roles: roles,
  });
  if (error) {
    console.error(
      `Error checking trip membership/role for user ${userId} on trip ${tripId}:`,
      error
    );
    throw new Error('Error checking trip permission');
  }
  return data; // Returns boolean
}

// GET /api/trips/[tripId]/notes/[noteId]/tags - Fetch tags for a specific note
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; noteId: string }> }
) {
  // Extract params properly inside the function
  const { tripId, noteId } = await params;

  if (!tripId || !noteId)
    return NextResponse.json({ error: 'Trip ID and Note ID are required' }, { status: 400 });

  try {
    const supabase = await createServerSupabaseClient();

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Authorization check (any member can read tags of a note in their trip)
    const canRead = await checkTripMembershipAndRole(supabase, tripId, user.id, [
      'admin',
      'editor',
      'contributor',
      'viewer',
    ]);
    if (!canRead) {
      return NextResponse.json(
        { error: "Forbidden: You don't have access to this trip's notes" },
        { status: 403 }
      );
    }

    // Fetch tags associated with the noteId
    const { data: tags, error: tagsError } = await supabase
      .from(TABLES.NOTE_TAGS) // Use the new table constant
      .select(
        `
            tags (
                ${FIELDS.TAGS.ID},
                ${FIELDS.TAGS.NAME}
            )
        `
      )
      .eq(FIELDS.NOTE_TAGS.NOTE_ID, noteId); // Use constant

    if (tagsError) {
      console.error(`[Note Tags API GET ${noteId}] Error fetching tags:`, tagsError);
      return NextResponse.json({ error: 'Error fetching note tags' }, { status: 500 });
    }

    // Extract the tag objects from the join table result
    const extractedTags = tags ? tags.map((item) => item.tags).filter((tag) => tag !== null) : [];

    return NextResponse.json({ tags: extractedTags });
  } catch (error: any) {
    console.error(`[Tags API GET ${noteId}] Unexpected error:`, error); // Keep specific noteId log
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// PUT /api/trips/[tripId]/notes/[noteId]/tags - Update tags for a specific note
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; noteId: string }> }
) {
  // Extract params properly
  const { tripId, noteId } = await params;

  if (!tripId || !noteId)
    return NextResponse.json({ error: 'Trip ID and Note ID are required' }, { status: 400 });

  try {
    const supabase = await createServerSupabaseClient();
    const { tags: newTags }: { tags: string[] } = await request.json();

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Authorization check (Editor or Admin can manage tags)
    const canEdit = await checkTripMembershipAndRole(supabase, tripId, user.id, [
      'admin',
      'editor',
    ]);
    if (!canEdit) {
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to manage tags for this note" },
        { status: 403 }
      );
    }

    // Validate input: ensure tagNames is an array of strings
    if (!Array.isArray(newTags) || !newTags.every((t) => typeof t === 'string')) {
      return NextResponse.json(
        { error: "Invalid input: 'tags' must be an array of strings." },
        { status: 400 }
      );
    }

    // Trim and filter empty tag names
    const trimmedTags = newTags.map((name) => name.trim()).filter((name) => name.length > 0);

    // 1. Find existing tags and identify names for new tags
    const { data: existingTags, error: fetchTagsError } = await supabase
      .from(TABLES.TAGS)
      .select(`${FIELDS.TAGS.ID}, ${FIELDS.TAGS.NAME}`)
      .in(FIELDS.TAGS.NAME, trimmedTags);

    if (fetchTagsError) {
      console.error(`[Note Tags API PUT ${noteId}] Error fetching existing tags:`, fetchTagsError);
      return NextResponse.json({ error: 'Error processing tags' }, { status: 500 });
    }

    const existingTagMap = new Map(
      existingTags.map((tag: { name: string; id: string }) => [tag.name, tag.id])
    );
    const newTagNames = trimmedTags.filter((name) => !existingTagMap.has(name));
    let allTagIds = [...existingTagMap.values()];

    // 2. Create new tags if any
    if (newTagNames.length > 0) {
      const newTagsToInsert = newTagNames.map((name) => ({ name })); // Assumes name is unique and other fields can be default
      const { data: insertedTags, error: insertTagsError } = await supabase
        .from(TABLES.TAGS)
        .insert(newTagsToInsert)
        .select(`${FIELDS.TAGS.ID}, ${FIELDS.TAGS.NAME}`);

      if (insertTagsError) {
        console.error(`[Note Tags API PUT ${noteId}] Error inserting new tags:`, insertTagsError);
        // Handle potential unique constraint violation if needed
        return NextResponse.json({ error: 'Error creating new tags' }, { status: 500 });
      }
      insertedTags.forEach((tag: { id: string }) => allTagIds.push(tag.id));
    }

    // 3. Synchronize note_tags table
    // Simplest way: Delete all existing associations for this note, then insert the new ones.

    // Delete existing associations
    const { error: deleteError } = await supabase
      .from(TABLES.NOTE_TAGS)
      .delete()
      .eq(FIELDS.NOTE_TAGS.NOTE_ID, noteId);

    if (deleteError) {
      console.error(`[Note Tags API PUT ${noteId}] Error deleting old tags:`, deleteError);
      return NextResponse.json(
        { error: 'Error updating note tags (delete step)' },
        { status: 500 }
      );
    }

    // Insert new associations if there are tags to associate
    if (allTagIds.length > 0) {
      const newNoteTags = allTagIds.map((tagId) => ({
        [FIELDS.NOTE_TAGS.NOTE_ID]: noteId,
        [FIELDS.NOTE_TAGS.TAG_ID]: tagId,
      }));
      const { error: insertNoteTagsError } = await supabase
        .from(TABLES.NOTE_TAGS)
        .insert(newNoteTags);

      if (insertNoteTagsError) {
        console.error(
          `[Note Tags API PUT ${noteId}] Error inserting new note tags:`,
          insertNoteTagsError
        );
        return NextResponse.json(
          { error: 'Error updating note tags (insert step)' },
          { status: 500 }
        );
      }
    }

    // 4. Fetch and return the final list of tags for the note
    const { data: finalTagsData, error: finalFetchError } = await supabase
      .from(TABLES.NOTE_TAGS)
      .select(`tags (${FIELDS.TAGS.ID}, ${FIELDS.TAGS.NAME})`)
      .eq(FIELDS.NOTE_TAGS.NOTE_ID, noteId);

    if (finalFetchError) {
      console.error(`[Note Tags API PUT ${noteId}] Error fetching final tags:`, finalFetchError);
      // Don't fail the whole request, but maybe log or return a partial success?
      return NextResponse.json({ tags: [] });
    }

    const finalTags = finalTagsData
      ? finalTagsData.map((item: { tags: any }) => item.tags).filter((tag: any) => tag !== null)
      : [];
    return NextResponse.json({ tags: finalTags });
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      console.error(`[Tags API PUT ${noteId}] Invalid JSON:`, error);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    console.error(`[Tags API PUT ${noteId}] Unexpected error:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
