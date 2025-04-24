import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";
export async function GET() {
    const supabase = createClient();
    try {
        // Check if user is authenticated and is an admin
        const { data: { user }, } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Check if user is an admin
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("is_admin")
            .eq("id", user.id)
            .single();
        if (userError || !(userData === null || userData === void 0 ? void 0 : userData.is_admin)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        console.log("Admin verified, fetching stats");
        // Create admin client to bypass RLS
        const adminClient = createAdminClient();
        // Initialize stats with default values
        const stats = {
            totalUsers: 0,
            totalTrips: 0,
            totalDestinations: 0,
            activeTrips: 0,
        };
        // Get users count
        try {
            const { count, error } = await adminClient
                .from("users")
                .select("*", { count: "exact", head: true });
            if (!error) {
                stats.totalUsers = count || 0;
            }
        }
        catch (e) {
            console.error("Error counting users:", e);
        }
        // Get trips count
        try {
            const { count, error } = await adminClient
                .from("trips")
                .select("*", { count: "exact", head: true });
            if (!error) {
                stats.totalTrips = count || 0;
            }
        }
        catch (e) {
            console.error("Error counting trips:", e);
        }
        // Get destinations count
        try {
            const { count, error } = await adminClient
                .from("destinations")
                .select("*", { count: "exact", head: true });
            if (!error) {
                stats.totalDestinations = count || 0;
            }
        }
        catch (e) {
            console.error("Error counting destinations:", e);
        }
        // Get active trips count
        try {
            const today = new Date().toISOString().split("T")[0];
            const { count, error } = await adminClient
                .from("trips")
                .select("*", { count: "exact", head: true })
                .gte("end_date", today);
            if (!error) {
                stats.activeTrips = count || 0;
            }
        }
        catch (e) {
            console.error("Error counting active trips:", e);
        }
        return NextResponse.json({ stats });
    }
    catch (error) {
        console.error("Error fetching admin stats:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
