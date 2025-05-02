import { createServerSupabaseClient } from '@/utils/supabase/server';
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
// import { DB_TABLES, DB_FIELDS } from '@/utils/constants/database'; // Removed old import

// Local constants workaround to avoid import/linter issues
const LOCAL_TABLES = {
  TRIP_NOTES: 'trip_notes',
  PROFILES: 'profiles',
};

const LOCAL_FIELDS = {
  TRIP_NOTES: {
    ID: 'id',
    TRIP_ID: 'trip_id',
    TITLE: 'title',
    CONTENT: 'content',
    TYPE: 'type',
    ITEM_ID: 'item_id',
    UPDATED_AT: 'updated_at',
    UPDATED_BY: 'updated_by',
  },
  PROFILES: {
    ID: 'id',
    NAME: 'name',
    AVATAR_URL: 'avatar_url',
  },
};

const LOCAL_ENUMS = {
  TRIP_ROLES: {
    ADMIN: 'ADMIN',
    EDITOR: 'EDITOR',
    CONTRIBUTOR: 'CONTRIBUTOR',
    VIEWER: 'VIEWER',
  },
  NOTE_TYPES: {
    TEXT: 'text',
    LIST: 'list',
    CHECKLIST: 'checklist',
    LOCATION: 'location',
  },
};

// Get all notes for a trip
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  // Extract tripId properly
  const { tripId } = await params;

  if (!tripId) return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });

  try {
    const supabase = createServerSupabaseClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is *any* member of this trip for reading notes
    // (Using the helper function from the migration)
    const { data: isMember, error: memberCheckError } = await supabase.rpc(
      'is_trip_member_with_role',
      {
        _trip_id: tripId,
        _user_id: user.id,
        _roles: [
          LOCAL_ENUMS.TRIP_ROLES.ADMIN,
          LOCAL_ENUMS.TRIP_ROLES.EDITOR,
          LOCAL_ENUMS.TRIP_ROLES.CONTRIBUTOR,
          LOCAL_ENUMS.TRIP_ROLES.VIEWER,
        ],
      }
    );

    if (memberCheckError) {
      console.error('[Notes API GET List] Error checking trip membership:', memberCheckError);
      return NextResponse.json({ error: 'Error checking trip membership' }, { status: 500 });
    }

    if (!isMember) {
      return NextResponse.json(
        { error: "Forbidden: You don't have access to this trip's notes" },
        { status: 403 }
      );
    }

    // Fetch list of notes (id, title, updated_at, updated_by profile)
    const { data: notes, error: notesError } = await supabase
      .from(LOCAL_TABLES.TRIP_NOTES) // Use local constant
      .select(
        `
        ${LOCAL_FIELDS.TRIP_NOTES.ID},
        ${LOCAL_FIELDS.TRIP_NOTES.TITLE},
        ${LOCAL_FIELDS.TRIP_NOTES.UPDATED_AT},
        ${LOCAL_TABLES.PROFILES}:${LOCAL_FIELDS.TRIP_NOTES.UPDATED_BY} (
          ${LOCAL_FIELDS.PROFILES.ID},
          ${LOCAL_FIELDS.PROFILES.NAME},
          ${LOCAL_FIELDS.PROFILES.AVATAR_URL}
        )
      `
      )
      .eq(LOCAL_FIELDS.TRIP_NOTES.TRIP_ID, tripId) // Use local constant
      .order(LOCAL_FIELDS.TRIP_NOTES.UPDATED_AT, { ascending: false }); // Use local constant

    if (notesError) {
      console.error('[Notes API GET List] Error fetching notes:', notesError);
      return NextResponse.json({ error: 'Error fetching notes list' }, { status: 500 });
    }

    // Return the list of notes (can be empty)
    return NextResponse.json({ notes: notes || [] });
  } catch (error: any) {
    console.error('[Notes API GET List] Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  content: z.string().optional().nullable(),
  type: z
    .enum([
      LOCAL_ENUMS.NOTE_TYPES.TEXT,
      LOCAL_ENUMS.NOTE_TYPES.LIST,
      LOCAL_ENUMS.NOTE_TYPES.CHECKLIST,
      LOCAL_ENUMS.NOTE_TYPES.LOCATION,
    ])
    .default(LOCAL_ENUMS.NOTE_TYPES.TEXT),
  item_id: z.string().uuid().optional().nullable(), // Allow associating with itinerary item
});

