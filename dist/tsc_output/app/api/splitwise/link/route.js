import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { DB_TABLES, DB_FIELDS, TRIP_ROLES } from "@/utils/constants";
// DELETE /api/splitwise/link?tripId=<trip_id>
// Unlinks a trip from its Splitwise group
export async function DELETE(request) {
    try {
        const url = new URL(request.url);
        const tripId = url.searchParams.get("tripId");
        if (!tripId) {
            return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
        }
        // Get the authenticated user
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        // Verify the user has admin/editor access to the trip
        const { data: tripMembership, error: tripError } = await supabase
            .from(DB_TABLES.TRIP_MEMBERS)
            .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
            .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
            .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, user.id)
            .single();
        if (tripError) {
            console.error(`Error fetching membership for trip ${tripId}, user ${user.id}:`, tripError);
            return NextResponse.json({ error: "Failed to verify trip membership" }, { status: 500 });
        }
        if (!tripMembership) {
            return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 });
        }
        if (![TRIP_ROLES.ADMIN, TRIP_ROLES.EDITOR].includes(tripMembership.role)) {
            return NextResponse.json({ error: "You don't have permission to modify Splitwise settings for this trip" }, { status: 403 });
        }
        // Update the trip to remove the Splitwise group ID
        const { error: updateError } = await supabase
            .from(DB_TABLES.TRIPS)
            .update({
            [DB_FIELDS.TRIPS.SPLITWISE_GROUP_ID]: null,
            [DB_FIELDS.TRIPS.UPDATED_AT]: new Date().toISOString()
        })
            .eq(DB_FIELDS.TRIPS.ID, tripId);
        if (updateError) {
            console.error(`Error unlinking Splitwise for trip ${tripId}:`, updateError);
            return NextResponse.json({ error: "Failed to update trip in database" }, { status: 500 });
        }
        return NextResponse.json({ success: true, message: "Trip unlinked from Splitwise successfully" });
    }
    catch (error) {
        console.error("Error in DELETE /api/splitwise/link:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}
