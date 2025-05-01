import { getRouteHandlerClient } from '@/utils/supabase/unified';
import { API_ROUTES, PAGE_ROUTES } from '@/utils/constants/routes';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { Trip } from '@/types/database.types';
import chalk from 'chalk';
import { differenceInCalendarDays, parseISO } from 'date-fns';

// Use string literals for database tables and fields to avoid import issues
const TABLES = {
  TRIPS: 'trips',
  TRIP_MEMBERS: 'trip_members',
  TAGS: 'tags',
  TRIP_TAGS: 'trip_tags',
  DESTINATIONS: 'destinations',
  ITINERARY_SECTIONS: 'itinerary_sections'
} as const;

const FIELDS = {
  COMMON: {
    ID: 'id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
  TRIPS: {
    NAME: 'name',
    DESCRIPTION: 'description',
    START_DATE: 'start_date',
    END_DATE: 'end_date',
    CREATED_BY: 'created_by',
    DESTINATION_ID: 'destination_id',
    COVER_IMAGE_URL: 'cover_image_url',
    ID: 'id'
  },
  TRIP_MEMBERS: {
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
    ROLE: 'role',
    JOINED_AT: 'joined_at'
  },
  TAGS: {
    ID: 'id',
    NAME: 'name'
  },
  TRIP_TAGS: {
    TRIP_ID: 'trip_id',
    TAG_ID: 'tag_id'
  },
  DESTINATIONS: {
    ID: 'id',
    IMAGE_URL: 'image_url'
  },
  ITINERARY_SECTIONS: {
    TRIP_ID: 'trip_id',
    DAY_NUMBER: 'day_number',
    POSITION: 'position',
    DATE: 'date'
  }
} as const;

const TRIP_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  CONTRIBUTOR: 'contributor'
} as const;

// Helper function to process tags: find existing or create new ones
async function processTags(supabaseAdmin: any, tagNames: string[]): Promise<string[]> {
  if (!tagNames || tagNames.length === 0) {
    return [];
  }

  const uniqueTagNames = [...new Set(tagNames)].filter((name) => name.trim() !== '');
  if (uniqueTagNames.length === 0) {
    return [];
  }

  // Use string literals for field names instead of constants
  const tagsToUpsert = uniqueTagNames.map((name) => ({
    name: name.trim().toLowerCase(),
  }));

  const { data: tags, error: tagUpsertError } = await supabaseAdmin
    .from('tags')
    .upsert(tagsToUpsert, { onConflict: 'name' })
    .select('id');

  if (tagUpsertError) {
    console.error('Error upserting tags:', tagUpsertError);
    throw new Error('Failed to process tags');
  }

  if (!tags || tags.length !== uniqueTagNames.length) {
    console.warn("Tag upsert didn't return all expected tags, re-fetching IDs...");
    const { data: fetchedTags, error: tagFetchError } = await supabaseAdmin
      .from('tags')
      .select('id')
      .in('name', uniqueTagNames);

    if (tagFetchError) {
      console.error('Error fetching tag IDs after upsert:', tagFetchError);
      throw new Error('Failed to retrieve tag IDs');
    }
    if (!fetchedTags || fetchedTags.length === 0) {
      console.error('Could not find any tag IDs for:', uniqueTagNames);
      throw new Error('Failed to find required tag IDs');
    }
    return fetchedTags.map((tag: any) => tag.id);
  }
  return tags.map((tag: any) => tag.id);
}

