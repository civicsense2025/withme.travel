import { createApiClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server"
import { DB_TABLES, DB_FIELDS } from "@/utils/constants"; // Keep DB_TABLES import

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const destinationId = searchParams.get("destination_id")
    const query = searchParams.get("query")
    const type = searchParams.get("type")

    if (!destinationId) {
      return new NextResponse("Destination ID is required", { status: 400 })
    }

    const supabase = createClient()

    let placesQuery = supabase
      .from(DB_TABLES.PLACES)
      .select(`*`) // Select only columns from the places table
      .eq("destination_id", destinationId) 
      .order("rating", { ascending: false })

    if (query) {
      placesQuery = placesQuery.ilike("name", `%${query}%`)
    }

    if (type) {
      placesQuery = placesQuery.eq("place_type", type)
    }

    const { data: places, error } = await placesQuery

    if (error) {
      console.error("Error fetching places:", error)
      return new NextResponse(
         `Failed to fetch places: ${error.message || 'Unknown database error'}`,
         { status: 500 }
      )
    }

    // Process the places data directly from the places table columns
    const processedPlaces = places.map((place) => ({
      ...place,
      rating: place.rating || 0, // Use direct rating column
      rating_count: place.rating_count || 0, // Use direct rating_count column
      // opening_hours: place.place_operating_hours?.reduce(...) // Remove this calculation
      // Remove nested data removal as it's not fetched anymore
      // place_reviews: undefined,
      // place_operating_hours: undefined,
    }))

    return NextResponse.json({ places: processedPlaces })
  } catch (error) {
    console.error("Error in places route:", error)
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return new NextResponse(errorMessage, { status: 500 })
  }
}

// POST /api/places - Add a new place suggestion
export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // 1. Check user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Parse request body
    const body = await request.json()
    const { 
      name, 
      description, 
      category, 
      address, 
      price_level, 
      destination_id 
    } = body;

    // 3. Validate required fields
    if (!name || !destination_id || !category) {
      return NextResponse.json(
        { error: "Missing required fields: name, destination_id, and category are required." },
        { status: 400 }
      )
    }

    // 4. Prepare data for insertion
    const placeToInsert = {
      name,
      description: description || null,
      category: category || 'other', // Default category if needed
      address: address || null,
      price_level: price_level || null,
      destination_id, // Link to the destination this was suggested for
      is_verified: false, // Mark as unverified suggestion
      suggested_by: user.id, // Record who suggested it
      source: 'user_suggestion', // Indicate source
      // Other fields like lat/lng could be null or geocoded later
      latitude: null,
      longitude: null,
      rating: null,
      rating_count: 0,
    }

    // 5. Insert into Supabase
    const { data: newPlace, error: insertError } = await supabase
      .from(DB_TABLES.PLACES)
      .insert(placeToInsert)
      .select()
      .single()

    if (insertError) {
      console.error("Error inserting suggested place:", insertError)
      return NextResponse.json(
        { error: insertError.message || "Failed to save suggestion." },
        { status: 500 }
      )
    }

    return NextResponse.json(newPlace, { status: 201 })

  } catch (error) {
    console.error("Error in POST /api/places route:", error)
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return new NextResponse(errorMessage, { status: 500 })
  }
} 