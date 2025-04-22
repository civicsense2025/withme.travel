import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json({ destinations: [] })
    }

    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Search for destinations that match the query in city, state_province, or country
    const { data: destinations, error } = await supabase
      .from("destinations")
      .select("*")
      .or(`city.ilike.%${query}%,state_province.ilike.%${query}%,country.ilike.%${query}%`)
      .order("popularity", { ascending: false })
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
