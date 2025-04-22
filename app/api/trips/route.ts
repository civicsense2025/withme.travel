import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: trips, error } = await supabase
      .from("trips")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ trips: trips || [] })
  } catch (error) {
    console.error("Error fetching trips:", error)
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Ensure the trip is associated with the current user
    body.created_by = user.id

    const { data, error } = await supabase.from("trips").insert(body).select()

    if (error) {
      throw error
    }

    return NextResponse.json({ trip: data[0] })
  } catch (error) {
    console.error("Error creating trip:", error)
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 })
  }
}
