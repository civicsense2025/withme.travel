import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: { id: string; requestId: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const tripId = params.id
    const requestId = params.requestId
    const { status } = await request.json()

    if (!["approved", "denied"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin or owner of the trip
    const { data: member, error: memberError } = await supabase
      .from("trip_members")
      .select("role")
      .eq("trip_id", tripId)
      .eq("user_id", session.user.id)
      .single()

    if (memberError || !member || !["owner", "admin"].includes(member.role)) {
      return NextResponse.json({ error: "You don't have permission to manage access requests" }, { status: 403 })
    }

    // Get the access request
    const { data: permissionRequest, error: requestError } = await supabase
      .from("permission_requests")
      .select("user_id, status")
      .eq("id", requestId)
      .eq("trip_id", tripId)
      .single()

    if (requestError || !permissionRequest) {
      return NextResponse.json({ error: "Access request not found" }, { status: 404 })
    }

    if (permissionRequest.status !== "pending") {
      return NextResponse.json({ error: "This request has already been processed" }, { status: 400 })
    }

    // Update the request status
    const { error: updateError } = await supabase
      .from("permission_requests")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (updateError) {
      throw updateError
    }

    // If approved, add or update the user's role in trip_members
    if (status === "approved") {
      // Check if user is already a member
      const { data: existingMember, error: existingError } = await supabase
        .from("trip_members")
        .select("id, role")
        .eq("trip_id", tripId)
        .eq("user_id", permissionRequest.user_id)
        .maybeSingle()

      if (existingMember) {
        // Update role to admin if not already
        if (existingMember.role !== "admin" && existingMember.role !== "owner") {
          await supabase.from("trip_members").update({ role: "admin" }).eq("id", existingMember.id)
        }
      } else {
        // Add user as admin
        await supabase.from("trip_members").insert({
          trip_id: tripId,
          user_id: permissionRequest.user_id,
          role: "admin",
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error processing access request:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
