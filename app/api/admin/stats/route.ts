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

    // Get user count
    const { count: userCount, error: userCountError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    if (userCountError) {
      throw userCountError
    }

    // Get trip count
    const { count: tripCount, error: tripCountError } = await supabase
      .from("trips")
      .select("*", { count: "exact", head: true })

    if (tripCountError) {
      throw tripCountError
    }

    // Get destination count
    const { count: destinationCount, error: destinationCountError } = await supabase
      .from("destinations")
      .select("*", { count: "exact", head: true })

    if (destinationCountError) {
      throw destinationCountError
    }

    // Get active trips (trips with start_date <= today and end_date >= today)
    const today = new Date().toISOString().split("T")[0]
    const { count: activeTrips, error: activeTripsError } = await supabase
      .from("trips")
      .select("*", { count: "exact", head: true })
      .lte("start_date", today)
      .gte("end_date", today)

    if (activeTripsError) {
      throw activeTripsError
    }

    return NextResponse.json({
      userCount: userCount || 0,
      tripCount: tripCount || 0,
      destinationCount: destinationCount || 0,
      activeTrips: activeTrips || 0,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 })
  }
}
