import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { Database } from '@/types/database.types';
import { createAPIResponse } from '@/utils/api-response';
import { createErrorResponse } from '@/utils/api-error';
import { auth } from '@/utils/auth/server';
import { canViewTrip } from '@/utils/trips/permissions';
import { db, executeQuery } from '@/utils/db';

// Define constants for trip roles and note types
const TRIP_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  CONTRIBUTOR: 'contributor',
  VIEWER: 'viewer',
} as const;

const NOTE_TYPES = {
  TEXT: 'text',
  LIST: 'list',
  CHECKLIST: 'checklist',
  LOCATION: 'location',
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
    ITEM_ID: 'item_id',
  },
  PROFILES: {
    ID: 'id',
    NAME: 'name',
    AVATAR_URL: 'avatar_url',
  },
};

// Get all notes for a trip
export async function GET(request: NextRequest, { params }: { params: { tripId: string } }) {
  try {
    const tripId = params.tripId;

    // Check authentication
    const userId = (await auth())?.userId;
    if (!userId) {
      return createErrorResponse({
        status: 401,
        message: 'Unauthorized',
      });
    }

    // Check trip access permissions
    const canAccess = await canViewTrip(tripId, userId);
    if (!canAccess) {
      return createErrorResponse({
        status: 403,
        message: 'You do not have permission to view this trip',
      });
    }

    // Fetch notes
    const notes = await db.query.collaborative_sessions.findFirst({
      where: (notes, { eq, and }) =>
        and(eq(notes.trip_id, tripId), eq(notes.document_type, 'notes')),
      columns: {
        content: true,
        id: true,
      },
    });

    if (!notes) {
      // Create default notes if they don't exist
      const sessionId = crypto.randomUUID();
      const content = {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }],
      };

      const newNotes = await db
        .insert(db.collaborative_sessions)
        .values({
          trip_id: tripId,
          document_id: tripId,
          document_type: 'notes',
          content: content,
          id: sessionId,
        })
        .returning();

      if (!newNotes || newNotes.length === 0) {
        throw new Error('Failed to create notes');
      }

      // Set up collaboration session
      const sessionToken = crypto.randomUUID();
      const collaborationSession = {
        sessionId: sessionId,
        accessToken: sessionToken,
      };

      return createAPIResponse({
        content: JSON.stringify(content),
        collaborationSession,
      });
    }

    // Set up collaboration session for existing notes
    const sessionToken = crypto.randomUUID();
    const collaborationSession = {
      sessionId: notes.id,
      accessToken: sessionToken,
    };

    return createAPIResponse({
      content: notes.content ? JSON.stringify(notes.content) : '',
      collaborationSession,
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return createErrorResponse({
      status: 500,
      message: 'Failed to fetch notes',
    });
  }
}

const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  content: z.string().optional().nullable(),
  type: z
    .enum([NOTE_TYPES.TEXT, NOTE_TYPES.LIST, NOTE_TYPES.CHECKLIST, NOTE_TYPES.LOCATION])
    .default(NOTE_TYPES.TEXT),
  item_id: z.string().uuid().optional().nullable(), // Allow associating with itinerary item
});

// POST: Create a new note for a trip
export async function POST(request: NextRequest, { params }: { params: { tripId: string } }) {
  try {
    const tripId = params.tripId;

    // Check authentication
    const userId = (await auth())?.userId;
    if (!userId) {
      return createErrorResponse({
        status: 401,
        message: 'Unauthorized',
      });
    }

    // Check trip permissions
    const canAccess = await canViewTrip(tripId, userId);
    if (!canAccess) {
      return createErrorResponse({
        status: 403,
        message: 'You do not have permission to access this trip',
      });
    }

    // Check if notes already exist
    const existingNotes = await db.query.collaborative_sessions.findFirst({
      where: (notes, { eq, and }) =>
        and(eq(notes.trip_id, tripId), eq(notes.document_type, 'notes')),
    });

    if (existingNotes) {
      return createAPIResponse({
        content: existingNotes.content ? JSON.stringify(existingNotes.content) : '',
      });
    }

    // Create new notes
    const sessionId = crypto.randomUUID();
    const defaultContent = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }],
    };

    const newNotes = await db
      .insert(db.collaborative_sessions)
      .values({
        trip_id: tripId,
        document_id: tripId,
        document_type: 'notes',
        content: defaultContent,
        id: sessionId,
      })
      .returning();

    if (!newNotes || newNotes.length === 0) {
      throw new Error('Failed to create notes');
    }

    return createAPIResponse({
      content: JSON.stringify(defaultContent),
    });
  } catch (error) {
    console.error('Error creating notes:', error);
    return createErrorResponse({
      status: 500,
      message: 'Failed to create notes',
    });
  }
}

/**
 * PUT handler - update collaborative notes for a trip
 */
export async function PUT(request: NextRequest, { params }: { params: { tripId: string } }) {
  try {
    const tripId = params.tripId;

    // Check authentication
    const userId = (await auth())?.userId;
    if (!userId) {
      return createErrorResponse({
        status: 401,
        message: 'Unauthorized',
      });
    }

    // Check trip edit permissions
    const canAccess = await canViewTrip(tripId, userId);
    if (!canAccess) {
      return createErrorResponse({
        status: 403,
        message: 'You do not have permission to edit this trip',
      });
    }

    // Get request body
    const body = await request.json();
    const content = body.content;

    if (content === undefined) {
      return createErrorResponse({
        status: 400,
        message: 'Content is required',
      });
    }

    // Check if notes exist
    const notes = await db.query.collaborative_sessions.findFirst({
      where: (notes, { eq, and }) =>
        and(eq(notes.trip_id, tripId), eq(notes.document_type, 'notes')),
    });

    if (!notes) {
      // Create notes if they don't exist
      const sessionId = crypto.randomUUID();
      let contentObj;

      try {
        contentObj = typeof content === 'string' ? JSON.parse(content) : content;
      } catch (e) {
        contentObj = {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: content }] }],
        };
      }

      const newNotes = await db
        .insert(db.collaborative_sessions)
        .values({
          trip_id: tripId,
          document_id: tripId,
          document_type: 'notes',
          content: contentObj,
          id: sessionId,
        })
        .returning();

      if (!newNotes || newNotes.length === 0) {
        throw new Error('Failed to create notes');
      }

      return createAPIResponse({
        content: typeof content === 'string' ? content : JSON.stringify(content),
      });
    }

    // Update existing notes
    let contentToSave;

    try {
      contentToSave = typeof content === 'string' ? JSON.parse(content) : content;
    } catch (e) {
      contentToSave = {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: content }] }],
      };
    }

    await db
      .update(db.collaborative_sessions)
      .set({
        content: contentToSave,
        updated_at: new Date().toISOString(),
      })
      .where(({ and, eq }) =>
        and(
          eq(db.collaborative_sessions.trip_id, tripId),
          eq(db.collaborative_sessions.document_type, 'notes')
        )
      );

    return createAPIResponse({
      content: typeof content === 'string' ? content : JSON.stringify(content),
    });
  } catch (error) {
    console.error('Error updating notes:', error);
    return createErrorResponse({
      status: 500,
      message: 'Failed to update notes',
    });
  }
}
