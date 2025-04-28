import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { DB_TABLES, DB_FIELDS, DB_ENUMS } from '@/utils/constants/database';

// Helper function (from migration) - Consider moving to a shared utils file
async function checkTripMembershipAndRole(supabase: any, tripId: string, userId: string, roles: string[]) {
    const { data, error } = await supabase.rpc('is_trip_member_with_role', {
        _trip_id: tripId,
        _user_id: userId,
        _roles: roles
    });
    if (error) {
        console.error("Error checking trip membership/role:", error);
        // Throw or return an indicator of the error
        throw new Error("Error checking trip permission");
    }
    return data; // Returns boolean
}

// GET: Fetch a single note with its details
export async function GET(request: NextRequest, props: { params: { tripId: string, noteId: string } }) {
  // Extract params properly
  const { tripId, noteId } = props.params;

  if (!tripId || !noteId) return NextResponse.json({ error: "Trip ID and Note ID are required" }, { status: 400 });

  try {
    const supabase = createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Authorization check (any member can read)
    const canRead = await checkTripMembershipAndRole(supabase, tripId, user.id, ['admin', 'editor', 'contributor', 'viewer']);
    if (!canRead) {
         return NextResponse.json({ error: "Forbidden: You don't have access to this trip's notes" }, { status: 403 });
    }

    // Fetch the specific note content
    const { data: note, error: noteError } = await supabase
        .from(DB_TABLES.COLLABORATIVE_NOTES)
        .select('id, title, content, updated_at, updated_by') // Select relevant fields
        .eq('id', noteId)
        .eq('trip_id', tripId) // Ensure it belongs to the correct trip
        .single();

    if (noteError) {
        console.error(`[Notes API GET ${noteId}] Error fetching note:`, noteError);
        if (noteError.code === 'PGRST116') { // code for "Row not found"
             return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Error fetching note content" }, { status: 500 });
    }

    if (!note) {
         return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ note });

  } catch (error: any) {
    console.error(`[Notes API GET ${noteId}] Unexpected error:`, error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

// PUT: Update an existing note
export async function PUT(request: NextRequest, props: { params: { tripId: string, noteId: string } }) {
  // Extract params properly
  const { tripId, noteId } = props.params;

  if (!tripId || !noteId) return NextResponse.json({ error: "Trip ID and Note ID are required" }, { status: 400 });

  try {
    const supabase = createClient();
    const body = await request.json();
    const { title, content } = body;

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Basic Input Validation
    if (title === undefined && content === undefined) {
        return NextResponse.json({ error: "Either title or content must be provided for update" }, { status: 400 });
    }
    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
         return NextResponse.json({ error: "Title must be a non-empty string" }, { status: 400 });
    }
     if (content !== undefined && typeof content !== 'string') {
        return NextResponse.json({ error: "Content must be a string" }, { status: 400 });
    }

    // Authorization check (Editor/Admin or last updater)
    // Fetch the note first to check updated_by
    const { data: existingNote, error: fetchError } = await supabase
        .from(DB_TABLES.COLLABORATIVE_NOTES)
        .select('updated_by')
        .eq('id', noteId)
        .eq('trip_id', tripId)
        .single(); 

    if (fetchError || !existingNote) {
        return NextResponse.json({ error: "Note not found or error fetching note" }, { status: 404 });
    }

    const canUpdateRoles = await checkTripMembershipAndRole(supabase, tripId, user.id, ['admin', 'editor']);
    const isLastUpdater = existingNote.updated_by === user.id;
    
    if (!canUpdateRoles && !isLastUpdater) {
         return NextResponse.json({ error: "Forbidden: You don't have permission to update this note" }, { status: 403 });
    }
    
    // Prepare update object
    const updateData: { title?: string; content?: string; updated_by: string } = { updated_by: user.id };
    if (title !== undefined) {
        updateData.title = title.trim();
    }
    if (content !== undefined) {
        updateData.content = content;
    }

    // Perform update
    const { data: updatedNote, error: updateError } = await supabase
        .from(DB_TABLES.COLLABORATIVE_NOTES)
        .update(updateData)
        .eq('id', noteId)
        .eq('trip_id', tripId)
        .select('id, title, content, updated_at, updated_by') // Return updated note
        .single();

    if (updateError) {
        console.error(`[Notes API PUT ${noteId}] Error updating note:`, updateError);
        return NextResponse.json({ error: "Error updating note" }, { status: 500 });
    }

    return NextResponse.json({ note: updatedNote });

  } catch (error: any) {
    if (error instanceof SyntaxError) { // Catch JSON parsing errors
        console.error(`[Notes API PUT ${noteId}] Invalid JSON:`, error);
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    console.error(`[Notes API PUT ${noteId}] Unexpected error:`, error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

// DELETE: Remove a note
export async function DELETE(request: NextRequest, props: { params: { tripId: string, noteId: string } }) {
  // Extract params properly
  const { tripId, noteId } = props.params;

  if (!tripId || !noteId) return NextResponse.json({ error: "Trip ID and Note ID are required" }, { status: 400 });

  try {
    const supabase = createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Authorization check (Editors or Admins can delete notes)
    const canEdit = await checkTripMembershipAndRole(supabase, tripId, user.id, ['admin', 'editor']);
    if (!canEdit) {
        return NextResponse.json({ error: "Forbidden: You don't have permission to delete this note" }, { status: 403 });
    }

    // Perform deletion
    const { error: deleteError } = await supabase
        .from(DB_TABLES.COLLABORATIVE_NOTES)
        .delete()
        .eq('id', noteId)
        .eq('trip_id', tripId);

    if (deleteError) {
        console.error(`[Notes API DELETE ${noteId}] Error deleting note:`, deleteError);
        // Handle case where note might not exist (e.g., deleted twice) - check error code if needed
        return NextResponse.json({ error: "Error deleting note" }, { status: 500 });
    }

    return NextResponse.json({ message: "Note deleted successfully" });

  } catch (error: any) {
    console.error(`[Notes API DELETE ${noteId}] Unexpected error:`, error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
} 