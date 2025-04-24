import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { TRIP_ROLES } from "@/utils/constants";

export async function POST(request: Request, props: { params: { tripId: string } }) {
  const { tripId } = props.params;

  try {
    if (!tripId) {
      return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Check if user is already member of the trip
    const { data: member, error: memberError } = await supabase
      .from("trip_members")
      .select("id, role")
      .eq("trip_id", tripId)
      .eq("user_id", user.id)
      .single();

    if (memberError) {
      return NextResponse.json({ error: "Failed to check membership" }, { status: 500 });
    }

    // If user is member but role is lowercase "admin", update it to uppercase "ADMIN"
    if (member && member.role === "admin") {
      const { error: updateError } = await supabase
        .from("trip_members")
        .update({ role: TRIP_ROLES.ADMIN })
        .eq("id", member.id);

      if (updateError) {
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: "Role updated to ADMIN",
        previousRole: member.role,
        newRole: TRIP_ROLES.ADMIN
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "No role update needed",
      currentRole: member?.role || null
    });
  } catch (error: any) {
    console.error("Error fixing role:", error);
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
} 