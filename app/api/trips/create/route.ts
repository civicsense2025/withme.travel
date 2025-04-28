import { createApiClient as createServerClient } from "@/utils/supabase/server";
// Import the base Supabase client creator
import { createClient } from '@supabase/supabase-js'; 
import { NextResponse } from "next/server";
import { API_ROUTES, PAGE_ROUTES } from "@/utils/constants";
import { DB_TABLES, DB_FIELDS, DB_ENUMS } from "@/utils/constants/database";
import { Trip } from "@/types/database.types";
import chalk from "chalk";
import { differenceInCalendarDays, parseISO } from 'date-fns'; // Import date-fns functions

// Helper function to process tags: find existing or create new ones
async function processTags(supabaseAdmin: any, tagNames: string[]): Promise<string[]> {
  if (!tagNames || tagNames.length === 0) {
    return [];
  }

  const uniqueTagNames = [...new Set(tagNames)].filter(name => name.trim() !== '');
  if (uniqueTagNames.length === 0) {
    return [];
  }

  // Use constants for field names
  const tagsToUpsert = uniqueTagNames.map(name => ({ [DB_FIELDS.TAGS.NAME]: name.trim().toLowerCase() })); 

  const { data: tags, error: tagUpsertError } = await supabaseAdmin
    .from(DB_TABLES.TAGS)
    .upsert(tagsToUpsert, { onConflict: DB_FIELDS.TAGS.NAME })
    .select(DB_FIELDS.TAGS.ID);

  if (tagUpsertError) {
    console.error("Error upserting tags:", tagUpsertError);
    throw new Error("Failed to process tags");
  }

  if (!tags || tags.length !== uniqueTagNames.length) {
     console.warn("Tag upsert didn't return all expected tags, re-fetching IDs...");
     const { data: fetchedTags, error: tagFetchError } = await supabaseAdmin
         .from(DB_TABLES.TAGS)
         .select(DB_FIELDS.TAGS.ID)
         .in(DB_FIELDS.TAGS.NAME, uniqueTagNames);
         
     if (tagFetchError) {
         console.error("Error fetching tag IDs after upsert:", tagFetchError);
         throw new Error("Failed to retrieve tag IDs");
     }
     if (!fetchedTags || fetchedTags.length === 0) {
         console.error("Could not find any tag IDs for:", uniqueTagNames);
         throw new Error("Failed to find required tag IDs");
     }
     // Use constant for ID field
     return fetchedTags.map((tag: any) => tag[DB_FIELDS.TAGS.ID]);
  } 
  // Use constant for ID field
  return tags.map((tag: any) => tag[DB_FIELDS.TAGS.ID]);
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  // Admin client using service role key (ensure env vars are set)
  // Check if the environment variables are present
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Supabase URL or Service Role Key missing from environment variables.");
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Expect destination_id in the request body now
    const { title, description, start_date, end_date, destination_id, tags: tagsString } = await request.json(); 

    if (!title || !start_date || !end_date) { // destination_id is optional for now
      return NextResponse.json({ error: "Missing required fields (title, start_date, end_date)" }, { status: 400 });
    }

    // Parse dates and calculate duration
    const startDate = parseISO(start_date);
    const endDate = parseISO(end_date);
    // Duration includes the start day, so add 1
    const durationDays = differenceInCalendarDays(endDate, startDate) + 1;

    if (isNaN(durationDays) || durationDays <= 0) {
       return NextResponse.json({ error: "Invalid date range provided." }, { status: 400 });
    }

    let coverImageUrl: string | null = null;

    // --- Fetch Destination Image if destination_id is provided ---
    if (destination_id) {
      console.log(chalk.dim(`Fetching image for destination ID: ${destination_id}`));
      try {
        const { data: destinationData, error: destError } = await supabaseAdmin
          .from(DB_TABLES.DESTINATIONS)
          .select(DB_FIELDS.DESTINATIONS.IMAGE_URL)
          .eq(DB_FIELDS.DESTINATIONS.ID, destination_id)
          .maybeSingle(); // Use maybeSingle as destination might not exist or have image

        if (destError) {
          console.error(`Error fetching destination image for ID ${destination_id}:`, destError.message);
          // Don't fail the trip creation, just proceed without cover image
        } else if (destinationData && destinationData[DB_FIELDS.DESTINATIONS.IMAGE_URL]) {
          coverImageUrl = destinationData[DB_FIELDS.DESTINATIONS.IMAGE_URL];
          console.log(chalk.dim(`Using destination image as cover: ${coverImageUrl}`));
        } else {
          console.log(chalk.dim(`Destination ${destination_id} not found or has no image_url.`));
        }
      } catch (fetchErr) {
         console.error(`Unexpected error fetching destination image for ID ${destination_id}:`, fetchErr);
      }
    }
    // --- End Fetch Destination Image ---

    // --- 1. Insert Trip --- 
    const tripDataToInsert: Partial<Trip> = {
      [DB_FIELDS.TRIPS.NAME]: title,
      [DB_FIELDS.TRIPS.DESCRIPTION]: description,
      [DB_FIELDS.TRIPS.START_DATE]: new Date(start_date).toISOString(),
      [DB_FIELDS.TRIPS.END_DATE]: new Date(end_date).toISOString(),
      [DB_FIELDS.TRIPS.CREATED_BY]: user.id,
      [DB_FIELDS.TRIPS.DESTINATION_ID]: destination_id || null, // Include destination_id
      [DB_FIELDS.TRIPS.COVER_IMAGE_URL]: coverImageUrl, // Include fetched cover image URL
    };

    const { data: newTrip, error: tripInsertError } = await supabase
        .from(DB_TABLES.TRIPS)
        .insert([tripDataToInsert]) // Use the prepared object
        .select()
        .single();

    if (tripInsertError) {
      console.error("Error inserting trip:", tripInsertError);
      return NextResponse.json({ error: "Failed to create trip", details: tripInsertError.message }, { status: 500 });
    }
    
    const newTripId = newTrip[DB_FIELDS.TRIPS.ID];
    
    // --- 2. Add Owner as Admin Member --- 
    const { error: memberInsertError } = await supabaseAdmin
      .from(DB_TABLES.TRIP_MEMBERS)
      .insert({
          [DB_FIELDS.TRIP_MEMBERS.TRIP_ID]: newTripId,
          [DB_FIELDS.TRIP_MEMBERS.USER_ID]: user.id,
          [DB_FIELDS.TRIP_MEMBERS.ROLE]: DB_ENUMS.TRIP_ROLES.ADMIN,
          [DB_FIELDS.TRIP_MEMBERS.JOINED_AT]: new Date().toISOString()
      });
      
    if (memberInsertError) {
        console.error(`Failed to add creator as admin member for trip ${newTripId}:`, memberInsertError);
    }

    // --- 3. Create Itinerary Sections --- 
    console.log(chalk.dim(`Creating ${durationDays} itinerary sections (1-based) for trip ${newTripId}...`));
    const sectionsToInsert = [];
    // Loop from 1 to durationDays (inclusive) for 1-based indexing
    for (let i = 1; i <= durationDays; i++) { 
      sectionsToInsert.push({
        [DB_FIELDS.ITINERARY_SECTIONS.TRIP_ID]: newTripId,
        [DB_FIELDS.ITINERARY_SECTIONS.DAY_NUMBER]: i, // Use 1-based index
        [DB_FIELDS.ITINERARY_SECTIONS.POSITION]: i, // Use 1-based index for default position
        // Add date for the section if needed (optional)
        // [DB_FIELDS.ITINERARY_SECTIONS.DATE]: addDays(startDate, i - 1).toISOString(), // Adjust date calculation if needed
      });
    }

    if (sectionsToInsert.length > 0) {
      const { error: sectionInsertError } = await supabaseAdmin
        .from(DB_TABLES.ITINERARY_SECTIONS)
        .insert(sectionsToInsert);

      if (sectionInsertError) {
        console.error(`Failed to insert itinerary sections for trip ${newTripId}:`, sectionInsertError);
        // Consider if this should be a fatal error for trip creation?
        // For now, log the error but let the trip creation succeed.
      }
    } else {
        console.warn(`No sections to insert calculated for trip ${newTripId} with duration ${durationDays}.`) 
    }

    // --- 4. Process and Link Tags --- 
    let tagIds: string[] = [];
    if (tagsString && typeof tagsString === 'string' && tagsString.trim() !== '') {
        const tagNames = tagsString.split(",").map(tag => tag.trim()).filter(Boolean);
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
        const tripTagAssociations = tagIds.map(tagId => ({
            [DB_FIELDS.TRIP_TAGS.TRIP_ID]: newTripId,
            [DB_FIELDS.TRIP_TAGS.TAG_ID]: tagId
        }));
        
        // Use admin client to insert into join table
        const { error: tripTagInsertError } = await supabaseAdmin
            .from(DB_TABLES.TRIP_TAGS)
            .insert(tripTagAssociations);
            
        if (tripTagInsertError) {
            console.error(`Failed to insert associations into trip_tags for trip ${newTripId}:`, tripTagInsertError);
            // Log error, but trip is created.
        }
    }

    return NextResponse.json({ trip: newTrip }, { status: 201 });

  } catch (error: any) {
    console.error("Error in POST /api/trips/create:", error);
    return NextResponse.json({ error: "An unexpected error occurred", details: error.message }, { status: 500 });
  }
} 