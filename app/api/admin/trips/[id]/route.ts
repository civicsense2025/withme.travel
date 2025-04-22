import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const tripId = params.id

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

    // Delete trip members first
    await supabase.from("trip_members").delete().eq("trip_id", tripId)

    // Delete trip itinerary items
    await supabase.from("trip_itinerary").delete().eq("trip_id", tripId)

    // Delete trip expenses
    await supabase.from("trip_expenses").delete().eq("trip_id", tripId)

    // Delete trip notes
    await supabase.from("trip_notes").delete().eq("trip_id", tripId)

    // Delete access requests
    await supabase.from("access_requests").delete().eq("trip_id", tripId)

    // Finally delete the trip
    const { error } = await supabase.from("trips").delete().eq("id", tripId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting trip:", error)
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 })
  }
}
