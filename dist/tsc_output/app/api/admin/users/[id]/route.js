import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
export async function PATCH(request, { params }) {
    const supabase = createClient();
    const userId = params.id;
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
        // Get update data from request
        const updateData = await request.json();
        // Update user
        const { data, error } = await supabase.from("users").update(updateData).eq("id", userId).select();
        if (error) {
            throw error;
        }
        return NextResponse.json({ user: data[0] });
    }
    catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}
export async function DELETE(request, { params }) {
    const supabase = createClient();
    const userId = params.id;
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
        // Delete user's trip memberships
        await supabase.from("trip_members").delete().eq("user_id", userId);
        // Delete user's access requests
        await supabase.from("access_requests").delete().eq("user_id", userId);
        // Delete user's invitations
        await supabase.from("invitations").delete().eq("email", userId);
        // Finally delete the user
        const { error } = await supabase.from("users").delete().eq("id", userId);
        if (error) {
            throw error;
        }
        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
