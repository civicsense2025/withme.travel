import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: cookieStore })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile data
    const { data: profile, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Ensure interests is an array
    if (!Array.isArray(profile.interests)) {
      profile.interests = profile.interests ? [profile.interests] : []
    }

    return NextResponse.json(profile)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: cookieStore })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get update data from request
    const updateData = await request.json()

    // Ensure interests is an array
    const interests = Array.isArray(updateData.interests) ? updateData.interests : []

    // Update user profile
    const { data, error } = await supabase
      .from("users")
      .update({
        name: updateData.name,
        bio: updateData.bio,
        location: updateData.location,
        avatar_url: updateData.avatar_url,
        interests: interests,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Also update auth metadata
    await supabase.auth.updateUser({
      data: {
        name: updateData.name,
      },
    })

    return NextResponse.json(data[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
