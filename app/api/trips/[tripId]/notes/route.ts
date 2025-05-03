import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';
import { z } from 'zod';
import { Database } from '@/types/database.types';

// Define constants for trip roles and note types
const TRIP_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  CONTRIBUTOR: 'contributor',
  VIEWER: 'viewer'
} as const;

const NOTE_TYPES = {
  TEXT: 'text',
  LIST: 'list',
  CHECKLIST: 'checklist',
  LOCATION: 'location'
} as const;

// Define field constants
const FIELDS = {
  TRIP_NOTES: {
    ID: 'id',
    TRIP_ID: 'trip_id',
    TITLE: 'title',
    CONTENT: 'content',
    UPDATED_AT: 'updated_at',
    UPDATED_BY: 'updated_by',
    TYPE: 'type',
    ITEM_ID: 'item_id'
  },
  PROFILES: {
    ID: 'id',
    NAME: 'name',
    AVATAR_URL: 'avatar_url'
  }
};

// Get all notes for a trip
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const supabase = await createRouteHandlerClient();

  if (!tripId) return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });

  try {
    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is *any* member of this trip for reading notes
    const { data: isMember, error: memberCheckError } = await supabase.rpc(
      'is_trip_member_with_role',
      {
        _trip_id: tripId,
        _user_id: user.id,
        _roles: [
          TRIP_ROLES.ADMIN,
          TRIP_ROLES.EDITOR,
          TRIP_ROLES.CONTRIBUTOR,
          TRIP_ROLES.VIEWER,
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
      .from('trip_notes')
      .select(
        `
        id,
        title,
        updated_at,
        profiles:updated_by (
          id,
          name,
          avatar_url
        )
      `
      )
      .eq('trip_id', tripId)
      .order('updated_at', { ascending: false });

    if (notesError) {
      console.error('[Notes API GET List] Error fetching notes:', notesError);
      return NextResponse.json({ error: 'Error fetching notes list' }, { status: 500 });
    }

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
      NOTE_TYPES.TEXT,
      NOTE_TYPES.LIST,
      NOTE_TYPES.CHECKLIST,
      NOTE_TYPES.LOCATION,
    ])
    .default(NOTE_TYPES.TEXT),
  item_id: z.string().uuid().optional().nullable(), // Allow associating with itinerary item
});

// POST: Create a new note for a trip
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const supabase = await createRouteHandlerClient();

  if (!tripId) return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });

  try {
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
        _roles: [TRIP_ROLES.ADMIN, TRIP_ROLES.EDITOR],
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
      console.error('[Notes API POST] Error parsing request body:', validationError);
      return NextResponse.json({ error: 'Could not parse request body' }, { status: 400 });
    }

    // Use validated data
    const { title, content, type, item_id } = validatedData;

    // Create new note
    const { data: newNote, error: insertError } = await supabase
      .from('trip_notes')
      .insert({
        trip_id: tripId,
        title: title.trim(),
        content: content,
        type: type,
        item_id: item_id,
        updated_by: user.id,
        // updated_at is handled by trigger
      })
      .select(
        `
        id,
        title,
        content,
        updated_at,
        profiles:updated_by (
          id,
          name,
          avatar_url
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