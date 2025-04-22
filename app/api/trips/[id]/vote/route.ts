import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

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

    // Get vote data from request
    const { itemId, voteType } = await request.json()

    if (!itemId || !voteType || (voteType !== "up" && voteType !== "down")) {
      return NextResponse.json({ error: "Invalid vote data" }, { status: 400 })
    }

    // Check if item belongs to this trip
    const { data: item, error: itemError } = await supabase
      .from("itinerary_items")
      .select()
      .eq("id", itemId)
      .eq("trip_id", params.id)
      .maybeSingle()

    if (itemError || !item) {
      return NextResponse.json({ error: "Item not found in this trip" }, { status: 404 })
    }

    // Check if user already voted
    const { data: existingVote, error: checkError } = await supabase
      .from("votes")
      .select("id, vote_type")
      .eq("itinerary_item_id", itemId)
      .eq("user_id", session.user.id)
      .maybeSingle()

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    let result

    // If vote exists and is the same type, delete it (toggle off)
    if (existingVote && existingVote.vote_type === voteType) {
      const { error: deleteError } = await supabase.from("votes").delete().eq("id", existingVote.id)

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }

      result = { action: "removed", voteType }
    }
    // If vote exists but different type, update it
    else if (existingVote) {
      const { data, error: updateError } = await supabase
        .from("votes")
        .update({ vote_type: voteType })
        .eq("id", existingVote.id)
        .select()

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      result = { action: "changed", voteType, vote: data?.[0] }
    }
    // If no vote exists, create new one
    else {
      const { data, error: insertError } = await supabase
        .from("votes")
        .insert([
          {
            itinerary_item_id: itemId,
            user_id: session.user.id,
            vote_type: voteType,
          },
        ])
        .select()

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      result = { action: "added", voteType, vote: data?.[0] }
    }

    // Get updated vote count
    const { data: votes, error: countError } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("itinerary_item_id", itemId)

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    // Calculate net votes
    const voteCount = votes.reduce((count, vote) => {
      return count + (vote.vote_type === "up" ? 1 : -1)
    }, 0)

    return NextResponse.json({
      ...result,
      voteCount,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
