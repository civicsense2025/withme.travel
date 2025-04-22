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

    const cookieStore = cookies()
    const supabase = createClient()

    // Search for destinations that match the query in city, state_province, or country
    const { data: destinations, error } = await supabase
      .from(DB_TABLES.DESTINATIONS)
      .select("*")
      .or(
        `${DB_FIELDS.DESTINATIONS.CITY}.ilike.%${query}%,` +
        `state_province.ilike.%${query}%,` +
        `${DB_FIELDS.DESTINATIONS.COUNTRY}.ilike.%${query}%`
      )
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
