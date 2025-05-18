import { NextRequest, NextResponse } from 'next/server';
import { createAPIResponseWithoutHelper, ApiError } from '@/utils/api';
import { requireAuth } from '@/utils/auth';
import { db } from '@/utils/db';
import { eq, and } from '@/utils/db-operators';

export const dynamic = 'force-dynamic';

/**
 * GET handler - fetch a specific personal note
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string; noteId: string } }
) {
  try {
    const { tripId, noteId } = params;

    // Check authentication
    const user = await requireAuth();

    // Fetch the specific note, ensuring it belongs to this user
    const note = await db.personal_notes.findFirst({
      where: and(
        eq(db.personal_notes.id, noteId),
        eq(db.personal_notes.trip_id, tripId),
        eq(db.personal_notes.user_id, user.id)
      ),
    });

    if (!note) {
      return createAPIResponseWithoutHelper(
        { error: 'Note not found or you do not have permission to view it' },
        { status: 404 }
      );
    }

    return createAPIResponseWithoutHelper(note);
  } catch (error) {
    console.error('Error fetching personal note:', error);
    if (error instanceof ApiError) {
      return createAPIResponseWithoutHelper({ error: error.message }, { status: error.statusCode });
    }
    return createAPIResponseWithoutHelper(
      { error: 'Failed to fetch personal note' },
      { status: 500 }
    );
  }
}

/**
 * PUT handler - update a personal note
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { tripId: string; noteId: string } }
) {
  try {
    const { tripId, noteId } = params;

    // Check authentication
    const user = await requireAuth();

    // Check if the note exists and belongs to this user
    const existingNote = await db.personal_notes.findFirst({
      where: and(
        eq(db.personal_notes.id, noteId),
        eq(db.personal_notes.trip_id, tripId),
        eq(db.personal_notes.user_id, user.id)
      ),
    });

    if (!existingNote) {
      return createAPIResponseWithoutHelper(
        { error: 'Note not found or you do not have permission to edit it' },
        { status: 404 }
      );
    }

    // Get request body
    const body = await request.json();
    const { title, content } = body;

    if (!title) {
      return createAPIResponseWithoutHelper({ error: 'Title is required' }, { status: 400 });
    }

    // Update the note
    const updatedNote = await db.personal_notes
      .update({
        where: and(
          eq(db.personal_notes.id, noteId),
          eq(db.personal_notes.trip_id, tripId),
          eq(db.personal_notes.user_id, user.id)
        ),
        data: {
          title,
          content: content || '',
          updated_at: new Date().toISOString(),
        },
      })
      .returning();

    return createAPIResponseWithoutHelper(updatedNote);
  } catch (error) {
    console.error('Error updating personal note:', error);
    if (error instanceof ApiError) {
      return createAPIResponseWithoutHelper({ error: error.message }, { status: error.statusCode });
    }
    return createAPIResponseWithoutHelper(
      { error: 'Failed to update personal note' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler - delete a personal note
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tripId: string; noteId: string } }
) {
  try {
    const { tripId, noteId } = params;

    // Check authentication
    const user = await requireAuth();

    // Check if the note exists and belongs to this user
    const existingNote = await db.personal_notes.findFirst({
      where: and(
        eq(db.personal_notes.id, noteId),
        eq(db.personal_notes.trip_id, tripId),
        eq(db.personal_notes.user_id, user.id)
      ),
    });

    if (!existingNote) {
      return createAPIResponseWithoutHelper(
        { error: 'Note not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    // Delete the note
    await db.personal_notes.delete({
      where: and(
        eq(db.personal_notes.id, noteId),
        eq(db.personal_notes.trip_id, tripId),
        eq(db.personal_notes.user_id, user.id)
      ),
    });

    return createAPIResponseWithoutHelper({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting personal note:', error);
    if (error instanceof ApiError) {
      return createAPIResponseWithoutHelper({ error: error.message }, { status: error.statusCode });
    }
    return createAPIResponseWithoutHelper(
      { error: 'Failed to delete personal note' },
      { status: 500 }
    );
  }
}
