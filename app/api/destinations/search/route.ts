import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { DB_TABLES, DB_FIELDS } from "@/utils/constants"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json({ destinations: [] })
    }

    // const cookieStore = cookies() // Not needed for server client with env vars
    const supabase = createClient()

    // If query contains commas, handle it as a specific search (like "Washington, United States")
    // This likely happens after a user has already selected a location
    if (query.includes(",")) {
      // Already found destination, so just return an empty array - no search needed
      // The LocationSearch component has already called onLocationSelect with the destination object
      console.log("Search query contains comma, likely from a selected location:", query);
      return NextResponse.json({ destinations: [] });
    }

    // Escape special characters for ilike
    const safeQuery = query.replace(/[%_]/g, '\\$&'); // Escape % and _ for LIKE/ILIKE
    
    // Build the OR condition string ONLY using valid fields (city, country)
    const orCondition = `${DB_FIELDS.DESTINATIONS.CITY}.ilike.%${safeQuery}%,${DB_FIELDS.DESTINATIONS.COUNTRY}.ilike.%${safeQuery}%`;
    console.log("Safe query:", safeQuery, "OR condition:", orCondition);

    // Search for destinations that match the query in city or country
    const { data: destinations, error } = await supabase
      .from(DB_TABLES.DESTINATIONS)
      .select("*")
      .or(orCondition) // Apply the correctly formatted OR condition
      .order(DB_FIELDS.DESTINATIONS.POPULARITY, { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error searching destinations:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log the results for debugging
    console.log(`Search for "${query}" returned ${destinations?.length || 0} results:`, destinations)

    return NextResponse.json({ destinations: destinations || [] })
  } catch (error: any) {
    console.error("Error in destination search:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
