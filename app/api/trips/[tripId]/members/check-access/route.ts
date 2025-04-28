import { createApiClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server"
import { DB_TABLES, DB_FIELDS, DB_ENUMS } from "@/utils/constants/database"

/**
 * Check if a user has access to a specific trip
 * 
 * @param request The incoming request
 * @param props The route parameters (tripId)
 * @returns A JSON response with access information and user role if available
 */
export async function GET(request: Request, props: { params: { tripId: string } }) {
  const { tripId } = props.params;

  try {
    const supabase = createClient()

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a member of this trip
    const { data: membership, error: membershipError } = await supabase
      .from(DB_TABLES.TRIP_MEMBERS)
      .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
      .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, user.id)
      .maybeSingle()

    if (membershipError) {
      console.error("Error checking trip membership:", membershipError)
      return NextResponse.json({ access: false, reason: "error", error: membershipError.message })
    }

    if (membership) {
      return NextResponse.json({
        access: true,
        isMember: true,
        role: membership.role,
      })
    }

    // Check if trip is public
    const { data: trip, error: tripError } = await supabase
      .from(DB_TABLES.TRIPS)
      .select(DB_FIELDS.TRIPS.IS_PUBLIC)
      .eq(DB_FIELDS.TRIPS.ID, tripId)
      .maybeSingle()

    if (tripError) {
      console.error("Error checking trip public status:", tripError)
      return NextResponse.json({ access: false, reason: "error", error: tripError.message })
    }

    // Return access status
    return NextResponse.json({
      access: trip?.is_public || false,
      isMember: false,
      isPublic: trip?.is_public || false,
    })
  } catch (error: any) {
    console.error("Error checking trip access:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
