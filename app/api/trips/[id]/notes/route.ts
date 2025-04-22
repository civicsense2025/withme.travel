import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const tripId = params.id
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user has access to this trip
  const { data: membership } = await supabase
    .from("trip_members")
    .select("role")
    .eq("trip_id", tripId)
    .eq("user_id", session.user.id)
    .single()

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Get trip notes
  const { data: notes, error } = await supabase.from("trip_notes").select("content").eq("trip_id", tripId).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ content: notes?.content || "" })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const tripId = params.id
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user has access to this trip
  const { data: membership } = await supabase
    .from("trip_members")
    .select("role")
    .eq("trip_id", tripId)
    .eq("user_id", session.user.id)
    .single()

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Get request body
  const { content } = await request.json()

  // Upsert trip notes
  const { error } = await supabase.from("trip_notes").upsert(
    {
      trip_id: tripId,
      content,
      updated_by: session.user.id,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "trip_id",
    },
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
