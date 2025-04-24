import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
export async function GET(request) {
    const supabase = createClient();
    try {
        const { data: { user }, } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // First, find all trips created by this user
        const { data: userTrips, error: tripsError } = await supabase
            .from("trips")
            .select("id, title, created_by")
            .eq("created_by", user.id);
        if (tripsError) {
            console.error("[fix-membership] Error fetching trips:", tripsError);
            return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
        }
        if (!userTrips || userTrips.length === 0) {
            return NextResponse.json({ fixed: 0, message: "No trips found" });
        }
        // For each trip, check if there's a corresponding trip_members record
        let fixedCount = 0;
        for (const trip of userTrips) {
            // Check if there's a membership record for this user and trip
            const { data: membershipRecord, error: membershipError } = await supabase
                .from("trip_members")
                .select("id")
                .eq("trip_id", trip.id)
                .eq("user_id", user.id)
                .single();
            if (membershipError && membershipError.code !== "PGRST116") {
                console.error(`[fix-membership] Error checking membership for trip ${trip.id}:`, membershipError);
                continue;
            }
            // If no membership record exists, create one
            if (!membershipRecord) {
                const { error: insertError } = await supabase
                    .from("trip_members")
                    .insert({
                    trip_id: trip.id,
                    user_id: user.id,
                    role: "owner",
                    status: "confirmed"
                });
                if (insertError) {
                    console.error(`[fix-membership] Error creating membership for trip ${trip.id}:`, insertError);
                    continue;
                }
                fixedCount++;
            }
        }
        return NextResponse.json({
            fixed: fixedCount,
            message: fixedCount > 0
                ? `Fixed ${fixedCount} trips with missing membership records`
                : "No trips needed fixing"
        });
    }
    catch (error) {
        console.error("[fix-membership] Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
