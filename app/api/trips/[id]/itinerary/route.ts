import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// Helper function to check user membership and role
async function checkTripAccess(
  supabase: ReturnType<typeof createClient>,
  tripId: string,
  userId: string,
  allowedRoles: string[] = ["owner", "admin", "editor", "viewer"] // Default: any member can access
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

// GET /api/trips/[id]/itinerary - Fetch all itinerary items for a trip
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: authError?.message || "Authentication required" },
        { status: 401 }
      )
    }

    const tripId = params.id

    // Check if user is a member of the trip (any role can view)
    const access = await checkTripAccess(supabase, tripId, user.id)
    if (!access.allowed) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    // Fetch itinerary items
    const { data: items, error: fetchError } = await supabase
      .from("itinerary_items")
      .select("*") // Select all columns or specify needed ones
      .eq("trip_id", tripId)
      .order("date", { ascending: true, nullsFirst: false })
      .order("start_time", { ascending: true, nullsFirst: false })

    if (fetchError) {
      console.error("Error fetching itinerary items:", fetchError)
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ items: items || [] }, { status: 200 })
  } catch (error: any) {
    console.error("Unexpected error fetching itinerary:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/trips/[id]/itinerary - Create a new itinerary item
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: authError?.message || "Authentication required" },
        { status: 401 }
      )
    }

    const tripId = params.id

    // Check if user has permission to add items (e.g., owner, admin, editor)
    const access = await checkTripAccess(supabase, tripId, user.id, [
      "owner",
      "admin",
      "editor",
    ])
    if (!access.allowed) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const newItemData = await request.json()

    // Validate required fields (example: title)
    if (!newItemData.title) {
      return NextResponse.json({ error: "Title is required for itinerary item." }, { status: 400 })
    }

    // Add trip_id and created_by from server-side context
    const itemToInsert = {
      ...newItemData,
      trip_id: tripId,
      created_by: user.id,
    }

    // Insert the new item
    const { data: newItem, error: insertError } = await supabase
      .from("itinerary_items")
      .insert(itemToInsert)
      .select()
      .single()

    if (insertError) {
      console.error("Error inserting itinerary item:", insertError)
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ item: newItem }, { status: 201 })
  } catch (error: any) {
    console.error("Unexpected error creating itinerary item:", error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
