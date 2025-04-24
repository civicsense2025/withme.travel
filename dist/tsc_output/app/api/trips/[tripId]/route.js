var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { DB_TABLES, DB_FIELDS, TRIP_ROLES } from "@/utils/constants";
import { z } from 'zod';
const updateTripSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(100).optional(),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    destination_id: z.string().uuid().nullable().optional(),
}).strict();
// --- GET Handler --- 
export async function GET(request, { params }) {
    var _a;
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.log("No user found in trip fetch", authError);
            return NextResponse.json({ error: (authError === null || authError === void 0 ? void 0 : authError.message) || "Unauthorized - Please log in" }, { status: 401 });
        }
        const { data: member, error: memberError } = await supabase
            .from(DB_TABLES.TRIP_MEMBERS)
            .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
            .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, params.tripId) // Use tripId
            .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, user.id)
            .maybeSingle();
        if (memberError) {
            console.error("Error checking trip membership:", memberError);
            return NextResponse.json({ error: memberError.message }, { status: 500 });
        }
        if (!member) {
            return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 });
        }
        const { data: trip, error } = await supabase
            .from(DB_TABLES.TRIPS)
            .select(`
        *,
        ${DB_TABLES.TRIP_MEMBERS}(count),
        ${DB_FIELDS.TRIPS.CREATED_BY}(id, name, email, avatar_url)
      `)
            .eq(DB_FIELDS.TRIPS.ID, params.tripId) // Use tripId
            .single();
        if (error) {
            console.error("Error fetching trip details:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        const formattedTrip = Object.assign(Object.assign({}, trip), { members: ((_a = trip.trip_members[0]) === null || _a === void 0 ? void 0 : _a.count) || 0 });
        return NextResponse.json({
            trip: formattedTrip,
            userRole: member.role,
        });
    }
    catch (error) {
        console.error("Unexpected error in trip fetch:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
// --- PATCH Handler --- 
export async function PATCH(request, { params }) {
    const { tripId } = params;
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: (authError === null || authError === void 0 ? void 0 : authError.message) || "Unauthorized" }, { status: 401 });
        }
        const { data: member, error: memberError } = await supabase
            .from(DB_TABLES.TRIP_MEMBERS)
            .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
            .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId) // Use tripId variable
            .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, user.id)
            .in("role", [TRIP_ROLES.ADMIN, TRIP_ROLES.EDITOR])
            .maybeSingle();
        if (memberError) {
            console.error("Error checking trip edit permissions:", memberError);
            return NextResponse.json({ error: "Error checking permissions" }, { status: 500 });
        }
        if (!member) {
            return NextResponse.json({ error: "You don't have permission to edit this trip" }, { status: 403 });
        }
        const body = await request.json();
        const validationResult = updateTripSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({ error: "Invalid input data", issues: validationResult.error.issues }, { status: 400 });
        }
        // Explicitly exclude 'tags' from the data being sent to the 'trips' table update
        const _a = validationResult.data, { tags } = _a, dataToUpdate = __rest(_a, ["tags"]);
        // Add updated_at timestamp
        const finalDataToUpdate = Object.assign(Object.assign({}, dataToUpdate), { updated_at: new Date().toISOString() });
        // Ensure 'destinations' field is not present if it exists in original body (though schema check should prevent it)
        // This check is likely redundant now with strict schema parsing and explicit exclusion but kept for safety.
        if ('destinations' in finalDataToUpdate) {
            delete finalDataToUpdate.destinations;
        }
        const { data, error: updateError } = await supabase
            .from(DB_TABLES.TRIPS)
            .update(finalDataToUpdate) // Use the data WITHOUT tags
            .eq(DB_FIELDS.TRIPS.ID, tripId)
            .select()
            .single();
        if (updateError) {
            console.error("Error updating trip:", updateError);
            return NextResponse.json({ error: `Failed to update trip: ${updateError.message}` }, { status: 500 });
        }
        return NextResponse.json({ trip: data });
    }
    catch (error) {
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
        }
        console.error("Unexpected error in PATCH trip:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
// --- DELETE Handler ---
export async function DELETE(request, { params }) {
    const { tripId } = params;
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: (authError === null || authError === void 0 ? void 0 : authError.message) || "Unauthorized" }, { status: 401 });
        }
        const { data: member, error: memberError } = await supabase
            .from(DB_TABLES.TRIP_MEMBERS)
            .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
            .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId) // Use tripId variable
            .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, user.id)
            .eq(DB_FIELDS.TRIP_MEMBERS.ROLE, TRIP_ROLES.ADMIN)
            .maybeSingle();
        if (memberError) {
            console.error("Error checking trip delete permissions:", memberError);
            return NextResponse.json({ error: "Error checking permissions" }, { status: 500 });
        }
        if (!member) {
            return NextResponse.json({ error: "Only trip admins can delete a trip" }, { status: 403 });
        }
        // Perform deletion
        const { error: deleteError } = await supabase
            .from(DB_TABLES.TRIPS)
            .delete()
            .eq(DB_FIELDS.TRIPS.ID, tripId); // Use tripId variable
        if (deleteError) {
            console.error("Error deleting trip:", deleteError);
            return NextResponse.json({ error: `Failed to delete trip: ${deleteError.message}` }, { status: 500 });
        }
        return NextResponse.json({ message: "Trip deleted successfully" });
    }
    catch (error) {
        console.error("Unexpected error in DELETE trip:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
