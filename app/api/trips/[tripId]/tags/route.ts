import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse, NextRequest } from 'next/server';
import { TABLES, FIELDS, ENUMS } from "@/utils/constants/database";
import { z } from 'zod';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  console.log(`--- PUT /api/trips/${tripId}/tags ---`); // Log route entry

  if (!tripId) {
    console.log('Tag Sync Error: Missing tripId');
    return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  // 1. Get authenticated user
  console.log('Tag Sync: Attempting to get user...');
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Tag Sync Auth Error:', authError); // Log the specific auth error
    console.log('Tag Sync User:', user); // Log the user object (likely null)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  console.log('Tag Sync: User found:', user.id); // Log successful user ID

  // 2. Validate request body
  let submittedTagNames: string[];
  try {
    const body = await request.json();
    const validatedBody = tagSyncSchema.parse(body);
    submittedTagNames = validatedBody.tags.map((name) => name.trim()).filter(Boolean); // Trim and remove empty strings
  } catch (error) {
    console.error('Tag Sync Validation Error:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // 3. Check user permission (Admin or Editor) for the trip
  // Important: Reuse permission check logic if available elsewhere
  const { data: member, error: permissionError } = await supabase
    .from(TABLES.TRIP_MEMBERS)
    .select('user_id')
    .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
    .eq(FIELDS.TRIP_MEMBERS.USER_ID, user.id)
    .in('role', [ENUMS.ENUMS.TRIP_ROLES.ADMIN, ENUMS.ENUMS.TRIP_ROLES.EDITOR]) // Use role enum constants
    .maybeSingle();

  if (permissionError) {
    console.error('Tag Sync Permission Check Error:', permissionError);
    return NextResponse.json({ error: 'Failed to check permissions' }, { status: 500 });
  }
  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // --- Tag Synchronization Logic ---
  try {
    // Use a transaction (if your setup supports it easily, e.g., via RPC)
    // For simplicity here, we'll do sequential operations.

    // 4. Get IDs for submitted tag names (upserting new tags)
    // Generate slugs along with names
    const upsertTags = submittedTagNames.map((name) => ({
      name: name.trim(), // Ensure name is trimmed
      slug: generateSlug(name.trim()), // Generate slug from trimmed name
    }));

    // Check if upsertTags is empty after mapping (if input was just empty strings)
    if (upsertTags.length === 0 && submittedTagNames.length > 0) {
      // Handle case where only invalid tags were submitted, maybe return success or specific message
      console.log('Tag Sync: No valid tags to upsert after trimming.');
    } else if (upsertTags.length === 0 && submittedTagNames.length === 0) {
      // Handle case where the input array was empty - likely means remove all tags
      console.log('Tag Sync: Empty tag array submitted.');
    }

    // Proceed with upsert only if there are valid tags
    let upsertedTags: { id: string; name: string }[] | null = [];
    if (upsertTags.length > 0) {
      const { data, error: upsertError } = await supabase
        .from(TABLES.TAGS)
        .upsert(upsertTags, { onConflict: 'name', ignoreDuplicates: false })
        .select('id, name');

      if (upsertError) {
        console.error('Tag Upsert Error:', upsertError);
        throw new Error('Failed to upsert tags');
      }
      upsertedTags = data;
    }

    const submittedTagIds = upsertedTags?.map((tag) => tag.id) || [];

    // 5. Get current tag associations for the trip
    const { data: currentTripTags, error: fetchCurrentError } = await supabase
      .from(TABLES.TRIP_TAGS)
      .select('tag_id')
      .eq(FIELDS.TRIP_TAGS.TRIP_ID, tripId);

    if (fetchCurrentError) {
      console.error('Fetch Current Tags Error:', fetchCurrentError);
      throw new Error('Failed to fetch current tags');
    }
    const currentTagIds = currentTripTags?.map((tt) => tt.tag_id) || [];

    // 6. Calculate tags to add and remove
    const tagIdsToAdd = submittedTagIds.filter((id) => !currentTagIds.includes(id));
    const tagIdsToRemove = currentTagIds.filter((id) => !submittedTagIds.includes(id));

    // 7. Remove old associations
    if (tagIdsToRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from(TABLES.TRIP_TAGS)
        .delete()
        .eq(FIELDS.TRIP_TAGS.TRIP_ID, tripId)
        .in(FIELDS.TRIP_TAGS.TAG_ID, tagIdsToRemove);

      if (deleteError) {
        console.error('Tag Delete Error:', deleteError);
        throw new Error('Failed to remove old tags');
      }
    }

    // 8. Add new associations
    if (tagIdsToAdd.length > 0) {
      const newLinks = tagIdsToAdd.map((tag_id) => ({
        trip_id: tripId,
        tag_id: tag_id,
      }));
      const { error: insertError } = await supabase.from(TABLES.TRIP_TAGS).insert(newLinks);

      if (insertError) {
        console.error('Tag Insert Error:', insertError);
        throw new Error('Failed to add new tags');
      }
    }

    return NextResponse.json({ message: 'Tags synced successfully' }, { status: 200 });
  } catch (error) {
    console.error('Tag Sync Error:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred during tag synchronization';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET: Fetch all tags associated with a trip (via notes or directly if applicable)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  // Extract tripId properly
  const { tripId } = await params;

  if (!tripId) return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });

  try {
    // ... existing code ...
  } catch (error) {
    // ... existing error handling ...
  }
}
