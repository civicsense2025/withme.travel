import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
export async function DELETE(request, { params }) {
    try {
        const supabase = createClient();
        const unwrappedParams = await params;
        const tripId = unwrappedParams.id;
        const memberId = unwrappedParams.memberId;
        // Check if user is authenticated
        const { data: { session }, } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Check if user is an organizer of this trip
        const { data: organizer, error: organizerError } = await supabase
            .from("trip_members")
            .select()
            .eq("trip_id", tripId)
            .eq("user_id", session.user.id)
            .eq("role", "organizer")
            .maybeSingle();
        if (organizerError || !organizer) {
            return NextResponse.json({ error: "Only organizers can remove members" }, { status: 403 });
        }
        // Get member to delete
        const { data: memberToDelete, error: memberError } = await supabase
            .from("trip_members")
            .select()
            .eq("id", memberId)
            .eq("trip_id", tripId)
            .maybeSingle();
        if (memberError || !memberToDelete) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }
        // Don't allow removing the last organizer
        if (memberToDelete.role === "organizer") {
            // Count organizers
            const { count, error: countError } = await supabase
                .from("trip_members")
                .select("*", { count: "exact", head: true })
                .eq("trip_id", tripId)
                .eq("role", "organizer");
            if (countError) {
                return NextResponse.json({ error: countError.message }, { status: 500 });
            }
            if (count === 1) {
                return NextResponse.json({ error: "Cannot remove the last organizer" }, { status: 400 });
            }
        }
        // Delete member
        const { error } = await supabase.from("trip_members").delete().eq("id", memberId);
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function PATCH(request, { params }) {
    try {
        const supabase = createClient();
        const unwrappedParams = await params;
        const tripId = unwrappedParams.id;
        const memberId = unwrappedParams.memberId;
        // Check if user is authenticated
        const { data: { session }, } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Check if user is an organizer of this trip
        const { data: organizer, error: organizerError } = await supabase
            .from("trip_members")
            .select()
            .eq("trip_id", tripId)
            .eq("user_id", session.user.id)
            .eq("role", "organizer")
            .maybeSingle();
        if (organizerError || !organizer) {
            return NextResponse.json({ error: "Only organizers can update member roles" }, { status: 403 });
        }
        // Get update data
        const { role } = await request.json();
        if (!role || (role !== "organizer" && role !== "member")) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }
        // Get member to update
        const { data: memberToUpdate, error: memberError } = await supabase
            .from("trip_members")
            .select()
            .eq("id", memberId)
            .eq("trip_id", tripId)
            .maybeSingle();
        if (memberError || !memberToUpdate) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }
        // If downgrading from organizer, check if there's at least one other organizer
        if (memberToUpdate.role === "organizer" && role === "member") {
            // Count organizers
            const { count, error: countError } = await supabase
                .from("trip_members")
                .select("*", { count: "exact", head: true })
                .eq("trip_id", tripId)
                .eq("role", "organizer");
            if (countError) {
                return NextResponse.json({ error: countError.message }, { status: 500 });
            }
            if (count === 1) {
                return NextResponse.json({ error: "Cannot downgrade the last organizer" }, { status: 400 });
            }
        }
        // Update member role
        const { data, error } = await supabase
            .from("trip_members")
            .update({ role })
            .eq("id", memberId)
            .select(`
        *,
        user:user_id(id, name, email, avatar_url)
      `);
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ member: data[0] });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
