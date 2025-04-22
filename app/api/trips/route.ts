import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

// Define interfaces for better type safety
interface TripMemberEntry {
  trip: {
    id: string;
    name: string;
    destination_name?: string;
    cover_image_url?: string;
    member_count?: { count: number }[]; // Type for the nested count
    [key: string]: any; // Allow other trip properties
  } | null; // Trip can potentially be null if join fails unexpectedly
}

interface FormattedTrip {
  id: string;
  name: string;
  title: string;
  members: number;
  description?: string;
  cover_image?: string | null;
  [key: string]: any; // Allow other trip properties
}

export async function GET(request: NextRequest) {
  const supabase = createClient()
  
  // Parse query parameters
  const searchParams = request.nextUrl.searchParams
  const limitParam = searchParams.get('limit')
  const sortParam = searchParams.get('sort')
  
  // Default values if not provided
  const limit = limitParam ? parseInt(limitParam, 10) : undefined
  const sort = sortParam || 'newest'

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[API /trips] Unauthorized request - no user found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log(`[API /trips] Fetching trips for user ${user.id} with limit: ${limit}, sort: ${sort}`)

    // Build a single efficient query - more similar to admin dashboard approach
    let query = supabase
      .from("trips")
      .select(`
        *,
        trip_members!inner(user_id, role),
        trip_members_count:trip_members(count)
      `)
      .eq("trip_members.user_id", user.id)
    
    // Apply sorting
    if (sort === 'oldest') {
      query = query.order("created_at", { ascending: true })
    } else if (sort === 'name') {
      query = query.order("name", { ascending: true })
    } else {
      // Default to newest first
      query = query.order("created_at", { ascending: false })
    }
    
    const { data: trips, error: tripsError } = await query
    
    if (tripsError) {
      console.error("[API /trips] Error fetching trips data:", tripsError)
      throw tripsError
    }

    console.log("[API /trips] Raw trips data:", trips)

    // Format the trips for the frontend
    const formattedTrips = trips.map(trip => {
      // Get member count from the count query
      const memberCount = trip.trip_members_count[0]?.count || 1;
      
      // Create a copy without the nested arrays
      const tripCopy = { ...trip };
      delete tripCopy.trip_members;
      delete tripCopy.trip_members_count;
      
      // Create a formatted trip object with the needed API fields
      return {
        ...tripCopy,
        members: memberCount,
        title: trip.name,
        description: trip.destination_name ? `Trip to ${trip.destination_name}` : undefined,
        cover_image: trip.cover_image_url || null,
      };
    });
    
    // Apply limit if specified
    let resultTrips = formattedTrips;
    if (limit && limit > 0 && limit < resultTrips.length) {
      resultTrips = resultTrips.slice(0, limit);
    }
    
    console.log(`[API /trips] Found ${resultTrips.length} formatted trips for user ${user.id}`)
    console.log("[API /trips] Final trips being returned:", resultTrips)

    return NextResponse.json({ 
      trips: resultTrips,
      totalCount: formattedTrips.length,
      limit: limit
    })
  } catch (error) {
    console.error("[API /trips] Error fetching trips:", error)
    return NextResponse.json(
      { error: "Failed to fetch trips", message: error instanceof Error ? error.message : "Unknown error" }, 
      { status: 500 }
    )
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
