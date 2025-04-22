import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Helper function to check user membership and role (can be reused or imported)
async function checkTripAccess(
  supabase: ReturnType<typeof createClient>,
  tripId: string,
  userId: string,
  allowedRoles: string[]
): Promise<{ allowed: boolean; error?: string; status?: number }> {
  const { data: member, error } = await supabase
    .from("trip_members")
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

// PATCH /api/trips/[id]/itinerary/[itemId] - Update an itinerary item
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: authError?.message || "Authentication required" },
        { status: 401 }
      );
    }

    const tripId = params.id;
    const itemId = params.itemId;

    // Check if user has permission to edit items (e.g., owner, admin, editor)
    const access = await checkTripAccess(supabase, tripId, user.id, [
      "owner",
      "admin",
      "editor",
    ]);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const updates = await request.json();

    // Prevent updating trip_id or created_by
    delete updates.trip_id;
    delete updates.created_by;
    delete updates.id; // Cannot change the primary key

    if (Object.keys(updates).length === 0) {
         return NextResponse.json({ error: "No valid fields provided for update." }, { status: 400 });
    }

    // Update the item
    const { data: updatedItem, error: updateError } = await supabase
      .from("itinerary_items")
      .update(updates)
      .eq("id", itemId)
      .eq("trip_id", tripId) // Ensure item belongs to the correct trip
      .select()
      .single();

    if (updateError) {
      console.error("Error updating itinerary item:", updateError);
      // Handle case where item not found (might be due to wrong itemId or tripId)
      if (updateError.code === 'PGRST116') { // PostgREST code for zero rows returned
         return NextResponse.json({ error: "Itinerary item not found or access denied." }, { status: 404 });
      }
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ item: updatedItem }, { status: 200 });
  } catch (error: any) {
    console.error("Unexpected error updating itinerary item:", error);
    if (error instanceof SyntaxError) {
       return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/trips/[id]/itinerary/[itemId] - Delete an itinerary item
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: authError?.message || "Authentication required" },
        { status: 401 }
      );
    }

    const tripId = params.id;
    const itemId = params.itemId;

    // Check if user has permission to delete items (e.g., owner, admin, editor)
    const access = await checkTripAccess(supabase, tripId, user.id, [
      "owner",
      "admin",
      "editor",
    ]);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    // Delete the item
    const { error: deleteError, count } = await supabase
      .from("itinerary_items")
      .delete()
      .eq("id", itemId)
      .eq("trip_id", tripId); // Ensure item belongs to the correct trip

    if (deleteError) {
      console.error("Error deleting itinerary item:", deleteError);
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    if (count === 0) {
      return NextResponse.json({ error: "Itinerary item not found or already deleted." }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 }); // 200 OK or 204 No Content
  } catch (error: any) {
    console.error("Unexpected error deleting itinerary item:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 