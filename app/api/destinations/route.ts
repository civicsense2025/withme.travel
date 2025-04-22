import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const trending = searchParams.get("trending") === "true"
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined

    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Build the query
    let query = supabase.from("destinations").select("*").order("popularity", { ascending: false })

    // Apply limit if specified
    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching destinations:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Add traveler counts for trending destinations
    // This is just for display purposes until we have real data
    if (trending) {
      const travelersMap: Record<string, number> = {
        Barcelona: 4800,
        Tokyo: 3200,
        California: 2900,
        Paris: 4200,
        "New York": 3800,
        London: 3500,
        Bangkok: 2800,
        Rome: 3100,
        Sydney: 2600,
        Amsterdam: 2400,
      }

      const avgDaysMap: Record<string, number> = {
        Barcelona: 5,
        Tokyo: 7,
        California: 10,
        Paris: 4,
        "New York": 6,
        London: 5,
        Bangkok: 8,
        Rome: 4,
        Sydney: 9,
        Amsterdam: 4,
      }

      data.forEach((destination) => {
        // Use the mapping if available, otherwise generate a random number
        destination.travelers_count = travelersMap[destination.city] || Math.floor(Math.random() * 3000) + 1000

        destination.avg_days = avgDaysMap[destination.city] || Math.floor(Math.random() * 7) + 3
      })
    }

    return NextResponse.json({ destinations: data })
  } catch (error: any) {
    console.error("Unexpected error in destinations fetch:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
