import { createApiClient } from "@/utils/supabase/server";
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

// DELETE /api/trips/[tripId]/itinerary/[itemId] - Delete an itinerary item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tripId: string; itemId: string } }
) {
  try {
    const { tripId, itemId } = params;

    if (!tripId || !itemId) {
      return NextResponse.json(
        { error: "Trip ID and Item ID are required" },
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

    // Delete the item
    const { error: deleteError } = await supabase
      .from(DB_TABLES.ITINERARY_ITEMS)
      .delete()
      .eq("id", itemId)
      .eq("trip_id", tripId);

    if (deleteError) {
      console.error("Error deleting item:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
