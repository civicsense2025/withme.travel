import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { TRIP_ROLES } from "@/utils/constants";
export async function POST(request, { params }) {
    try {
        const supabase = createClient();
        // Type the parsed body
        const { message, requestedRole } = await request.json();
        // Check if user is authenticated
        const { data: { user }, } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Check if trip exists
        const { data: trip, error: tripError } = await supabase
            .from("trips")
            .select("id, name")
            .eq("id", params.tripId)
            .single();
        if (tripError || !trip) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }
        // Check if user is already a member with sufficient permissions
        const { data: membership, error: membershipError } = await supabase
            .from("trip_members")
            .select("role")
            .eq("trip_id", params.tripId)
            .eq("user_id", user.id)
            .maybeSingle();
        // Check against ADMIN and EDITOR roles using imported constant
        if (membership && [TRIP_ROLES.ADMIN, TRIP_ROLES.EDITOR].includes(membership.role)) {
            return NextResponse.json({ error: "You already have edit permissions for this trip" }, { status: 400 });
        }
        // Check if there's already a pending request
        const { data: existingRequest } = await supabase
            .from("permission_requests")
            .select("id, status")
            .eq("trip_id", params.tripId)
            .eq("user_id", user.id)
            .eq("status", "pending")
            .single();
        if (existingRequest) {
            return NextResponse.json({ error: "You already have a pending request for this trip" }, { status: 400 });
        }
        // Create the permission request
        const { data: requestData, error: requestError } = await supabase
            .from("permission_requests")
            .insert({
            trip_id: params.tripId,
            user_id: user.id,
            requested_role: requestedRole || TRIP_ROLES.EDITOR, // Default to EDITOR if not provided
            message,
        })
            .select()
            .single();
        if (requestError) {
            console.error("Error creating permission request:", requestError);
            return NextResponse.json({ error: requestError.message }, { status: 500 });
        }
        // Get trip admins to notify
        const { data: admins } = await supabase
            .from("trip_members")
            .select("user_id")
            .eq("trip_id", params.tripId)
            .in("role", ["owner", "admin"]);
        // In a real app, you would send notifications to admins here
        // For now, we'll just return success
        return NextResponse.json({ request: requestData }); // Use the new variable name
    }
    catch (error) {
        console.error("Error requesting permissions:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
