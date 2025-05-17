import { NextRequest, NextResponse } from 'next/server';
import { listTripTags, addTripTag, deleteTripTag } from '@/lib/api/tags';
import { z } from 'zod';

// Define trip roles constants
const TRIP_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  CONTRIBUTOR: 'contributor',
  VIEWER: 'viewer',
} as const;

// Helper function to generate a simple slug
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric characters except hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens
};

// Schema for validating the request body
const tagSyncSchema = z.object({
  tags: z.array(z.string()), // Expect an array of tag names
});

// Helper function - Assume is_trip_member_with_role exists
// Or define locally/import if moved to shared utils
async function checkTripMembershipAndRole(
  supabase: any,
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

// GET: Fetch all tags associated with a trip (via notes or directly if applicable)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  if (!tripId) return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
  try {
    const result = await listTripTags(tripId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ tags: result.data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  if (!tripId) return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
  try {
    const body = await request.json();
    const validation = tagSyncSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request body', details: validation.error.format() }, { status: 400 });
    }
    const submittedTagNames = validation.data.tags.map((name) => name.trim()).filter(Boolean);
    // TODO: Optimize with batch upsert/delete in lib/api/tags
    // Fetch current tags
    const currentTagsResult = await listTripTags(tripId);
    if (!currentTagsResult.success) {
      return NextResponse.json({ error: currentTagsResult.error }, { status: 500 });
    }
    const currentTagNames = currentTagsResult.data.map((tag) => tag.name);
    // Add new tags
    for (const name of submittedTagNames) {
      if (!currentTagNames.includes(name)) {
        await addTripTag(tripId, { name });
      }
    }
    // Remove tags not in submitted list
    for (const tag of currentTagsResult.data) {
      if (!submittedTagNames.includes(tag.name)) {
        await deleteTripTag(tripId, tag.id);
      }
    }
    return NextResponse.json({ message: 'Tags synced successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to sync tags' }, { status: 500 });
  }
}
