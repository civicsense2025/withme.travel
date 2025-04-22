import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { email } = await request.json()

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to invite (is admin or owner)
    const { data: membership, error: membershipError } = await supabase
      .from("trip_members")
      .select("role")
      .eq("trip_id", params.id)
      .eq("user_id", user.id)
      .single()

    if (membershipError || !membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json({ error: "You don't have permission to invite members" }, { status: 403 })
    }

    // Check if trip exists
    const { data: trip, error: tripError } = await supabase.from("trips").select("name").eq("id", params.id).single()

    if (tripError || !trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    // Check if user already exists
    const { data: existingUser } = await supabase.from("profiles").select("id").eq("email", email).single()

    let userId = existingUser?.id

    // If user doesn't exist, create a placeholder profile
    if (!userId) {
      userId = uuidv4()
      await supabase.from("profiles").insert({
        id: userId,
        email: email,
        status: "pending",
      })
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("trip_members")
      .select("id")
      .eq("trip_id", params.id)
      .eq("user_id", userId)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: "User is already a member of this trip" }, { status: 400 })
    }

    // Create invitation
    const inviteToken = uuidv4()

    // Store the invitation in the invitations table
    await supabase.from("invitations").insert({
      trip_id: params.id,
      email: email,
      invited_by: user.id,
      token: inviteToken,
      role: "member",
    })

    // Add user as a pending member
    await supabase.from("trip_members").insert({
      trip_id: params.id,
      user_id: userId,
      role: "member",
      status: "pending",
      invited_by: user.id,
    })

    // Generate invitation URL with token
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${inviteToken}`

    // In a real app, you would send an email here with the inviteUrl
    console.log(`Invitation URL for ${email}: ${inviteUrl}`)

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${email}`,
      inviteUrl,
    })
  } catch (error: any) {
    console.error("Error inviting member:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
