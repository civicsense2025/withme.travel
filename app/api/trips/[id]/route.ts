import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("No session found in trip fetch")
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 })
    }

    // Check if user is a member of this trip
    const { data: member, error: memberError } = await supabase
      .from("trip_members")
      .select("role")
      .eq("trip_id", params.id)
      .eq("user_id", session.user.id)
      .maybeSingle()

    if (memberError) {
      console.error("Error checking trip membership:", memberError)
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    if (!member) {
      return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 })
    }

    // Get trip details
    const { data: trip, error } = await supabase
      .from("trips")
      .select(`
        *,
        trip_members(count),
        created_by(id, name, email, avatar_url)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching trip details:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format trip
    const formattedTrip = {
      ...trip,
      members: trip.trip_members[0]?.count || 0,
    }

    return NextResponse.json({
      trip: formattedTrip,
      userRole: member.role,
    })
  } catch (error: any) {
    console.error("Unexpected error in trip fetch:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an organizer of this trip
    const { data: member, error: memberError } = await supabase
      .from("trip_members")
      .select("role")
      .eq("trip_id", params.id)
      .eq("user_id", session.user.id)
      .maybeSingle()

    if (memberError || !member) {
      return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 })
    }

    // Check if user has edit permissions
    if (!["owner", "admin", "editor"].includes(member.role)) {
      return NextResponse.json({ error: "You don't have permission to edit this trip" }, { status: 403 })
    }

    // Get update data
    const tripData = await request.json()

    // Update trip
    const { data, error } = await supabase.from("trips").update(tripData).eq("id", params.id).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ trip: data[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an owner of this trip
    const { data: member, error: memberError } = await supabase
      .from("trip_members")
      .select("role")
      .eq("trip_id", params.id)
      .eq("user_id", session.user.id)
      .eq("role", "owner")
      .maybeSingle()

    if (memberError || !member) {
      return NextResponse.json({ error: "Only owners can delete trips" }, { status: 403 })
    }

    // Delete trip (cascade will delete all related data)
    const { error } = await supabase.from("trips").delete().eq("id", params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
