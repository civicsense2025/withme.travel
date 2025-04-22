import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const tripId = params.id

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
      return NextResponse.json({ error: "You don't have permission to view access requests" }, { status: 403 })
    }

    // Get pending access requests
    const { data: requests, error: requestsError } = await supabase
      .from("permission_requests")
      .select(`
        id,
        user_id,
        message,
        created_at,
        user:user_id (
          name,
          email,
          avatar_url
        )
      `)
      .eq("trip_id", tripId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (requestsError) {
      throw requestsError
    }

    return NextResponse.json({ requests })
  } catch (error: any) {
    console.error("Error fetching access requests:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