// POST: Create a new note for a trip
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  // Extract tripId properly
  const { tripId } = await params;

  if (!tripId) return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });

  try {
    const supabase = createServerSupabaseClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user has permission (Admin or Editor) to create notes
    const { data: canCreate, error: permissionCheckError } = await supabase.rpc(
      'is_trip_member_with_role',
      {
        _trip_id: tripId,
        _user_id: user.id,
        _roles: [LOCAL_ENUMS.TRIP_ROLES.ADMIN, LOCAL_ENUMS.TRIP_ROLES.EDITOR],
      }
    );

    if (permissionCheckError) {
      console.error('[Notes API POST] Error checking permission:', permissionCheckError);
      return NextResponse.json({ error: 'Error checking create permission' }, { status: 500 });
    }

    if (!canCreate) {
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to create notes for this trip" },
        { status: 403 }
      );
    }

    // Validate request body using Zod schema
    let validatedData: z.infer<typeof createNoteSchema>;
    try {
      const body = await request.json();
      validatedData = createNoteSchema.parse(body);
    } catch (validationError: any) {
      if (validationError instanceof z.ZodError) {
        console.error('[Notes API POST] Validation failed:', validationError.issues);
        return NextResponse.json(
          { error: 'Invalid input', issues: validationError.issues },
          { status: 400 }
        );
      } else if (validationError instanceof SyntaxError) {
        console.error('[Notes API POST] Invalid JSON:', validationError);
        return NextResponse.json({ error: 'Invalid JSON format in request body' }, { status: 400 });
      }
      // Handle other potential errors during body parsing
      console.error('[Notes API POST] Error parsing request body:', validationError);
      return NextResponse.json({ error: 'Could not parse request body' }, { status: 400 });
    }

    // Use validated data
    const { title, content, type, item_id } = validatedData;

    // Create new note
    const { data: newNote, error: insertError } = await supabase
      .from(LOCAL_TABLES.TRIP_NOTES) // Use local constant
      .insert({
        [LOCAL_FIELDS.TRIP_NOTES.TRIP_ID]: tripId,
        [LOCAL_FIELDS.TRIP_NOTES.TITLE]: title.trim(), // Trim title
        [LOCAL_FIELDS.TRIP_NOTES.CONTENT]: content,
        [LOCAL_FIELDS.TRIP_NOTES.TYPE]: type,
        [LOCAL_FIELDS.TRIP_NOTES.ITEM_ID]: item_id,
        [LOCAL_FIELDS.TRIP_NOTES.UPDATED_BY]: user.id,
        // updated_at is handled by trigger
      })
      .select(
        `
        ${LOCAL_FIELDS.TRIP_NOTES.ID},
        ${LOCAL_FIELDS.TRIP_NOTES.TITLE},
        ${LOCAL_FIELDS.TRIP_NOTES.CONTENT},
        ${LOCAL_FIELDS.TRIP_NOTES.UPDATED_AT},
        ${LOCAL_TABLES.PROFILES}:${LOCAL_FIELDS.TRIP_NOTES.UPDATED_BY} (
          ${LOCAL_FIELDS.PROFILES.ID},
          ${LOCAL_FIELDS.PROFILES.NAME},
          ${LOCAL_FIELDS.PROFILES.AVATAR_URL}
        )
      `
      )
      .single();

    if (insertError) {
      console.error('[Notes API POST] Error creating note:', insertError);
      // Handle potential unique constraint errors if needed, though unlikely with UUID
      return NextResponse.json({ error: 'Error creating note' }, { status: 500 });
    }

    return NextResponse.json({ note: newNote }, { status: 201 }); // Return 201 Created status
  } catch (error: any) {
    console.error('[Notes API POST] Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
