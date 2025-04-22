import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // Check if user is authenticated and is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (userError || !userData?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all trips with member count
    const { data: trips, error } = await supabase
      .from("trips")
      .select(`
        *,
        member_count:trip_members(count)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    // Format the trips to include the member count
    const formattedTrips = trips.map((trip) => ({
      ...trip,
      member_count: trip.member_count[0]?.count || 1,
    }))

    return NextResponse.json({ trips: formattedTrips })
  } catch (error) {
    console.error("Error fetching trips:", error)
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 })
  }
}
