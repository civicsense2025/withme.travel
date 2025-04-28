// Server-side database functions that were previously in lib/db.ts
// These functions use the createClient from @/utils/supabase/server and should only be used in API routes

import { createServerClient } from "@/utils/supabase/server";
// import { cookies } from "next/headers" // No longer needed directly

export async function getTrips() {
  // const cookieStore = cookies() // Handled by createClient
  const supabase = createClient() // Corrected
  const { data, error } = await supabase
    .from("trips")
    .select("*, trip_members(count)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching trips:", error)
    return []
  }

  return data.map((trip) => ({
    ...trip,
    members: trip.trip_members[0]?.count || 0,
  }))
}

export async function getTripById(id: string) {
  // const cookieStore = cookies() // Handled by createClient
  const supabase = createClient() // Corrected
  const { data, error } = await supabase
    .from("trips")
    .select(`
      *,
      trip_members(count),
      created_by(id, name, email, avatar_url)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching trip:", error)
    return null
  }

  return {
    ...data,
    members: data.trip_members[0]?.count || 0,
  }
}

export async function getTripMembers(tripId: string) {
  // const cookieStore = cookies() // Handled by createClient
  const supabase = createClient() // Corrected
  const { data, error } = await supabase
    .from("trip_members")
    .select(`
      *,
      user:user_id(id, name, email, avatar_url)
    `)
    .eq("trip_id", tripId)

  if (error) {
    console.error("Error fetching trip members:", error)
    return []
  }

  return data
}

export async function getItineraryItems(tripId: string, userId?: string) {
  // const cookieStore = cookies() // Handled by createClient
  const supabase = createClient() // Corrected

  // First get the itinerary items
  const { data: items, error } = await supabase
    .from("itinerary_items")
    .select("*")
    .eq("trip_id", tripId)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })

  if (error) {
    console.error("Error fetching itinerary items:", error)
    return []
  }

  // If we have a userId, get the votes for this user
  if (userId) {
    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("itinerary_item_id, vote_type")
      .eq("user_id", userId)
      .in(
        "itinerary_item_id",
        items.map((item) => item.id),
      )

    if (!votesError && votes) {
      // Create a map of item_id to vote_type
      const voteMap = votes.reduce(
        (acc: Record<string, string>, vote) => { // Added type annotation for acc
          acc[vote.itinerary_item_id] = vote.vote_type
          return acc
        },
        {} as Record<string, string>,
      )

      // Add user_vote to each item
      items.forEach((item: any) => { // Added type annotation for item
        item.user_vote = (voteMap[item.id] as "up" | "down" | null) || null
      })
    }
  }

  // Get vote counts for each item
  const { data: voteCounts, error: countError } = await supabase
    .from("votes")
    .select("itinerary_item_id, vote_type")
    .in(
      "itinerary_item_id",
      items.map((item) => item.id),
    )

  if (!countError && voteCounts) {
    // Calculate net votes for each item
    const voteCountMap = voteCounts.reduce(
      (acc: Record<string, number>, vote) => { // Added type annotation for acc
        if (!acc[vote.itinerary_item_id]) {
          acc[vote.itinerary_item_id] = 0
        }
        acc[vote.itinerary_item_id] += vote.vote_type === "up" ? 1 : -1
        return acc
      },
      {} as Record<string, number>,
    )

    // Add votes to each item
    items.forEach((item: any) => { // Added type annotation for item
      item.votes = voteCountMap[item.id] || 0
    })
  }

  return items
}

export async function getExpenses(tripId: string) {
  // const cookieStore = cookies() // Handled by createClient
  const supabase = createClient() // Corrected
  const { data, error } = await supabase
    .from("expenses")
    .select(`
      *,
      paid_by_user:paid_by(id, name, email, avatar_url)
    `)
    .eq("trip_id", tripId)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching expenses:", error)
    return []
  }

  return data
}

export async function getExpensesByCategory(tripId: string) {
  // const cookieStore = cookies() // Handled by createClient
  const supabase = createClient() // Corrected
  const { data, error } = await supabase.from("expenses").select("category, amount").eq("trip_id", tripId)

  if (error) {
    console.error("Error fetching expenses by category:", error)
    return []
  }

  // Group by category and sum amounts
  const categories = data.reduce(
    (acc: Record<string, number>, expense) => { // Added type annotation for acc
      const category = expense.category || "Other"
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += Number(expense.amount)
      return acc
    },
    {} as Record<string, number>,
  )

  // Convert to array format
  return Object.entries(categories).map(([name, amount]) => ({
    name,
    amount,
    color: getCategoryColor(name),
  }))
}

// Helper function
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Accommodation: "bg-blue-500",
    "Food & Dining": "bg-green-500",
    Activities: "bg-yellow-500",
    Transportation: "bg-purple-500",
    Shopping: "bg-pink-500",
    Other: "bg-gray-500",
  }

  return colors[category] || colors.Other
}

// New function to handle voting on itinerary items
export async function voteForItem(itemId: string, userId: string, voteType: "up" | "down" | null) {
  const supabase = createClient();

  if (!userId) {
    throw new Error("User must be logged in to vote.");
  }

  if (voteType === null) {
    // Remove existing vote
    const { error } = await supabase
      .from('votes')
      .delete()
      .match({ itinerary_item_id: itemId, user_id: userId });

    if (error) {
      console.error("Error removing vote:", error);
      throw new Error("Failed to remove vote.");
    }
  } else {
    // Upsert vote (add or update)
    const { error } = await supabase
      .from('votes')
      .upsert({
        itinerary_item_id: itemId,
        user_id: userId,
        vote_type: voteType
      }, {
        onConflict: 'itinerary_item_id, user_id' // Specify conflict columns
      });

    if (error) {
      console.error("Error casting vote:", error);
      throw new Error("Failed to cast vote.");
    }
  }

  // Optionally, fetch and return the updated vote count for the item
  const { data: counts, error: countError } = await supabase
    .from('votes')
    .select('vote_type')
    .eq('itinerary_item_id', itemId);

  if (countError) {
    console.error("Error fetching updated vote counts:", countError);
    // Don't throw error here, just return 0 maybe?
    return { newVoteCount: 0 }; 
  }

  const newVoteCount = counts.reduce((acc, vote) => {
    return acc + (vote.vote_type === 'up' ? 1 : -1);
  }, 0);

  return { newVoteCount };
}
