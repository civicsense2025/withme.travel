import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log(`[API /trips] Fetching trips for user ${user.id}`)

    // 1. Fetch trips created by the user
    const { data: createdTrips, error: createdTripsError } = await supabase
      .from("trips")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })

    if (createdTripsError) {
      console.error("[API /trips] Error fetching created trips:", createdTripsError)
      throw createdTripsError
    }

    // 2. Fetch trips where the user is a member (but didn't create)
    const { data: memberTrips, error: memberTripsError } = await supabase
      .from("trip_members")
      .select(`
        trip:trips!inner (*)
      `)
      .eq("user_id", user.id)
      .neq("trips.created_by", user.id) // Exclude trips already fetched above
      .order("created_at", { referencedTable: "trips", ascending: false })

    if (memberTripsError) {
      console.error("[API /trips] Error fetching member trips:", memberTripsError)
      throw memberTripsError
    }

    // Extract the trip details from member trips
    const userMemberTrips = memberTrips ? memberTrips.map(item => item.trip) : []
    
    // Combine both sets of trips
    const allTrips = [...(createdTrips || []), ...(userMemberTrips || [])]
    
    // Map trips to match expected format by the TripCard component
    const formattedTrips = allTrips.map(trip => ({
      ...trip,
      title: trip.name,
      members: 1, // Default value, ideally we'd count from trip_members
      description: trip.destination_name ? `Trip to ${trip.destination_name}` : undefined,
      cover_image: trip.cover_image_url || null
    }))
    
    console.log(`[API /trips] Found ${formattedTrips.length} trips for user ${user.id}`)

    return NextResponse.json({ trips: formattedTrips || [] })
  } catch (error) {
    console.error("Error fetching trips:", error)
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient()

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
    
    // Also add the creator as a member with 'owner' role
    const tripId = data[0].id
    const { error: memberError } = await supabase.from("trip_members").insert({
      trip_id: tripId,
      user_id: user.id,
      role: "owner"
    })
    
    if (memberError) {
      console.error("Error adding creator as trip member:", memberError)
      // Continue anyway as the trip was created successfully
    }

    return NextResponse.json({ trip: data[0] })
  } catch (error) {
    console.error("Error creating trip:", error)
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 })
  }
}
