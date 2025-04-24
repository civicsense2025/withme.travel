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
            console.error("Admin check failed:", userError);
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        console.log("Admin verified, fetching trips");
        // Create admin client that bypasses RLS
        const adminClient = createAdminClient();
        // Add more detailed logging and error handling
        try {
            // Use admin client to bypass RLS policies
            const { data: trips, error } = await adminClient
                .from("trips")
                .select(`
          id, 
          name, 
          destination_id,
          destination_name,
          start_date, 
          end_date, 
          created_by,
          created_at,
          updated_at,
          is_public,
          slug
        `)
                .order("created_at", { ascending: false });
            if (error) {
                console.error("Supabase error fetching trips:", error);
                return NextResponse.json({ error: "Database query failed" }, { status: 500 });
            }
            // Fetch user information separately
            const userIds = [...new Set(trips.map(trip => trip.created_by))];
            if (userIds.length > 0) {
                const { data: users, error: userError } = await adminClient
                    .from("users")
                    .select("id, email, name")
                    .in("id", userIds);
                if (!userError && users) {
                    // Map users to trips
                    const usersMap = {};
                    users.forEach(user => {
                        usersMap[user.id] = user;
                    });
                    // Add user details to trips
                    trips.forEach((trip) => {
                        trip.users = usersMap[trip.created_by] || null;
                    });
                }
            }
            return NextResponse.json({ trips: trips || [] });
        }
        catch (queryError) {
            console.error("Exception during trips query:", queryError);
            return NextResponse.json({ error: "Query execution failed" }, { status: 500 });
        }
    }
    catch (error) {
        console.error("Error in admin trips endpoint:", error);
        return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
    }
}
