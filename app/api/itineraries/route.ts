import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { DB_TABLES, DB_FIELDS } from "@/utils/constants"; // Import constants

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const destinationId = searchParams.get("destination_id")
  const duration = searchParams.get("duration")
  const category = searchParams.get("category")
  const isPublicParam = searchParams.get("is_public")
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "9")
  const offset = (page - 1) * limit

  const supabase = createClient()

  let query = supabase
    .from(DB_TABLES.ITINERARY_TEMPLATES)
    .select("*, destinations(*), users(id, full_name, avatar_url)", { count: "exact" })

  if (destinationId) {
    query = query.eq(DB_FIELDS.ITINERARY_TEMPLATES.DESTINATION_ID, destinationId)
  }

  if (duration) {
    query = query.eq(DB_FIELDS.ITINERARY_TEMPLATES.DURATION_DAYS, duration)
  }

  if (category) {
    query = query.eq(DB_FIELDS.ITINERARY_TEMPLATES.CATEGORY, category)
  }

  if (isPublicParam === "true") {
    query = query.eq(DB_FIELDS.ITINERARY_TEMPLATES.IS_PUBLISHED, true)
  } else if (isPublicParam === "false") {
    // Optionally handle fetching non-public? Requires auth check.
    // For now, we assume the builder only asks for public=true
  }

  const { data, error, count } = await query
    .order(DB_FIELDS.ITINERARY_TEMPLATES.CREATED_AT, { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    itineraries: data,
    meta: {
      total: count || 0,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0,
    },
  })
}

export async function POST(request: Request) {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["title", "description", "destination_id", "duration_days", "category", "days"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Create the itinerary template
    const { data, error } = await supabase
      .from("itinerary_templates")
      .insert({
        title: body.title,
        description: body.description,
        destination_id: body.destination_id,
        duration_days: body.duration_days,
        category: body.category,
        days: body.days,
        created_by: user.id,
        is_published: false, // Requires admin approval
        slug: body.title
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-"),
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data[0] })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
