import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { TRIP_ROLES, DB_TABLES, DB_FIELDS } from "@/utils/constants"; // Ensure constants are imported
// Helper function to check user membership and role (can be reused or imported)
async function checkTripAccess(supabase, tripId, userId, allowedRoles) {
    const { data: member, error } = await supabase
        .from(DB_TABLES.TRIP_MEMBERS) // Use constant
        .select(DB_FIELDS.TRIP_MEMBERS.ROLE) // Use constant
        .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId) // Use constant
        .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, userId) // Use constant
        .maybeSingle();
    if (error) {
        console.error("Error checking trip membership:", error);
        return { allowed: false, error: error.message, status: 500 };
    }
    if (!member) {
        // Add check for public trips if needed for read-only access
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
// PATCH /api/trips/[tripId]/itinerary/[itemId] - Update an itinerary item
export async function PATCH(request, { params }) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: (authError === null || authError === void 0 ? void 0 : authError.message) || "Authentication required" }, { status: 401 });
        }
        const { tripId } = await params;
        const itemId = params.itemId;
        // Check if user has permission to edit items (Contributors should also be able to edit items)
        const access = await checkTripAccess(supabase, tripId, user.id, [
            TRIP_ROLES.ADMIN,
            TRIP_ROLES.EDITOR,
            TRIP_ROLES.CONTRIBUTOR, // Allow contributors to edit
        ]);
        if (!access.allowed) {
            return NextResponse.json({ error: access.error }, { status: access.status });
        }
        const updates = await request.json();
        // --- Data Validation and Sanitization --- 
        const allowedUpdates = {};
        const allowedFields = [
            DB_FIELDS.ITINERARY_ITEMS.TITLE,
            DB_FIELDS.ITINERARY_ITEMS.DESCRIPTION,
            DB_FIELDS.ITINERARY_ITEMS.LOCATION,
            DB_FIELDS.ITINERARY_ITEMS.ADDRESS,
            DB_FIELDS.ITINERARY_ITEMS.START_TIME,
            DB_FIELDS.ITINERARY_ITEMS.END_TIME,
            DB_FIELDS.ITINERARY_ITEMS.DATE,
            DB_FIELDS.ITINERARY_ITEMS.DAY_NUMBER,
            DB_FIELDS.ITINERARY_ITEMS.POSITION,
            DB_FIELDS.ITINERARY_ITEMS.CATEGORY,
            DB_FIELDS.ITINERARY_ITEMS.STATUS,
            DB_FIELDS.ITINERARY_ITEMS.ESTIMATED_COST,
            DB_FIELDS.ITINERARY_ITEMS.CURRENCY,
            DB_FIELDS.ITINERARY_ITEMS.DURATION_MINUTES,
            DB_FIELDS.ITINERARY_ITEMS.COVER_IMAGE_URL,
            // Add other fields that users are allowed to update
        ];
        for (const field of allowedFields) {
            if (updates.hasOwnProperty(field)) {
                // Add specific type checks if necessary (e.g., ensure cost is number)
                if (field === DB_FIELDS.ITINERARY_ITEMS.ESTIMATED_COST && updates[field] !== null && typeof updates[field] !== 'number') {
                    return NextResponse.json({ error: `Invalid type for ${field}. Expected number.` }, { status: 400 });
                }
                if (field === DB_FIELDS.ITINERARY_ITEMS.DURATION_MINUTES && updates[field] !== null && typeof updates[field] !== 'number') {
                    return NextResponse.json({ error: `Invalid type for ${field}. Expected number.` }, { status: 400 });
                }
                if (field === DB_FIELDS.ITINERARY_ITEMS.DAY_NUMBER && updates[field] !== null && typeof updates[field] !== 'number') {
                    return NextResponse.json({ error: `Invalid type for ${field}. Expected number.` }, { status: 400 });
                }
                allowedUpdates[field] = updates[field];
            }
        }
        // Add updated_at timestamp
        allowedUpdates[DB_FIELDS.ITINERARY_ITEMS.UPDATED_AT] = new Date().toISOString();
        if (Object.keys(allowedUpdates).length <= 1) { // Only contains updated_at
            return NextResponse.json({ error: "No valid fields provided for update." }, { status: 400 });
        }
        // Update the item
        const { data: updatedItem, error: updateError } = await supabase
            .from(DB_TABLES.ITINERARY_ITEMS) // Use constant
            .update(allowedUpdates)
            .eq(DB_FIELDS.ITINERARY_ITEMS.ID, itemId) // Use constant
            .eq(DB_FIELDS.ITINERARY_ITEMS.TRIP_ID, tripId) // Ensure item belongs to the correct trip
            .select() // Select updated data
            .single(); // Expect single row
        if (updateError) {
            console.error("Error updating itinerary item:", updateError);
            if (updateError.code === 'PGRST116') {
                return NextResponse.json({ error: "Itinerary item not found or access denied." }, { status: 404 });
            }
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
        // Return the updated item, potentially re-fetching votes if needed for consistency
        return NextResponse.json({ item: updatedItem }, { status: 200 });
    }
    catch (error) {
        console.error("Unexpected error updating itinerary item:", error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
// DELETE /api/trips/[tripId]/itinerary/[itemId] - Delete an itinerary item
export async function DELETE(request, { params }) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: (authError === null || authError === void 0 ? void 0 : authError.message) || "Authentication required" }, { status: 401 });
        }
        const { tripId } = await params;
        const itemId = params.itemId;
        // Check if user has permission to delete items (Contributors should also be able to delete their own? TBD)
        // For now, restrict to Admin/Editor for simplicity
        const access = await checkTripAccess(supabase, tripId, user.id, [
            TRIP_ROLES.ADMIN,
            TRIP_ROLES.EDITOR,
            // TRIP_ROLES.CONTRIBUTOR, // Consider adding contributor access check later
        ]);
        if (!access.allowed) {
            // Add check if the user is the creator of the item (if contributor role needs delete access)
            // const { data: itemData } = await supabase.from(...).select('created_by')...;
            // if (itemData?.created_by !== user.id) { ... return error ... }
            return NextResponse.json({ error: access.error }, { status: access.status });
        }
        // Delete the item
        const { error: deleteError, count } = await supabase
            .from(DB_TABLES.ITINERARY_ITEMS) // Use constant
            .delete()
            .eq(DB_FIELDS.ITINERARY_ITEMS.ID, itemId) // Use constant
            .eq(DB_FIELDS.ITINERARY_ITEMS.TRIP_ID, tripId); // Ensure item belongs to the correct trip
        if (deleteError) {
            console.error("Error deleting itinerary item:", deleteError);
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }
        if (count === 0) {
            return NextResponse.json({ error: "Itinerary item not found or already deleted." }, { status: 404 });
        }
        // TODO: Consider re-calculating positions for remaining items in the same day? Or handle gaps in frontend.
        return NextResponse.json({ success: true }, { status: 200 });
    }
    catch (error) {
        console.error("Unexpected error deleting itinerary item:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
