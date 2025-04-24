import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
export async function POST(request, props) {
    const { tripId } = props.params;
    if (!tripId)
        return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
    try {
        const supabase = createClient();
        const { message } = await request.json();
        // Check if user is authenticated
        const { data: { session }, } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;
        // Check if trip exists
        const { data: trip, error: tripError } = await supabase.from("trips").select("id").eq("id", tripId).single();
        if (tripError || !trip) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }
        // Check if user already has a pending request
        const { data: existingRequest, error: requestError } = await supabase
            .from("permission_requests")
            .select("id, status")
            .eq("trip_id", tripId)
            .eq("user_id", userId)
            .maybeSingle();
        if (existingRequest) {
            if (existingRequest.status === "pending") {
                return NextResponse.json({ error: "You already have a pending request" }, { status: 400 });
            }
            else if (existingRequest.status === "approved") {
                return NextResponse.json({ error: "You already have access to this trip" }, { status: 400 });
            }
            else {
                // If denied, allow to request again by updating the existing request
                const { error: updateError } = await supabase
                    .from("permission_requests")
                    .update({
                    status: "pending",
                    message,
                    updated_at: new Date().toISOString(),
                })
                    .eq("id", existingRequest.id);
                if (updateError) {
                    throw updateError;
                }
            }
        }
        else {
            // Create new request
            const { error: insertError } = await supabase.from("permission_requests").insert({
                trip_id: tripId,
                user_id: userId,
                message,
            });
            if (insertError) {
                throw insertError;
            }
        }
        // Notify trip organizers (in a real app, you would send emails or notifications here)
        // For now, we'll just return success
        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error("Error requesting access:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
