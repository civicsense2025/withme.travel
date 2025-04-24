import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { TRIP_ROLES, DB_TABLES, DB_FIELDS, VOTE_TYPES } from "@/utils/constants";
// Helper function to check user membership and role
async function checkTripAccess(supabase, tripId, userId, allowedRoles = [
    TRIP_ROLES.ADMIN,
    TRIP_ROLES.EDITOR,
    TRIP_ROLES.VIEWER,
    TRIP_ROLES.CONTRIBUTOR,
]) {
    const { data: member, error } = await supabase
        .from(DB_TABLES.TRIP_MEMBERS)
        .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
        .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
        .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, userId)
        .maybeSingle();
    if (error) {
        console.error("Error checking trip membership:", error);
        return { allowed: false, error: error.message, status: 500 };
    }
    if (!member) {
        // Allow access if the trip itself is public
        const { data: tripData, error: tripError } = await supabase
            .from(DB_TABLES.TRIPS)
            .select(DB_FIELDS.TRIPS.IS_PUBLIC)
            .eq(DB_FIELDS.TRIPS.ID, tripId)
            .single();
        if (tripError) {
            console.error("Error fetching trip details:", tripError);
            // Fallback to deny access if trip fetch fails
            return { allowed: false, error: "Could not verify trip access.", status: 500 };
        }
        if (tripData === null || tripData === void 0 ? void 0 : tripData.is_public) {
            // Allow read-only access for public trips
            // Check if the requested roles are only for viewing
            const isReadOnlyRequest = allowedRoles.length === 1 && allowedRoles[0] === TRIP_ROLES.VIEWER;
            if (isReadOnlyRequest) {
                return { allowed: true };
            }
        }
        // If not public or request is not read-only, deny access
        return {
            allowed: false,
            error: "Access Denied: You are not a member of this trip.",
            status: 403,
        };
    }
    if (!allowedRoles.includes(member.role)) {
        return {
            allowed: false,
            error: "Access Denied: You do not have sufficient permissions.",
            status: 403,
        };
    }
    return { allowed: true };
}
// GET /api/trips/[tripId]/itinerary - Fetch itinerary items for a trip
export async function GET(request, props) {
    var _a, _b, _c;
    // Extract tripId properly
    const { tripId } = props.params;
    if (!tripId) {
        return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
    }
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        const isPublicView = !user;
        const userId = user === null || user === void 0 ? void 0 : user.id;
        // Check access rights (viewer for GET)
        const access = await checkTripAccess(supabase, tripId, userId !== null && userId !== void 0 ? userId : '', [
            TRIP_ROLES.VIEWER, // Default allowed role for GET
            TRIP_ROLES.ADMIN,
            TRIP_ROLES.EDITOR,
            TRIP_ROLES.CONTRIBUTOR
        ]);
        if (!access.allowed) {
            // Check if trip is public *before* denying access to logged-out users
            const { data: tripData, error: tripError } = await supabase
                .from(DB_TABLES.TRIPS)
                .select(`${DB_FIELDS.TRIPS.IS_PUBLIC}, ${DB_FIELDS.TRIPS.DURATION_DAYS}`)
                .eq(DB_FIELDS.TRIPS.ID, tripId)
                .maybeSingle();
            if (tripError || !(tripData === null || tripData === void 0 ? void 0 : tripData.is_public)) {
                return NextResponse.json({ error: (_a = access.error) !== null && _a !== void 0 ? _a : 'Access Denied' }, { status: (_b = access.status) !== null && _b !== void 0 ? _b : 403 });
            }
            // If public, allow proceeding for read-only access
        }
        // Fetch trip duration_days
        const { data: tripDetails, error: tripFetchError } = await supabase
            .from(DB_TABLES.TRIPS)
            .select(DB_FIELDS.TRIPS.DURATION_DAYS)
            .eq(DB_FIELDS.TRIPS.ID, tripId)
            .single();
        if (tripFetchError) {
            console.error("Error fetching trip duration:", tripFetchError);
            return NextResponse.json({ error: "Failed to fetch trip details." }, { status: 500 });
        }
        const durationDays = (_c = tripDetails === null || tripDetails === void 0 ? void 0 : tripDetails.duration_days) !== null && _c !== void 0 ? _c : 1; // Default to 1 day if not set
        // Fetch itinerary items with votes and voter profiles
        const { data: items, error: fetchError } = await supabase
            .from(DB_TABLES.ITINERARY_ITEMS)
            .select(`
        *,
        ${DB_TABLES.VOTES} (
          ${DB_FIELDS.VOTES.USER_ID},
          ${DB_FIELDS.VOTES.VOTE_TYPE},
          ${DB_TABLES.PROFILES} (
            ${DB_FIELDS.PROFILES.ID},
            ${DB_FIELDS.PROFILES.NAME},
            ${DB_FIELDS.PROFILES.AVATAR_URL},
            ${DB_FIELDS.PROFILES.USERNAME}
          )
        )
      `)
            .eq(DB_FIELDS.ITINERARY_ITEMS.TRIP_ID, tripId)
            .order(DB_FIELDS.ITINERARY_ITEMS.DAY_NUMBER, { ascending: true, nullsFirst: false }) // nullsLast equivalent
            .order(DB_FIELDS.ITINERARY_ITEMS.POSITION, { ascending: true, nullsFirst: false }); // nullsLast equivalent
        if (fetchError) {
            console.error("Error fetching itinerary items with votes:", fetchError);
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }
        // Process items to structure votes and group by day
        const itemsByDay = {};
        items === null || items === void 0 ? void 0 : items.forEach((item) => {
            var _a, _b, _c, _d, _e, _f, _g;
            const day = (_a = item.day_number) !== null && _a !== void 0 ? _a : 0; // Group items without a day under key 0
            let processedVotes = null;
            if (item.votes && user) { // Only process votes if user is logged in
                const upVotes = ((_b = item.votes) === null || _b === void 0 ? void 0 : _b.filter((v) => v.vote_type === VOTE_TYPES.UP)) || [];
                const downVotes = ((_c = item.votes) === null || _c === void 0 ? void 0 : _c.filter((v) => v.vote_type === VOTE_TYPES.DOWN)) || [];
                const userVote = ((_e = (_d = item.votes) === null || _d === void 0 ? void 0 : _d.find((v) => { var _a; return ((_a = v.profiles) === null || _a === void 0 ? void 0 : _a.id) === userId; })) === null || _e === void 0 ? void 0 : _e.vote_type) || null;
                processedVotes = {
                    up: upVotes.length,
                    down: downVotes.length,
                    upVoters: upVotes.map((v) => v.profiles).filter(Boolean),
                    downVoters: downVotes.map((v) => v.profiles).filter(Boolean),
                    userVote: userVote,
                };
            }
            else if (item.votes) {
                // If user is not logged in, just provide counts
                processedVotes = {
                    up: ((_f = item.votes) === null || _f === void 0 ? void 0 : _f.filter((v) => v.vote_type === VOTE_TYPES.UP).length) || 0,
                    down: ((_g = item.votes) === null || _g === void 0 ? void 0 : _g.filter((v) => v.vote_type === VOTE_TYPES.DOWN).length) || 0,
                    upVoters: [],
                    downVoters: [],
                    userVote: null
                };
            }
            const processedItem = Object.assign(Object.assign({}, item), { votes: processedVotes });
            if (!itemsByDay[day]) {
                itemsByDay[day] = [];
            }
            itemsByDay[day].push(processedItem);
        });
        return NextResponse.json({
            durationDays: durationDays,
            itemsByDay: itemsByDay
        }, { status: 200 });
    }
    catch (error) {
        console.error("Unexpected error fetching itinerary:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
// POST /api/trips/[tripId]/itinerary - Add a new itinerary item
export async function POST(request, props) {
    var _a;
    // Extract tripId properly
    const { tripId } = props.params;
    if (!tripId) {
        return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
    }
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: (authError === null || authError === void 0 ? void 0 : authError.message) || "Authentication required" }, { status: 401 });
        }
        // Check if user has permission to add items (e.g., admin, editor, contributor)
        const access = await checkTripAccess(supabase, tripId, user.id, [
            TRIP_ROLES.ADMIN,
            TRIP_ROLES.EDITOR,
            TRIP_ROLES.CONTRIBUTOR,
        ]);
        if (!access.allowed) {
            return NextResponse.json({ error: access.error }, { status: access.status });
        }
        const newItemData = await request.json();
        // Validate required fields (example: title)
        if (!newItemData.title) {
            return NextResponse.json({ error: "Title is required for itinerary item." }, { status: 400 });
        }
        // Determine initial position (append to the end of the specified day)
        const dayNumber = (_a = newItemData.day_number) !== null && _a !== void 0 ? _a : 1;
        // Use count: 'exact' to get the count directly
        const { count: itemCount, error: countError } = await supabase
            .from(DB_TABLES.ITINERARY_ITEMS)
            .select('', { count: 'exact', head: true }) // Select nothing, just get count
            .eq(DB_FIELDS.ITINERARY_ITEMS.TRIP_ID, tripId)
            .eq(DB_FIELDS.ITINERARY_ITEMS.DAY_NUMBER, dayNumber);
        if (countError) {
            console.error("Error counting existing items for position:", countError);
            // Proceed with position 0 or handle error appropriately
        }
        // Position is 0-indexed, so the count is the next available position
        const initialPosition = countError ? 0 : (itemCount !== null && itemCount !== void 0 ? itemCount : 0);
        // Add server-side context and defaults
        const itemToInsert = Object.assign(Object.assign({}, newItemData), { trip_id: tripId, created_by: user.id, day_number: dayNumber, position: initialPosition, status: newItemData.status || 'suggested' });
        // Insert the new item
        const { data: newItem, error: insertError } = await supabase
            .from(DB_TABLES.ITINERARY_ITEMS)
            .insert(itemToInsert)
            .select()
            .single();
        if (insertError) {
            console.error("Error inserting itinerary item:", insertError);
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }
        // Structure response similar to GET for consistency
        const processedItem = Object.assign(Object.assign({}, newItem), { votes: { up: 0, down: 0, userVote: null, upVoters: [], downVoters: [] } });
        return NextResponse.json({ item: processedItem }, { status: 201 });
    }
    catch (error) {
        console.error("Unexpected error creating itinerary item:", error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
