import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { TRIP_ROLES, DB_TABLES, DB_FIELDS } from "@/utils/constants";
// Re-use or import checkTripAccess function from the main itinerary route
async function checkTripAccess(supabase, tripId, userId, allowedRoles) {
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
// Helper function to check user permissions
async function checkUserPermission(supabase, tripId, userId) {
    // ... (implementation as before)
}
// POST /api/trips/[tripId]/itinerary/reorder - Update day and position for multiple items
export async function POST(request, props) {
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
        // Check if user has permission to edit items (e.g., admin, editor, contributor)
        const access = await checkTripAccess(supabase, tripId, user.id, [
            TRIP_ROLES.ADMIN,
            TRIP_ROLES.EDITOR,
            TRIP_ROLES.CONTRIBUTOR,
        ]);
        if (!access.allowed) {
            return NextResponse.json({ error: access.error }, { status: access.status });
        }
        const itemsToUpdate = await request.json();
        if (!Array.isArray(itemsToUpdate) || itemsToUpdate.length === 0) {
            return NextResponse.json({ error: "Invalid request body: Expected an array of items to reorder." }, { status: 400 });
        }
        // Prepare updates
        // Note: Supabase doesn't directly support bulk updates with different values per row via standard API.
        // We need to perform multiple updates, ideally within a transaction if possible.
        // If Supabase Edge Functions are available, a single function call could handle this transactionally.
        // For now, we'll perform individual updates sequentially.
        const updatePromises = itemsToUpdate.map(item => {
            if (!item.id || typeof item.day_number !== 'number' || typeof item.position !== 'number') {
                console.warn("Skipping invalid item in reorder request:", item);
                return Promise.resolve({ error: `Invalid data for item ${item.id}` }); // Resolve to avoid breaking Promise.all
            }
            return supabase
                .from(DB_TABLES.ITINERARY_ITEMS)
                .update({
                [DB_FIELDS.ITINERARY_ITEMS.DAY_NUMBER]: item.day_number,
                [DB_FIELDS.ITINERARY_ITEMS.POSITION]: item.position,
                [DB_FIELDS.ITINERARY_ITEMS.UPDATED_AT]: new Date().toISOString(),
            })
                .eq(DB_FIELDS.ITINERARY_ITEMS.ID, item.id)
                .eq(DB_FIELDS.ITINERARY_ITEMS.TRIP_ID, tripId); // Ensure update is scoped to the trip
        });
        const results = await Promise.allSettled(updatePromises);
        const errors = results
            .filter(result => { var _a; return result.status === 'rejected' || (result.status === 'fulfilled' && ((_a = result.value) === null || _a === void 0 ? void 0 : _a.error)); })
            .map(result => {
            var _a;
            if (result.status === 'rejected')
                return result.reason;
            if (result.status === 'fulfilled' && ((_a = result.value) === null || _a === void 0 ? void 0 : _a.error))
                return result.value.error;
            return 'Unknown error';
        });
        if (errors.length > 0) {
            console.error("Errors occurred during itinerary reorder:", errors);
            // Return a partial success or failure based on requirements
            // For simplicity, returning a general error if any update failed.
            return NextResponse.json({ error: "Failed to update some itinerary items.", details: errors }, { status: 500 });
        }
        return NextResponse.json({ message: "Itinerary reordered successfully." }, { status: 200 });
    }
    catch (error) {
        console.error("Unexpected error reordering itinerary items:", error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
