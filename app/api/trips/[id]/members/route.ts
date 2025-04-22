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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a member of this trip
    const { data: member, error: memberError } = await supabase
      .from("trip_members")
      .select()
      .eq("trip_id", params.id)
      .eq("user_id", session.user.id)
      .maybeSingle()

    if (memberError || !member) {
      return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 })
    }

    // Get trip members
    const { data: members, error } = await supabase
      .from("trip_members")
      .select(`
        *,
        user:user_id(id, name, email, avatar_url)
      `)
      .eq("trip_id", params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ members })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
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
    const { data: organizer, error: organizerError } = await supabase
      .from("trip_members")
      .select()
      .eq("trip_id", params.id)
      .eq("user_id", session.user.id)
      .eq("role", "organizer")
      .maybeSingle()

    if (organizerError || !organizer) {
      return NextResponse.json({ error: "Only organizers can add members" }, { status: 403 })
    }

    // Get member data from request
    const { email, name, role = "member" } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    let userId: string

    // If user doesn't exist, create them
    if (!existingUser) {
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([{ email, name: name || email.split("@")[0] }])
        .select()

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }

      userId = newUser?.[0].id
    } else {
      userId = existingUser.id
    }

    // Check if user is already a member
    const { data: existingMember, error: checkError } = await supabase
      .from("trip_members")
      .select()
      .eq("trip_id", params.id)
      .eq("user_id", userId)
      .maybeSingle()

    if (existingMember) {
      return NextResponse.json({ error: "User is already a member of this trip" }, { status: 400 })
    }

    // Add user as trip member
    const { data, error } = await supabase
      .from("trip_members")
      .insert([
        {
          trip_id: params.id,
          user_id: userId,
          role,
        },
      ])
      .select(`
        *,
        user:user_id(id, name, email, avatar_url)
      `)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ member: data[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
