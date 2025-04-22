import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a member of this trip
    const { data: member, error: memberError } = await supabase
      .from("trip_members")
      .select()
      .eq("trip_id", params.id)
      .eq("user_id", session.user.id)
      .maybeSingle()

    if (memberError || !member) {
      return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 })
    }

    // Get itinerary items
    const { data: items, error } = await supabase
      .from("itinerary_items")
      .select("*")
      .eq("trip_id", params.id)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get votes for this user
    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("itinerary_item_id, vote_type")
      .eq("user_id", session.user.id)
      .in(
        "itinerary_item_id",
        items.map((item) => item.id),
      )

    if (votesError) {
      return NextResponse.json({ error: votesError.message }, { status: 500 })
    }

    // Create a map of item_id to vote_type
    const voteMap = votes.reduce(
      (acc, vote) => {
        acc[vote.itinerary_item_id] = vote.vote_type
        return acc
      },
      {} as Record<string, string>,
    )

    // Get vote counts for each item
    const { data: voteCounts, error: countError } = await supabase
      .from("votes")
      .select("itinerary_item_id, vote_type")
      .in(
        "itinerary_item_id",
        items.map((item) => item.id),
      )

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    // Calculate net votes for each item
    const voteCountMap = voteCounts.reduce(
      (acc, vote) => {
        if (!acc[vote.itinerary_item_id]) {
          acc[vote.itinerary_item_id] = 0
        }
        acc[vote.itinerary_item_id] += vote.vote_type === "up" ? 1 : -1
        return acc
      },
      {} as Record<string, number>,
    )

    // Add user_vote and votes to each item
    const itemsWithVotes = items.map((item) => ({
      ...item,
      user_vote: voteMap[item.id] || null,
      votes: voteCountMap[item.id] || 0,
    }))

    return NextResponse.json({ items: itemsWithVotes })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a member of this trip
    const { data: member, error: memberError } = await supabase
      .from("trip_members")
      .select()
      .eq("trip_id", params.id)
      .eq("user_id", session.user.id)
      .maybeSingle()

    if (memberError || !member) {
      return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 })
    }

    // Get item data from request
    const itemData = await request.json()

    // Insert item into database
    const { data, error } = await supabase
      .from("itinerary_items")
      .insert([
        {
          ...itemData,
          trip_id: params.id,
          created_by: session.user.id,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ item: data[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
