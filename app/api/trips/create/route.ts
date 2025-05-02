import { getRouteHandlerClient } from '@/utils/supabase/unified';
import { API_ROUTES, PAGE_ROUTES } from '@/utils/constants/routes';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { Trip } from '@/types/database.types';
import chalk from 'chalk';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { randomBytes } from 'crypto';
import { ITINERARY_CATEGORIES } from '@/utils/constants/status';
import { cookies } from 'next/headers';
import { ITEM_STATUSES } from '@/utils/constants/status';

// Constants for logging prefixes
const LOG_PREFIX = '[Trip Create API]';

// Use string literals for database tables and fields to avoid import issues
const TABLES = {
  TRIPS: 'trips',
  TRIP_MEMBERS: 'trip_members',
  TAGS: 'tags',
  TRIP_TAGS: 'trip_tags',
  DESTINATIONS: 'destinations',
  ITINERARY_SECTIONS: 'itinerary_sections',
  ITINERARY_ITEMS: 'itinerary_items',
} as const;

const FIELDS = {
  COMMON: {
    ID: 'id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
  TRIPS: {
    NAME: 'name',
    DESCRIPTION: 'description',
    START_DATE: 'start_date',
    END_DATE: 'end_date',
    CREATED_BY: 'created_by',
    DESTINATION_ID: 'destination_id',
    COVER_IMAGE_URL: 'cover_image_url',
    ID: 'id',
  },
  TRIP_MEMBERS: {
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
    ROLE: 'role',
    JOINED_AT: 'joined_at',
  },
  TAGS: {
    ID: 'id',
    NAME: 'name',
  },
  TRIP_TAGS: {
    TRIP_ID: 'trip_id',
    TAG_ID: 'tag_id',
  },
  DESTINATIONS: {
    ID: 'id',
    IMAGE_URL: 'image_url',
  },
  ITINERARY_SECTIONS: {
    TRIP_ID: 'trip_id',
    DAY_NUMBER: 'day_number',
    POSITION: 'position',
    DATE: 'date',
  },
  ITINERARY_ITEMS: {
    TRIP_ID: 'trip_id',
    TITLE: 'title',
    DAY_NUMBER: 'day_number',
    POSITION: 'position',
    CATEGORY: 'category',
    DESCRIPTION: 'description',
    STATUS: 'status',
  },
} as const;

const TRIP_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  CONTRIBUTOR: 'contributor',
} as const;

// Helper function to generate a slug from a string
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric characters except hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
};

// Helper function to process tags: find existing or create new ones
async function processTags(supabaseAdmin: any, tagNames: string[]): Promise<string[]> {
  const logPrefix = `${LOG_PREFIX} [Tags Helper]`;
  if (!tagNames || tagNames.length === 0) {
    console.log(chalk.dim(`${logPrefix} No tag names provided.`));
    return [];
  }

  const uniqueTagNames = [...new Set(tagNames)].filter((name) => name.trim() !== '');
  if (uniqueTagNames.length === 0) {
    console.log(chalk.dim(`${logPrefix} No unique, non-empty tag names.`));
    return [];
  }
  console.log(chalk.dim(`${logPrefix} Processing unique tags: ${uniqueTagNames.join(', ')}`));

  // Generate slugs along with names
  const tagsToUpsert = uniqueTagNames.map((name) => ({
    name: name.trim(), // Keep original casing for name?
    slug: generateSlug(name), // Generate slug
  }));
  console.log(chalk.dim(`${logPrefix} Upserting tags data: ${JSON.stringify(tagsToUpsert)}`));

  const { data: tags, error: tagUpsertError } = await supabaseAdmin
    .from(TABLES.TAGS)
    .upsert(tagsToUpsert, { onConflict: 'slug' }) // Use slug for conflict resolution
    .select('id');

  if (tagUpsertError) {
    console.error(chalk.red(`${logPrefix} Error upserting tags:`), tagUpsertError);
    throw new Error('Failed to process tags');
  }

  if (!tags || tags.length !== uniqueTagNames.length) {
    console.warn(
      chalk.yellow(`${logPrefix} Tag upsert didn't return all expected tags, re-fetching IDs...`)
    );
    // Fetch based on the generated slugs
    const slugsToFetch = tagsToUpsert.map((t) => t.slug);
    const { data: fetchedTags, error: tagFetchError } = await supabaseAdmin
      .from(TABLES.TAGS)
      .select('id')
      .in('slug', slugsToFetch); // Fetch by slug

    if (tagFetchError) {
      console.error(chalk.red(`${logPrefix} Error fetching tag IDs after upsert:`), tagFetchError);
      throw new Error('Failed to retrieve tag IDs');
    }
    if (!fetchedTags || fetchedTags.length === 0) {
      console.error(
        chalk.red(`${logPrefix} Could not find any tag IDs for slugs: ${slugsToFetch.join(', ')}`)
      );
      throw new Error('Failed to find required tag IDs');
    }
    const fetchedIds = fetchedTags.map((tag: any) => tag.id);
    console.log(chalk.dim(`${logPrefix} Successfully fetched tag IDs: ${fetchedIds.join(', ')}`));
    return fetchedIds;
  }

  const upsertedIds = tags.map((tag: any) => tag.id);
  console.log(
    chalk.dim(`${logPrefix} Successfully upserted/retrieved tag IDs: ${upsertedIds.join(', ')}`)
  );
  return upsertedIds;
}

