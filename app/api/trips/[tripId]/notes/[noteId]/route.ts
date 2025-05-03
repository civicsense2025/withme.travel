import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TRIP_ROLES } from '@/utils/constants/status';
import { type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { z } from 'zod';

// Helper function (from migration) - Consider moving to a shared utils file
async function checkTripMembershipAndRole(
  supabase: SupabaseClient<Database>,
  tripId: string,
  userId: string,
  roles: string[]
) {
  const roleValues = roles;
  const { data, error } = await supabase.rpc('is_trip_member_with_role', {
    _trip_id: tripId,
    _user_id: userId,
    _roles: roleValues,
  });
  if (error) {
    console.error('Error checking trip membership/role:', error);
    throw new Error('Error checking trip permission');
  }
  return data; // Returns boolean
}

// GET: Fetch a single note with its details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; noteId: string }> }
) {
  const { tripId, noteId } = await params;
  const supabase = createRouteHandlerClient();

  if (!tripId || !noteId)
    return NextResponse.json({ error: 'Trip ID and Note ID are required' }, { status: 400 });

  try {
    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Authorization check (any member can read)
    const canRead = await checkTripMembershipAndRole(supabase, tripId, user.id, [
      TRIP_ROLES.ADMIN,
      TRIP_ROLES.EDITOR,
      TRIP_ROLES.CONTRIBUTOR,
      TRIP_ROLES.VIEWER,
    ]);
    if (!canRead) {
      return NextResponse.json(
        { error: "Forbidden: You don't have access to this trip's notes" },
        { status: 403 }
      );
    }

    // Fetch the specific note content
    const { data: note, error: noteError } = await supabase
      .from('trip_notes')
      .select(
        `
          id,
          title,
          content,
          updated_at,
          updated_by
      `
      )
      .eq('id', noteId)
      .eq('trip_id', tripId)
      .single();

    if (noteError) {
      console.error(`[Notes API GET ${noteId}] Error fetching note:`, noteError);
      if (noteError.code === 'PGRST116') {
        // code for "Row not found"
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Error fetching note content' }, { status: 500 });
    }

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ note });
  } catch (error: any) {
    console.error(`[Notes API GET ${noteId}] Unexpected error:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// PUT: Update an existing note
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; noteId: string }> }
) {
  const { tripId, noteId } = await params;
  const supabase = createRouteHandlerClient();

  if (!tripId || !noteId)
    return NextResponse.json({ error: 'Trip ID and Note ID are required' }, { status: 400 });

  try {
    const body = await request.json();
    const { title, content } = body;

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Basic Input Validation
    if (title === undefined && content === undefined) {
      return NextResponse.json(
        { error: 'Either title or content must be provided for update' },
        { status: 400 }
      );
    }
    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return NextResponse.json({ error: 'Title must be a non-empty string' }, { status: 400 });
    }
    if (content !== undefined && typeof content !== 'string') {
      return NextResponse.json({ error: 'Content must be a string' }, { status: 400 });
    }

    // Authorization check (Editor/Admin or last updater)
    // Fetch the note first to check updated_by
    const { data: existingNote, error: fetchError } = await supabase
      .from('trip_notes')
      .select('updated_by')
      .eq('id', noteId)
      .eq('trip_id', tripId)
      .single();

    if (fetchError || !existingNote) {
      return NextResponse.json({ error: 'Note not found or error fetching note' }, { status: 404 });
    }

    const canUpdateRoles = await checkTripMembershipAndRole(supabase, tripId, user.id, [
      TRIP_ROLES.ADMIN,
      TRIP_ROLES.EDITOR,
    ]);
    const isLastUpdater = existingNote.updated_by === user.id;

    if (!canUpdateRoles && !isLastUpdater) {
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to update this note" },
        { status: 403 }
      );
    }

    // Prepare update object
    const updateData: { [key: string]: any } = {
      updated_by: user.id,
    };
    if (title !== undefined) {
      updateData.title = title.trim();
    }
    if (content !== undefined) {
      updateData.content = content;
    }

    // Perform update
    const { data: updatedNote, error: updateError } = await supabase
      .from('trip_notes')
      .update(updateData)
      .eq('id', noteId)
      .eq('trip_id', tripId)
      .select(
        `
         id,
         title,
         content,
         updated_at,
         updated_by
      `
      )
      .single();

    if (updateError) {
      console.error(`[Notes API PUT ${noteId}] Error updating note:`, updateError);
      return NextResponse.json({ error: 'Error updating note' }, { status: 500 });
    }

    return NextResponse.json({ note: updatedNote });
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      // Catch JSON parsing errors
      console.error(`[Notes API PUT ${noteId}] Invalid JSON:`, error);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    console.error(`[Notes API PUT ${noteId}] Unexpected error:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// DELETE: Remove a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; noteId: string }> }
) {
  const { tripId, noteId } = await params;
  const supabase = createRouteHandlerClient();

  if (!tripId || !noteId)
    return NextResponse.json({ error: 'Trip ID and Note ID are required' }, { status: 400 });

  try {
    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Authorization check (Editors or Admins can delete notes)
    const canEdit = await checkTripMembershipAndRole(supabase, tripId, user.id, [
      TRIP_ROLES.ADMIN,
      TRIP_ROLES.EDITOR,
    ]);
    if (!canEdit) {
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to delete this note" },
        { status: 403 }
      );
    }

    // Perform deletion
    const { error: deleteError } = await supabase
      .from('trip_notes')
      .delete()
      .eq('id', noteId)
      .eq('trip_id', tripId);

    if (deleteError) {
      console.error(`[Notes API DELETE ${noteId}] Error deleting note:`, deleteError);
      return NextResponse.json({ error: 'Error deleting note' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`[Notes API DELETE ${noteId}] Unexpected error:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
