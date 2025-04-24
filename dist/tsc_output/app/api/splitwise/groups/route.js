import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { getGroups, getGroup, linkTripToSplitwiseGroup, SplitwiseError } from "@/lib/services/splitwise";
import { DB_TABLES, DB_FIELDS, TRIP_ROLES } from "@/utils/constants";
// Get Splitwise groups for the current user
export async function GET(request) {
    try {
        // Get the authenticated user
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        // Fetch the user's Splitwise groups
        const groupsData = await getGroups(user.id);
        return NextResponse.json({ groups: groupsData.groups });
    }
    catch (error) {
        console.error("Error fetching Splitwise groups:", error);
        // Handle specific Splitwise errors
        if (error instanceof SplitwiseError) {
            if (error.message === 'Splitwise not connected') {
                // User hasn't connected their account
                return NextResponse.json({ error: error.message }, { status: 401 });
            }
            // Other Splitwise API or token errors
            return NextResponse.json({ error: error.message || "Failed to communicate with Splitwise" }, 
            // Use 502 or 503 to indicate upstream issue
            { status: error.statusCode === 401 ? 401 : 503 });
        }
        // Generic internal server error for other unexpected issues
        return NextResponse.json({ error: error.message || "Failed to fetch Splitwise groups" }, { status: 500 });
    }
}
// Link a trip to a Splitwise group
export async function POST(request) {
    try {
        const { tripId, groupId } = await request.json();
        if (!tripId || !groupId) {
            return NextResponse.json({ error: "Trip ID and group ID are required" }, { status: 400 });
        }
        // Get the authenticated user
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        // Verify the user has access to the trip
        const { data: tripMembership, error: tripError } = await supabase
            .from(DB_TABLES.TRIP_MEMBERS)
            .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
            .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
            .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, user.id)
            .single();
        if (tripError || !tripMembership) {
            return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 });
        }
        // Verify the user can manage this trip (using constants)
        if (![TRIP_ROLES.ADMIN, TRIP_ROLES.EDITOR].includes(tripMembership.role)) {
            return NextResponse.json({ error: "You don't have permission to link Splitwise to this trip" }, { status: 403 });
        }
        // Verify the Splitwise group exists
        try {
            await getGroup(user.id, groupId);
        }
        catch (error) {
            // Handle specific Splitwise errors from getGroup
            if (error instanceof SplitwiseError && error.statusCode === 404) {
                return NextResponse.json({ error: "Splitwise group not found or not accessible" }, { status: 404 });
            }
            else if (error instanceof SplitwiseError && error.message === 'Splitwise not connected') {
                return NextResponse.json({ error: error.message }, { status: 401 });
            }
            console.error("Error verifying Splitwise group:", error);
            return NextResponse.json({ error: "Failed to verify Splitwise group" }, { status: 503 } // Indicate upstream issue
            );
        }
        // Link the trip to the Splitwise group
        const success = await linkTripToSplitwiseGroup(tripId, groupId);
        if (!success) {
            // This likely indicates a DB error, so 500 is appropriate
            return NextResponse.json({ error: "Failed to link trip to Splitwise group in database" }, { status: 500 });
        }
        return NextResponse.json({
            success: true,
            message: "Trip linked to Splitwise group successfully"
        });
    }
    catch (error) {
        console.error("Error linking trip to Splitwise group:", error);
        // Handle specific SplitwiseError if it bubbles up (e.g., from linkTripToSplitwiseGroup if modified)
        if (error instanceof SplitwiseError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 });
        }
        return NextResponse.json({ error: error.message || "Failed to link trip to Splitwise group" }, { status: 500 });
    }
}