export async function POST(request: NextRequest) {
  console.log(chalk.blue(`${LOG_PREFIX} Processing request...`));

  // Log available cookies for debugging
  const cookieHeader = request.headers.get('cookie');
  console.log(chalk.dim(`${LOG_PREFIX} Cookie header present: ${!!cookieHeader}`));
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    console.log(chalk.dim(`${LOG_PREFIX} Found cookie count: ${cookies.length}`));
    // Check for auth cookie specifically (don't log actual values for security)
    const hasAuthCookie = cookies.some((c) => c.startsWith('sb-') || c.includes('-auth-token'));
    console.log(chalk.dim(`${LOG_PREFIX} Has auth cookie: ${hasAuthCookie}`));
  }

  const supabase = await getRouteHandlerClient(request);
  console.log(chalk.dim(`${LOG_PREFIX} Created route handler client`));

  // Admin client using service role key (ensure env vars are set)
  // Check if the environment variables are present
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      chalk.red(
        `${LOG_PREFIX} Supabase URL or Service Role Key missing from environment variables.`
      )
    );
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  console.log(chalk.dim(`${LOG_PREFIX} Created admin client`));

  let user: any = null; // Declare user outside the try block

  try {
    console.log(chalk.dim(`${LOG_PREFIX} Checking authentication`));
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error(chalk.yellow(`${LOG_PREFIX} Auth error:`), authError.message);
      return NextResponse.json(
        { error: 'Authentication error: ' + authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      console.error(chalk.yellow(`${LOG_PREFIX} No user found in session`));
      return NextResponse.json({ error: 'Unauthorized - No user found' }, { status: 401 });
    }

    console.log(chalk.green(`${LOG_PREFIX} Authenticated as user: ${user.id}`));

    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
      console.log(chalk.dim(`${LOG_PREFIX} Request body parsed: ${JSON.stringify(requestBody)}`));
    } catch (parseError) {
      console.error(chalk.red(`${LOG_PREFIX} Error parsing request body:`), parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // --- Handle Quick Create Defaults --- START
    let isQuickCreate = !requestBody.start_date; // Infer quick create if start_date is missing

    // Assign potentially modified variables
    let {
      title,
      description = '',
      start_date,
      end_date,
      destination_id = null, // Default to null initially
      tags = [],
      cover_image_url = null,
    } = requestBody;

    if (isQuickCreate) {
      console.log(chalk.cyan(`${LOG_PREFIX} Handling as Quick Create...`));
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      start_date = today.toISOString().split('T')[0]; // Set default start date
      end_date = tomorrow.toISOString().split('T')[0]; // Set default end date
      // destination_id remains null unless explicitly provided (or set default if DB requires)
      console.log(
        chalk.dim(`${LOG_PREFIX} [Quick Create] Default dates set: ${start_date} to ${end_date}`)
      );
      // Ensure destination_id is explicitly null if empty string was passed
      if (destination_id === '') destination_id = null;
    } else {
      // Ensure destination_id is explicitly null if empty string was passed for regular create too
      if (destination_id === '') destination_id = null;
    }
    // --- Handle Quick Create Defaults --- END

    // Validate required fields AFTER potentially setting defaults
    // Only title is strictly required for quick create, dates/dest are defaulted.
    if (!title) {
      console.error(chalk.yellow(`${LOG_PREFIX} Missing required field: title`));
      return NextResponse.json({ error: 'Missing required field: title' }, { status: 400 });
    }
    // For non-quick create, we still need dates and destination
    if (!isQuickCreate && (!start_date || !end_date || !destination_id)) {
      console.error(
        chalk.yellow(
          `${LOG_PREFIX} Missing required fields for full create. Provided: start_date=${!!start_date}, end_date=${!!end_date}, destination_id=${!!destination_id}`
        )
      );
      return NextResponse.json(
        {
          error:
            'Missing required fields for full trip creation (destination_id, start_date, end_date)',
        },
        { status: 400 }
      );
    }

    // Parse dates and calculate duration (should now always have valid dates)
    const startDate = parseISO(start_date);
    const endDate = parseISO(end_date);
    // Duration includes the start day, so add 1
    const durationDays = differenceInCalendarDays(endDate, startDate) + 1;

    if (isNaN(durationDays) || durationDays <= 0) {
      console.error(
        chalk.red(
          `${LOG_PREFIX} Invalid date range after defaulting? Dates: ${start_date}, ${end_date}`
        )
      );
      return NextResponse.json({ error: 'Invalid date range after defaulting' }, { status: 400 });
    }

    // Process tags
    const tagIds = await processTags(supabaseAdmin, tags);

    // --- Handle Trip Creation --- START
    const tripData = {
      name: title,
      description,
      start_date,
      end_date,
      destination_id,
      cover_image_url,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: trip, error: tripCreationError } = await supabaseAdmin
      .from(TABLES.TRIPS)
      .insert(tripData)
      .select('*');

    if (tripCreationError) {
      console.error(chalk.red(`${LOG_PREFIX} Error creating trip:`), tripCreationError);
      return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
    }

    if (!trip || trip.length === 0) {
      console.error(chalk.red(`${LOG_PREFIX} No trip data returned from creation`));
      return NextResponse.json({ error: 'No trip data returned from creation' }, { status: 500 });
    }

    const tripId = trip[0].id;
    console.log(chalk.green(`${LOG_PREFIX} Created trip with ID: ${tripId}`));

    // --- Handle Trip Members --- START
    const memberData = {
      trip_id: tripId,
      user_id: user.id,
      role: TRIP_ROLES.ADMIN,
      joined_at: new Date().toISOString(),
    };

    const { data: member, error: memberCreationError } = await supabaseAdmin
      .from(TABLES.TRIP_MEMBERS)
      .insert(memberData)
      .select('*');

    if (memberCreationError) {
      console.error(chalk.red(`${LOG_PREFIX} Error creating trip member:`), memberCreationError);
      return NextResponse.json({ error: 'Failed to create trip member' }, { status: 500 });
    }

    if (!member || member.length === 0) {
      console.error(chalk.red(`${LOG_PREFIX} No trip member data returned from creation`));
      return NextResponse.json(
        { error: 'No trip member data returned from creation' },
        { status: 500 }
      );
    }

    const memberId = member[0].id;
    console.log(chalk.green(`${LOG_PREFIX} Created trip member with ID: ${memberId}`));

    // --- Handle Trip Tags --- START
    const tagData = tagIds.map((tagId: string) => ({
      trip_id: tripId,
      tag_id: tagId,
    }));

    const { data: tripTags, error: tripTagCreationError } = await supabaseAdmin
      .from(TABLES.TRIP_TAGS)
      .insert(tagData)
      .select('*');

    if (tripTagCreationError) {
      console.error(chalk.red(`${LOG_PREFIX} Error creating trip tags:`), tripTagCreationError);
      return NextResponse.json({ error: 'Failed to create trip tags' }, { status: 500 });
    }

    if (!tripTags || tripTags.length === 0) {
      console.error(chalk.red(`${LOG_PREFIX} No trip tags returned from creation`));
      return NextResponse.json({ error: 'No trip tags returned from creation' }, { status: 500 });
    }

    const createdTagIds = tripTags.map((tag: any) => tag.tag_id);
    console.log(
      chalk.green(`${LOG_PREFIX} Created trip tags with IDs: ${createdTagIds.join(', ')}`)
    );

    // --- Handle Trip Itinerary --- START
    const itineraryData = {
      trip_id: tripId,
      day_number: 1,
      position: 1,
      date: start_date,
      title: title,
      category: ITINERARY_CATEGORIES.ICONIC_LANDMARKS,
      description: description,
      status: ITEM_STATUSES.PENDING,
    };

    const { data: itinerary, error: itineraryCreationError } = await supabaseAdmin
      .from(TABLES.ITINERARY_ITEMS)
      .insert(itineraryData)
      .select('*');

    if (itineraryCreationError) {
      console.error(
        chalk.red(`${LOG_PREFIX} Error creating itinerary item:`),
        itineraryCreationError
      );
      return NextResponse.json({ error: 'Failed to create itinerary item' }, { status: 500 });
    }

    if (!itinerary || itinerary.length === 0) {
      console.error(chalk.red(`${LOG_PREFIX} No itinerary item returned from creation`));
      return NextResponse.json(
        { error: 'No itinerary item returned from creation' },
        { status: 500 }
      );
    }

    const itineraryId = itinerary[0].id;
    console.log(chalk.green(`${LOG_PREFIX} Created itinerary item with ID: ${itineraryId}`));

    // --- Handle Trip Itinerary Sections --- START
    const sectionData = {
      trip_id: tripId,
      day_number: 1,
      position: 1,
      date: start_date,
    };

    const { data: section, error: sectionCreationError } = await supabaseAdmin
      .from(TABLES.ITINERARY_SECTIONS)
      .insert(sectionData)
      .select('*');

    if (sectionCreationError) {
      console.error(
        chalk.red(`${LOG_PREFIX} Error creating itinerary section:`),
        sectionCreationError
      );
      return NextResponse.json({ error: 'Failed to create itinerary section' }, { status: 500 });
    }

    if (!section || section.length === 0) {
      console.error(chalk.red(`${LOG_PREFIX} No itinerary section returned from creation`));
      return NextResponse.json(
        { error: 'No itinerary section returned from creation' },
        { status: 500 }
      );
    }

    const sectionId = section[0].id;
    console.log(chalk.green(`${LOG_PREFIX} Created itinerary section with ID: ${sectionId}`));

    // --- Handle Trip Destination --- START
    const destinationData = {
      trip_id: tripId,
      image_url: cover_image_url,
    };

    const { data: destination, error: destinationCreationError } = await supabaseAdmin
      .from(TABLES.DESTINATIONS)
      .insert(destinationData)
      .select('*');

    if (destinationCreationError) {
      console.error(
        chalk.red(`${LOG_PREFIX} Error creating destination:`),
        destinationCreationError
      );
      return NextResponse.json({ error: 'Failed to create destination' }, { status: 500 });
    }

    if (!destination || destination.length === 0) {
      console.error(chalk.red(`${LOG_PREFIX} No destination returned from creation`));
      return NextResponse.json({ error: 'No destination returned from creation' }, { status: 500 });
    }

    const destinationId = destination[0].id;
    console.log(chalk.green(`${LOG_PREFIX} Created destination with ID: ${destinationId}`));

    // --- Handle Trip Itinerary --- END
    const itineraryResponse = {
      trip_id: tripId,
      itinerary_item_id: itineraryId,
      itinerary_section_id: sectionId,
      destination_id: destinationId,
    };

    // --- Handle Trip --- END
    const tripResponse = {
      trip_id: tripId,
      member_id: memberId,
      trip_tags: createdTagIds,
      itinerary: itineraryResponse,
    };

    return NextResponse.json(tripResponse, { status: 200 });
  } catch (error) {
    console.error(chalk.red(`${LOG_PREFIX} Error processing request:`), error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
