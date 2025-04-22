import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// GET /api/likes?type=destination
// Gets all likes for the current user, optionally filtered by type
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const type = request.nextUrl.searchParams.get("type")
    const query = supabase
      .from("likes")
      .select("*, destinations(*), itineraries(*)")
      .eq("user_id", session.user.id)
    
    // Add type filter if provided
    if (type) {
      query.eq("item_type", type)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching likes:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ likes: data })
  } catch (error: any) {
    console.error("Exception fetching likes:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/likes
// Creates a new like for the current user
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { item_id, item_type } = await request.json()

    if (!item_id || !item_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate item type
    if (!['destination', 'itinerary', 'attraction'].includes(item_type)) {
      return NextResponse.json({ error: "Invalid item type" }, { status: 400 })
    }

    // Check if the item exists based on type
    let itemExists = false
    if (item_type === 'destination') {
      const { count } = await supabase
        .from('destinations')
        .select('*', { count: 'exact', head: true })
        .eq('id', item_id)
      
      itemExists = count ? count > 0 : false
    } else if (item_type === 'itinerary') {
      const { count } = await supabase
        .from('itineraries')
        .select('*', { count: 'exact', head: true })
        .eq('id', item_id)
      
      itemExists = count ? count > 0 : false
    } else if (item_type === 'attraction') {
      const { count } = await supabase
        .from('attractions')
        .select('*', { count: 'exact', head: true })
        .eq('id', item_id)
      
      itemExists = count ? count > 0 : false
    }

    if (!itemExists) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Add the like
    const { data, error } = await supabase
      .from("likes")
      .insert({
        user_id: session.user.id,
        item_id,
        item_type
      })
      .select()
      .single()

    if (error) {
      // Check if it's a unique constraint violation (already liked)
      if (error.code === '23505') {
        return NextResponse.json({ error: "Already liked" }, { status: 409 })
      }
      
      console.error("Error creating like:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ like: data })
  } catch (error: any) {
    console.error("Exception creating like:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/likes?item_id=123&item_type=destination
// Deletes a like for the current user
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const item_id = request.nextUrl.searchParams.get("item_id")
    const item_type = request.nextUrl.searchParams.get("item_type")

    if (!item_id || !item_type) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Delete the like
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", session.user.id)
      .eq("item_id", item_id)
      .eq("item_type", item_type)

    if (error) {
      console.error("Error deleting like:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Exception deleting like:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 