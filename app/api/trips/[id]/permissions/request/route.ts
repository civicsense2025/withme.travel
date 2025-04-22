import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { message, requestedRole } = await request.json()

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if trip exists
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("id, name")
      .eq("id", params.id)
      .single()

    if (tripError || !trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    // Check if user is already a member with sufficient permissions
    const { data: membership, error: membershipError } = await supabase
      .from("trip_members")
      .select("role")
      .eq("trip_id", params.id)
      .eq("user_id", user.id)
      .single()

    if (membership && ["owner", "admin", "editor"].includes(membership.role)) {
      return NextResponse.json({ error: "You already have edit permissions for this trip" }, { status: 400 })
    }

    // Check if there's already a pending request
    const { data: existingRequest } = await supabase
      .from("permission_requests")
      .select("id, status")
      .eq("trip_id", params.id)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .single()

    if (existingRequest) {
      return NextResponse.json({ error: "You already have a pending request for this trip" }, { status: 400 })
    }

    // Create the permission request
    const { data: request, error: requestError } = await supabase
      .from("permission_requests")
      .insert({
        trip_id: params.id,
        user_id: user.id,
        requested_role: requestedRole || "editor",
        message,
      })
      .select()

    if (requestError) {
      return NextResponse.json({ error: requestError.message }, { status: 500 })
    }

    // Get trip admins to notify
    const { data: admins } = await supabase
      .from("trip_members")
      .select("user_id")
      .eq("trip_id", params.id)
      .in("role", ["owner", "admin"])

    // In a real app, you would send notifications to admins here
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: "Permission request submitted successfully",
      requestId: request[0].id,
    })
  } catch (error: any) {
    console.error("Error requesting permissions:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
