import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import { TRIP_ROLES, DB_TABLES } from "@/utils/constants"
import { NextRequest } from "next/server"

// Helper function to check user membership and role
async function checkTripAccess(
  supabase: ReturnType<typeof createClient>,
  tripId: string,
  userId: string,
  allowedRoles: string[] = [
    TRIP_ROLES.ADMIN,
    TRIP_ROLES.EDITOR,
    TRIP_ROLES.CONTRIBUTOR,
  ]
): Promise<{ allowed: boolean; error?: string; status?: number }> {
  const { data: member, error } = await supabase
    .from(DB_TABLES.TRIP_MEMBERS)
    .select("role")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error checking trip membership:", error);
    return { allowed: false, error: error.message, status: 500 };
  }

  if (!member) {
    return {
      allowed: false,
      error: "Access Denied: You are not a member of this trip.",
      status: 403,
    };
  }

  if (!allowedRoles.includes(member.role)) {
    return {
      allowed: false,
      error: "Access Denied: You do not have sufficient permissions.",
      status: 403,
    };
  }

  return { allowed: true };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const { tripId } = await params;
    const body = await request.json();
    const { itemId, newDayNumber, newPosition } = body;

    if (!tripId || !itemId || newDayNumber === undefined || newPosition === undefined) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check user's access to the trip
    const accessCheck = await checkTripAccess(supabase, tripId, user.id);
    if (!accessCheck.allowed) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status || 403 }
      );
    }

    // LOGGING ADDED HERE
    console.log(`[API /reorder] Received request for trip ${tripId}:`, body);
    console.log(`[API /reorder] Calling RPC with:`, {
      p_item_id: itemId,
      p_trip_id: tripId,
      p_day_number: newDayNumber,
      p_position: newPosition,
    });

    // Call the updated RPC function
    // It handles section_id lookup and reordering internally
    const { error: rpcError } = await supabase.rpc('update_itinerary_item_position', {
      p_item_id: itemId,
      p_trip_id: tripId,
      p_day_number: newDayNumber, // Can be null for unscheduled
      p_position: newPosition
      // No need to pass p_section_id anymore
    });

    // Handle RPC error
    if (rpcError) {
      console.error("Error calling update_itinerary_item_position RPC:", rpcError);
      return NextResponse.json(
        { error: "Failed to update item position: " + rpcError.message },
        { status: 500 }
      );
    }

    // If RPC succeeded, return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in reorder handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}