export async function POST(request: NextRequest) {
  console.log('[Trip Create API] Processing request');
  
  // Log available cookies for debugging
  const cookieHeader = request.headers.get('cookie');
  console.log('[Trip Create API] Cookie header present:', !!cookieHeader);
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    console.log('[Trip Create API] Found cookie count:', cookies.length);
    // Check for auth cookie specifically (don't log actual values for security)
    const hasAuthCookie = cookies.some(c => c.startsWith('sb-') || c.includes('-auth-token'));
    console.log('[Trip Create API] Has auth cookie:', hasAuthCookie);
  }
  
  const supabase = await getRouteHandlerClient(request);
  console.log('[Trip Create API] Created route handler client');
  
  // Admin client using service role key (ensure env vars are set)
  // Check if the environment variables are present
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[Trip Create API] Supabase URL or Service Role Key missing from environment variables.');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }
  
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  console.log('[Trip Create API] Created admin client');

  try {
    console.log('[Trip Create API] Checking authentication');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('[Trip Create API] Auth error:', authError.message);
      return NextResponse.json({ error: 'Authentication error: ' + authError.message }, { status: 401 });
    }
    
    if (!user) {
      console.error('[Trip Create API] No user found in session');
      return NextResponse.json({ error: 'Unauthorized - No user found' }, { status: 401 });
    }
    
    console.log('[Trip Create API] Authenticated as user:', user.id);

    // Expect destination_id in the request body now
    const {
      title,
      description,
      start_date,
      end_date,
      destination_id,
      tags: tagsString,
      cover_image_url,
    } = await request.json();

    if (!title || !start_date || !end_date) {
      // destination_id is optional for now
      return NextResponse.json(
        { error: 'Missing required fields (title, start_date, end_date)' },
        { status: 400 }
      );
    }

    // Parse dates and calculate duration
    const startDate = parseISO(start_date);
    const endDate = parseISO(end_date);
    // Duration includes the start day, so add 1
    const durationDays = differenceInCalendarDays(endDate, startDate) + 1;

    if (isNaN(durationDays) || durationDays <= 0) {
      return NextResponse.json({ error: 'Invalid date range provided.' }, { status: 400 });
    }

    let coverImageUrl = cover_image_url || null;

    // --- Fetch Destination Image if destination_id is provided and no cover_image_url ---
    if (destination_id && !coverImageUrl) {
      console.log(chalk.dim(`Fetching image for destination ID: ${destination_id}`));
      try {
        const { data: destinationData, error: destError } = await supabaseAdmin
          .from('destinations')
          .select('image_url')
          .eq('id', destination_id)
          .maybeSingle(); // Use maybeSingle as destination might not exist or have image

        if (destError) {
          console.error(
            `Error fetching destination image for ID ${destination_id}:`,
            destError.message
          );
          // Don't fail the trip creation, just proceed without cover image
        } else if (destinationData && destinationData.image_url) {
          coverImageUrl = destinationData.image_url;
          console.log(chalk.dim(`Using destination image as cover: ${coverImageUrl}`));
        } else {
          console.log(chalk.dim(`Destination ${destination_id} not found or has no image_url.`));
        }
      } catch (fetchErr) {
        console.error(
          `Unexpected error fetching destination image for ID ${destination_id}:`,
          fetchErr
        );
      }
    }
    // --- End Fetch Destination Image ---

    // --- 1. Insert Trip ---
    // Use string literals for fields to avoid type errors
    const tripData = {
      name: title,
      description: description,
      start_date: new Date(start_date).toISOString(),
      end_date: new Date(end_date).toISOString(),
      created_by: user.id,
      destination_id: destination_id || null,
      cover_image_url: coverImageUrl,
    };

    const { data: newTrip, error: tripInsertError } = await supabase
      .from('trips')
      .insert([tripData] as any)
      .select()
      .single();

    if (tripInsertError) {
      console.error('Error inserting trip:', tripInsertError);
      return NextResponse.json(
        { error: 'Failed to create trip', details: tripInsertError.message },
        { status: 500 }
      );
    }

    const newTripId = (newTrip as any).id;

    // --- 2. Add Owner as Admin Member ---
    const { error: memberInsertError } = await supabaseAdmin.from('trip_members').insert({
      trip_id: newTripId,
      user_id: user.id,
      role: TRIP_ROLES.ADMIN,
      joined_at: new Date().toISOString(),
    });

    if (memberInsertError) {
      console.error(
        `Failed to add creator as admin member for trip ${newTripId}:`,
        memberInsertError
      );
    }

    // --- 3. Create Itinerary Sections ---
    console.log(
      chalk.dim(`Creating ${durationDays} itinerary sections (1-based) for trip ${newTripId}...`)
    );
    const sectionsToInsert = [];
    // Loop from 1 to durationDays (inclusive) for 1-based indexing
    for (let i = 1; i <= durationDays; i++) {
      sectionsToInsert.push({
        trip_id: newTripId,
        day_number: i, // Use 1-based index
        position: i, // Use 1-based index for default position
        // Add date for the section if needed (optional)
        // date: addDays(startDate, i - 1).toISOString(), // Adjust date calculation if needed
      });
    }

    if (sectionsToInsert.length > 0) {
      const { error: sectionInsertError } = await supabaseAdmin
        .from('itinerary_sections')
        .insert(sectionsToInsert);

      if (sectionInsertError) {
        console.error(
          `Failed to insert itinerary sections for trip ${newTripId}:`,
          sectionInsertError
        );
        // Consider if this should be a fatal error for trip creation?
        // For now, log the error but let the trip creation succeed.
      }
    } else {
      console.warn(
        `No sections to insert calculated for trip ${newTripId} with duration ${durationDays}.`
      );
    }

    // --- 4. Process and Link Tags ---
    let tagIds: string[] = [];
    if (tagsString && typeof tagsString === 'string' && tagsString.trim() !== '') {
      const tagNames = tagsString
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      if (tagNames.length > 0) {
        try {
          // Use admin client for tag processing
          tagIds = await processTags(supabaseAdmin, tagNames);
        } catch (tagError: any) {
          console.error(`Error processing tags for trip ${newTripId}:`, tagError);
          // Log error but proceed
        }
      }
    }

    if (tagIds.length > 0) {
      const tripTagAssociations = tagIds.map((tagId) => ({
        trip_id: newTripId,
        tag_id: tagId,
      }));

      // Use admin client to insert into join table
      const { error: tripTagInsertError } = await supabaseAdmin
        .from('trip_tags')
        .insert(tripTagAssociations);

      if (tripTagInsertError) {
        console.error(`Error linking tags to trip ${newTripId}:`, tripTagInsertError);
        // Non-fatal error, continue with trip creation
      }
    }

    // Return success response with the trip ID
    return NextResponse.json({
      success: true,
      message: 'Trip created successfully',
      trip: {
        id: newTripId,
        title,
        // Only include non-sensitive data
      },
    });
  } catch (error: any) {
    console.error('Error in trip creation:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
