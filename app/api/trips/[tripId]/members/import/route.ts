import { NextRequest, NextResponse } from 'next/server';
import { importTripMembers } from '@/lib/api/tripMembers';
import { z } from 'zod';

// Schema for validating member data
const memberSchema = z.object({
  members: z.array(
    z.object({
      email: z.string().email(),
      role: z.enum(['admin', 'editor', 'viewer']).default('viewer'),
      name: z.string().optional(),
    })
  ),
});

// POST /api/trips/[tripId]/members/import
export async function POST(request: NextRequest, { params }: { params: { tripId: string } }) {
  const { tripId } = params;
  try {
    // Validate request body
    const requestData = await request.json();
    const validation = memberSchema.safeParse(requestData);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid member data', details: validation.error.format() },
        { status: 400 }
      );
    }
    const { members } = validation.data;
    // Use centralized API for import
    const result = await importTripMembers(tripId, members);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    // TODO: Send invitation emails for invited users
    return NextResponse.json({ success: true, ...result.data });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
