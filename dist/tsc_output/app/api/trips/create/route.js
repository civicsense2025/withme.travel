import { createClient as createServerClient } from "@/utils/supabase/server";
// Import the base Supabase client creator
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";
import { DB_TABLES, DB_FIELDS, TRIP_ROLES } from "@/utils/constants";
// Helper function to process tags: find existing or create new ones
async function processTags(supabaseAdmin, tagNames) {
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
        return fetchedTags.map((tag) => tag[DB_FIELDS.TAGS.ID]);
    }
    // Use constant for ID field
    return tags.map((tag) => tag[DB_FIELDS.TAGS.ID]);
}
export async function POST(request) {
    const supabase = createServerClient();
    // Admin client using service role key (ensure env vars are set)
    // Check if the environment variables are present
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("Supabase URL or Service Role Key missing from environment variables.");
        return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { title, description, start_date, end_date, tags: tagsString } = await request.json();
        if (!title || !start_date || !end_date) {
            return NextResponse.json({ error: "Missing required fields (title, start_date, end_date)" }, { status: 400 });
        }
        // --- 1. Insert Trip --- 
        // Use the standard client (acting as the user) to insert the trip
        const { data: newTrip, error: tripInsertError } = await supabase
            .from(DB_TABLES.TRIPS)
            .insert([
            {
                [DB_FIELDS.TRIPS.NAME]: title,
                [DB_FIELDS.TRIPS.DESCRIPTION]: description, // Use constant
                [DB_FIELDS.TRIPS.START_DATE]: new Date(start_date).toISOString(),
                [DB_FIELDS.TRIPS.END_DATE]: new Date(end_date).toISOString(),
                [DB_FIELDS.TRIPS.CREATED_BY]: user.id,
            },
        ])
            .select()
            .single();
        if (tripInsertError) {
            console.error("Error inserting trip:", tripInsertError);
            return NextResponse.json({ error: "Failed to create trip", details: tripInsertError.message }, { status: 500 });
        }
        const newTripId = newTrip[DB_FIELDS.TRIPS.ID];
        // --- 2. Add Owner as Admin Member --- 
        // Use admin client to ensure this happens regardless of initial RLS state
        const { error: memberInsertError } = await supabaseAdmin
            .from(DB_TABLES.TRIP_MEMBERS)
            .insert({
            [DB_FIELDS.TRIP_MEMBERS.TRIP_ID]: newTripId,
            [DB_FIELDS.TRIP_MEMBERS.USER_ID]: user.id,
            [DB_FIELDS.TRIP_MEMBERS.ROLE]: TRIP_ROLES.ADMIN,
            [DB_FIELDS.TRIP_MEMBERS.JOINED_AT]: new Date().toISOString()
        });
        if (memberInsertError) {
            console.error(`Failed to add creator as admin member for trip ${newTripId}:`, memberInsertError);
            // Log error but proceed
        }
        // --- 3. Process and Link Tags --- 
        let tagIds = [];
        if (tagsString && typeof tagsString === 'string' && tagsString.trim() !== '') {
            const tagNames = tagsString.split(",").map(tag => tag.trim()).filter(Boolean);
            if (tagNames.length > 0) {
                try {
                    // Use admin client for tag processing
                    tagIds = await processTags(supabaseAdmin, tagNames);
                }
                catch (tagError) {
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
    }
    catch (error) {
        console.error("Error in POST /api/trips/create:", error);
        return NextResponse.json({ error: "An unexpected error occurred", details: error.message }, { status: 500 });
    }
}
