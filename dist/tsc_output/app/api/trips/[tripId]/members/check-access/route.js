import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
export async function GET(request, props) {
    const { tripId } = props.params;
    try {
        const supabase = createClient();
        // Check if user is authenticated
        const { data: { user }, } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Check if user is a member of the trip with admin or owner role
        const { data: membership, error: membershipError } = await supabase
            .from("trip_members")
            .select("role")
            .eq("trip_id", tripId)
            .eq("user_id", user.id)
            .single();
        if (membershipError || !membership) {
            return NextResponse.json({ error: "Access denied", hasAccess: false }, { status: 403 });
        }
        // Check if user has admin or owner role
        const hasAccess = ["owner", "admin"].includes(membership.role);
        if (!hasAccess) {
            return NextResponse.json({ error: "Insufficient permissions", hasAccess: false }, { status: 403 });
        }
        return NextResponse.json({ hasAccess: true });
    }
    catch (error) {
        console.error("Error checking trip access:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
