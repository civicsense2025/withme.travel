import { createClient } from "@/utils/supabase/server"
import { NextResponse, NextRequest } from "next/server"
import { DB_TABLES, TRIP_ROLES } from "@/utils/constants"
import { z } from 'zod';

// Get all notes for a trip
export async function GET(request: NextRequest, props: { params: { tripId: string } }) {
  // Extract tripId properly
  const { tripId } = props.params;

  if (!tripId) return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });

  try {
    const supabase = createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user is *any* member of this trip for reading notes
    // (Using the helper function from the migration)
    const { data: isMember, error: memberCheckError } = await supabase.rpc('is_trip_member_with_role', {
        _trip_id: tripId,
        _user_id: user.id,
        _roles: ['admin', 'editor', 'contributor', 'viewer']
    });

    if (memberCheckError) {
      console.error("[Notes API GET List] Error checking trip membership:", memberCheckError);
      return NextResponse.json({ error: "Error checking trip membership" }, { status: 500 });
    }

    if (!isMember) {
      return NextResponse.json({ error: "Forbidden: You don't have access to this trip's notes" }, { status: 403 });
    }

    // Fetch list of notes (id, title, updated_at, updated_by profile)
    const { data: notes, error: notesError } = await supabase
      .from(DB_TABLES.COLLABORATIVE_NOTES) // Use constant
      .select(`
        id,
        title,
        updated_at,
        profiles:updated_by (
          id,
          name,
          avatar_url
        )
      `)
      .eq("trip_id", tripId)
      .order("updated_at", { ascending: false }); // Order by most recently updated

    if (notesError) {
      console.error("[Notes API GET List] Error fetching notes:", notesError);
      return NextResponse.json({ error: "Error fetching notes list" }, { status: 500 });
    }

    // Return the list of notes (can be empty)
    return NextResponse.json({ notes: notes || [] });

  } catch (error: any) {
    console.error("[Notes API GET List] Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

const createNoteSchema = z.object({
    title: z.string().min(1, "Title is required").max(100),
    content: z.string().optional().nullable(),
    type: z.enum(['text', 'list', 'checklist', 'location']).default('text'),
    item_id: z.string().uuid().optional().nullable(), // Allow associating with itinerary item
});

// POST: Create a new note for a trip
export async function POST(request: NextRequest, props: { params: { tripId: string } }) {
  // Extract tripId properly
  const { tripId } = props.params;

  if (!tripId) return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });

  try {
    const supabase = createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user has permission (Admin or Editor) to create notes
    // (Using the helper function from the migration)
     const { data: canCreate, error: permissionCheckError } = await supabase.rpc('is_trip_member_with_role', {
        _trip_id: tripId,
        _user_id: user.id,
        _roles: ['admin', 'editor']
    });

    if (permissionCheckError) {
      console.error("[Notes API POST] Error checking permission:", permissionCheckError);
      return NextResponse.json({ error: "Error checking create permission" }, { status: 500 });
    }

    if (!canCreate) {
      return NextResponse.json({ error: "Forbidden: You don't have permission to create notes for this trip" }, { status: 403 });
    }

    // User has permission, proceed...
    const { title, content } = await request.json();

    // Validate input
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ error: "Title is required and must be a non-empty string" }, { status: 400 });
    }
    if (typeof content !== 'string') {
      // Allow empty string for content, but ensure it's a string
      return NextResponse.json({ error: "Content must be a string" }, { status: 400 });
    }

    // Create new note
    const { data: newNote, error: insertError } = await supabase
      .from(DB_TABLES.COLLABORATIVE_NOTES) // Use constant
      .insert({
        trip_id: tripId,
        title: title.trim(), // Trim title
        content,
        updated_by: user.id,
        // updated_at is handled by trigger
      })
      .select(`
        id,
        title,
        content, 
        updated_at,
        profiles:updated_by (
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (insertError) {
      console.error("[Notes API POST] Error creating note:", insertError);
      // Handle potential unique constraint errors if needed, though unlikely with UUID
      return NextResponse.json({ error: "Error creating note" }, { status: 500 });
    }

    return NextResponse.json({ note: newNote }, { status: 201 }); // Return 201 Created status

  } catch (error: any) {
     if (error instanceof SyntaxError) { // Catch JSON parsing errors
      console.error("[Notes API POST] Invalid JSON:", error);
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    console.error("[Notes API POST] Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
