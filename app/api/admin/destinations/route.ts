import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

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

    // Get all destinations
    const { data: destinations, error } = await supabase
      .from("destinations")
      .select("*")
      .order("popularity", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ destinations })
  } catch (error) {
    console.error("Error fetching destinations:", error)
    return NextResponse.json({ error: "Failed to fetch destinations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

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

    // Get destination data from request
    const destinationData = await request.json()

    // Create destination
    const { data, error } = await supabase
      .from("destinations")
      .insert({
        name: destinationData.name,
        city: destinationData.city,
        country: destinationData.country,
        continent: destinationData.continent,
        description: destinationData.description || null,
        image_url: destinationData.image_url || null,
        popularity: 0,
      })
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({ destination: data[0] })
  } catch (error) {
    console.error("Error creating destination:", error)
    return NextResponse.json({ error: "Failed to create destination" }, { status: 500 })
  }
}
