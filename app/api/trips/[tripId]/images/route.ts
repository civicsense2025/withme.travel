import { type NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';
import { TRIP_ROLES } from '@/utils/constants/status';
import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Define table names directly as string literals to avoid type issues
const TRIP_MEMBERS_TABLE = 'trip_members';
const TRIP_IMAGES_TABLE = 'trip_images';

// Define field constants locally to avoid linting issues
const FIELDS = {
  COMMON: {
    CREATED_AT: 'created_at',
  },
  TRIP_MEMBERS: {
    ROLE: 'role',
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
  },
  TRIP_IMAGES: {
    TRIP_ID: 'trip_id',
    FILE_PATH: 'file_path',
    FILE_NAME: 'file_name',
    CREATED_BY: 'created_by',
    CONTENT_TYPE: 'content_type',
    SIZE_BYTES: 'size_bytes',
  },
};

// Type definition for trip member data
interface TripMember {
  role?: string;
  [key: string]: any;
}

// Helper function to check trip access
async function checkTripAccess(
  supabase: SupabaseClient<Database>,
  tripId: string,
  roles: string[] = ['ADMIN', 'EDITOR', 'CONTRIBUTOR', 'VIEWER']
): Promise<{ hasAccess: boolean }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { hasAccess: false };
    }

    const { data, error } = await supabase
      .from(TRIP_MEMBERS_TABLE)
      .select(FIELDS.TRIP_MEMBERS.ROLE)
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(FIELDS.TRIP_MEMBERS.USER_ID, user.id)
      .maybeSingle();

    if (error || !data) {
      return { hasAccess: false };
    }

    // Safely access role with optional chaining
    const member = data as TripMember;
    const hasAccess = member.role ? roles.includes(member.role) : false;
    return { hasAccess };
  } catch (error) {
    console.error('Error checking trip access:', error);
    return { hasAccess: false };
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const supabase = createRouteHandlerClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to this trip
    const { data, error: membershipError } = await supabase
      .from(TRIP_MEMBERS_TABLE)
      .select(FIELDS.TRIP_MEMBERS.ROLE)
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(FIELDS.TRIP_MEMBERS.USER_ID, user.id)
      .single();

    if (membershipError || !data) {
      return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 });
    }

    // Safely access role using type and optional chaining
    const membership = data as TripMember;
    if (membership.role === TRIP_ROLES.VIEWER) {
      return NextResponse.json(
        { error: "You don't have permission to upload images" },
        { status: 403 }
      );
    }

    // Get form data with the file
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: 'File too large. Maximum size is 5MB.',
        },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `trip-${tripId}-${timestamp}.${fileExtension}`;
    const filePath = `trip-images/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('trip-content')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: publicURLData } = supabase.storage.from('trip-content').getPublicUrl(filePath);

    // Store reference in the database
    const { error: dbError } = await supabase.from(TRIP_IMAGES_TABLE).insert({
      [FIELDS.TRIP_IMAGES.TRIP_ID]: tripId,
      [FIELDS.TRIP_IMAGES.FILE_PATH]: filePath,
      [FIELDS.TRIP_IMAGES.FILE_NAME]: file.name,
      [FIELDS.TRIP_IMAGES.CREATED_BY]: user.id,
      [FIELDS.TRIP_IMAGES.CONTENT_TYPE]: file.type,
      [FIELDS.TRIP_IMAGES.SIZE_BYTES]: file.size,
    });

    if (dbError) {
      console.error('Error storing image reference:', dbError);
      // Continue anyway - the image is already uploaded
    }

    return NextResponse.json({
      success: true,
      url: publicURLData.publicUrl,
    });
  } catch (error: any) {
    console.error('Error handling image upload:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}

// --- GET Handler --- //
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const supabase = createRouteHandlerClient();

    // Check access
    const access = await checkTripAccess(supabase, tripId);
    if (!access.hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch images
    const { data, error } = await supabase
      .from(TRIP_IMAGES_TABLE)
      .select('*')
      .eq(FIELDS.TRIP_IMAGES.TRIP_ID, tripId)
      .order(FIELDS.COMMON.CREATED_AT, { ascending: false });

    if (error) {
      console.error('Error fetching trip images:', error);
      throw new Error('Failed to fetch images');
    }

    return NextResponse.json({ images: data || [] });
  } catch (error) {
    console.error('[API Trip Images GET] Error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
