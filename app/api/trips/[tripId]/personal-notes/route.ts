import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse } from '@/utils/api-response';
import { ApiErrorResponse } from '@/utils/api-error';
import { auth } from '@/utils/auth/server';
import { canEditTrip, canViewTrip } from '@/utils/trips/permissions';
import { db } from '@/utils/db';

export const dynamic = 'force-dynamic';

/**
 * GET handler - fetch personal notes for a trip
 */
export async function GET(request: NextRequest, { params }: { params: { tripId: string } }) {
  try {
    const tripId = params.tripId;

    // Check authentication
    const user = await auth();
    if (!user?.userId) {
      return new ApiErrorResponse('Unauthorized', 401);
    }

    // Check trip access permissions
    const canAccess = await canViewTrip(tripId, user.userId);
    if (!canAccess) {
      return new ApiErrorResponse('You do not have permission to view this trip', 403);
    }

    // Fetch personal notes for this user in this trip
    const notes = await db.query.personal_notes.findMany({
      where: (notes: any, { eq, and }: any) =>
        and(eq(notes.trip_id, tripId), eq(notes.user_id, user.userId)),
      orderBy: (notes: any, { desc }: any) => [desc(notes.updated_at)],
    });

    return createApiResponse(notes);
  } catch (error) {
    console.error('Error fetching personal notes:', error);
    return new ApiErrorResponse('Failed to fetch personal notes', 500);
  }
}

/**
 * POST handler - create a personal note
 */
export async function POST(request: NextRequest, { params }: { params: { tripId: string } }) {
  try {
    const tripId = params.tripId;

    // Check authentication
    const user = await auth();
    if (!user?.userId) {
      return new ApiErrorResponse('Unauthorized', 401);
    }

    // Check trip edit permissions
    const canAccess = await canViewTrip(tripId, user.userId);
    if (!canAccess) {
      return new ApiErrorResponse('You do not have permission to view this trip', 403);
    }

    // Get request body
    const body = await request.json();
    const { title, content } = body;

    if (!title) {
      return new ApiErrorResponse('Title is required', 400);
    }

    // Create new personal note
    const noteId = crypto.randomUUID();
    const newNote = await db
      .insert(db.personal_notes)
      .values({
        id: noteId,
        trip_id: tripId,
        user_id: user.userId,
        title,
        content: content || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning();

    if (!newNote || newNote.length === 0) {
      throw new Error('Failed to create personal note');
    }

    return createApiResponse(newNote[0], 201);
  } catch (error) {
    console.error('Error creating personal note:', error);
    return new ApiErrorResponse('Failed to create personal note', 500);
  }
}
