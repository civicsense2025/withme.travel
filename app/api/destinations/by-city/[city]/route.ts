import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request, { params }: { params: Promise<{ city: string }> }) {
  try {
    const unwrappedParams = await params
    const cityName = decodeURIComponent(unwrappedParams.city.replace(/-/g, " "))
    
    const supabase = createClient()

    // Search for the destination by city name (case insensitive)
    // Remove .single() to handle multiple or zero results
    const { data, error } = await supabase.from("destinations").select("*").ilike("city", cityName)

    if (error) {
      console.error("Error fetching destination:", error)
      return NextResponse.json({ error: "Error fetching destination" }, { status: 500 })
    }

    // Handle case where no destinations are found
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 })
    }

    // Process image URLs to ensure they're properly formatted
    const destination = data[0]

    // If image_url doesn't start with http or /, add the / prefix
    if (destination.image_url && !destination.image_url.startsWith("http") && !destination.image_url.startsWith("/")) {
      destination.image_url = `/${destination.image_url}`
    }

    // Return the first match if multiple are found
    // This ensures backward compatibility with code expecting a single destination
    return NextResponse.json({ destination, allMatches: data })
  } catch (error: any) {
    console.error("Unexpected error in destination fetch:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
