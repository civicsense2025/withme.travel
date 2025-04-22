import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { token: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if invitation exists and is valid
    const { data: invitation, error } = await supabase
      .from("invitations")
      .select("*")
      .eq("token", params.token)
      .single()

    if (error || !invitation) {
      return NextResponse.json({ error: "Invitation not found or expired" }, { status: 404 })
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: "Invitation has expired" }, { status: 410 })
    }

    // Update the user's email if it doesn't match the invitation
    if (user.email !== invitation.email) {
      // This is a different user accepting the invitation
      // In a real app, you might want to handle this differently
      console.log(`User ${user.email} accepting invitation meant for ${invitation.email}`)
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("trip_members")
      .select("id, status")
      .eq("trip_id", invitation.trip_id)
      .eq("user_id", user.id)
      .single()

    if (existingMember) {
      if (existingMember.status === "active") {
        return NextResponse.json({ error: "You are already a member of this trip" }, { status: 400 })
      }

      // Update existing member from pending to active
      await supabase
        .from("trip_members")
        .update({
          status: "active",
          role: invitation.role,
        })
        .eq("id", existingMember.id)
    } else {
      // Add user as a member
      await supabase.from("trip_members").insert({
        trip_id: invitation.trip_id,
        user_id: user.id,
        role: invitation.role,
        status: "active",
        invited_by: invitation.invited_by,
      })
    }

    // Update invitation status
    await supabase
      .from("invitations")
      .update({
        status: "accepted",
      })
      .eq("id", invitation.id)

    // Update referral tracking if this is a new user
    const { data: profile } = await supabase.from("profiles").select("created_at").eq("id", user.id).single()

    // If user was created recently (within last hour), consider this a referral
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    if (profile && new Date(profile.created_at) > oneHourAgo) {
      // Update the referred_by field
      await supabase
        .from("profiles")
        .update({
          referred_by: invitation.invited_by,
        })
        .eq("id", user.id)
    }

    return NextResponse.json({
      success: true,
      tripId: invitation.trip_id,
    })
  } catch (error: any) {
    console.error("Error accepting invitation:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
