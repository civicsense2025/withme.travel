import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { DB_TABLES, TRIP_ROLES, DB_FIELDS, VOTE_TYPES } from "@/utils/constants";
// Helper function to check user membership and role (can be reused or imported)
async function checkTripAccess(supabase, tripId, userId, allowedRoles = [
    TRIP_ROLES.ADMIN,
    TRIP_ROLES.EDITOR,
    TRIP_ROLES.VIEWER,
    TRIP_ROLES.CONTRIBUTOR
]) {
    const { data: member, error } = await supabase
        .from(DB_TABLES.TRIP_MEMBERS)
        .select("role")
        .eq("trip_id", tripId)
        .eq("user_id", userId)
        .maybeSingle();
    if (error) {
        console.error("Error checking trip membership:", error);
        return { allowed: false, error: error.message, status: 500 };
    }
    if (!member) {
        return {
            allowed: false,
            error: "Access Denied: You are not a member of this trip.",
            status: 403,
        };
    }
    if (!allowedRoles.includes(member.role)) {
        return {
            allowed: false,
            error: "Access Denied: You do not have sufficient permissions for this action.",
            status: 403,
        };
    }
    return { allowed: true };
}
export async function POST(request, { params }) {
    const tripId = params.id;
    const itemId = params.itemId;
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Check if user is a member of the trip (any member can vote)
        const access = await checkTripAccess(supabase, tripId, user.id);
        if (!access.allowed) {
            return NextResponse.json({ error: access.error }, { status: access.status });
        }
        const body = await request.json();
        const voteType = body.vote_type;
        if (!voteType || (voteType !== VOTE_TYPES.UP && voteType !== VOTE_TYPES.DOWN)) {
            return NextResponse.json({ error: "Invalid vote_type provided. Must be 'up' or 'down'." }, { status: 400 });
        }
        // Upsert the vote: Insert or update if exists
        const { error: voteError } = await supabase
            .from(DB_TABLES.VOTES)
            .upsert({
            [DB_FIELDS.VOTES.USER_ID]: user.id,
            [DB_FIELDS.VOTES.ITINERARY_ITEM_ID]: itemId,
            [DB_FIELDS.VOTES.VOTE_TYPE]: voteType,
        }, {
            onConflict: `${DB_FIELDS.VOTES.USER_ID},${DB_FIELDS.VOTES.ITINERARY_ITEM_ID}`,
        });
        if (voteError) {
            console.error("Error recording vote:", voteError);
            return NextResponse.json({ error: "Failed to record vote." }, { status: 500 });
        }
        // Optionally: Fetch updated vote counts for the item and return them
        // For simplicity now, just return success
        return NextResponse.json({ message: "Vote recorded successfully" }, { status: 200 });
    }
    catch (error) {
        console.error("Error processing vote request:", error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
