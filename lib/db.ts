// Remove the import of createServerClient from server.ts
// import { createServerClient } from "./supabase/server"
import { supabase as supabaseClient } from "./supabase/client"

// Types based on our database schema
export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at?: string
}

export interface Trip {
  id: string
  title: string
  description?: string
  start_date?: string
  end_date?: string
  cover_image?: string
  total_budget?: number
  created_at?: string
  created_by?: string
}

export interface TripMember {
  id: string
  trip_id: string
  user_id: string
  role: string
  created_at?: string
  user?: User
}

export interface ItineraryItem {
  id: string
  trip_id: string
  title: string
  type?: string
  date?: string
  start_time?: string
  end_time?: string
  location?: string
  place_id?: string
  latitude?: number
  longitude?: number
  cost?: number
  notes?: string
  created_at?: string
  created_by?: string
  votes?: number
  user_vote?: "up" | "down" | null
}

export interface Expense {
  id: string
  trip_id: string
  title: string
  amount: number
  category?: string
  date?: string
  paid_by?: string
  created_at?: string
  paid_by_user?: User
}

export interface Vote {
  id: string
  itinerary_item_id: string
  user_id: string
  vote_type: "up" | "down"
  created_at?: string
}

// Client-side database functions only
// Server-side functions have been moved to separate files in app/api

// Client-side database functions
export async function createTrip(tripData: Partial<Trip>, userId: string) {
  const { data, error } = await supabaseClient
    .from("trips")
    .insert([
      {
        ...tripData,
        created_by: userId,
      },
    ])
    .select()

  if (error) {
    console.error("Error creating trip:", error)
    throw error
  }

  // Add the creator as a member with 'organizer' role
  if (data && data[0]) {
    const { error: memberError } = await supabaseClient.from("trip_members").insert([
      {
        trip_id: data[0].id,
        user_id: userId,
        role: "organizer",
      },
    ])

    if (memberError) {
      console.error("Error adding trip member:", memberError)
    }
  }

  return data?.[0]
}

export async function addItineraryItem(itemData: Partial<ItineraryItem>, userId: string) {
  const { data, error } = await supabaseClient
    .from("itinerary_items")
    .insert([
      {
        ...itemData,
        created_by: userId,
      },
    ])
    .select()

  if (error) {
    console.error("Error adding itinerary item:", error)
    throw error
  }

  return data?.[0]
}

export async function voteForItem(itemId: string, userId: string, voteType: "up" | "down") {
  // Check if user already voted
  const { data: existingVote, error: checkError } = await supabaseClient
    .from("votes")
    .select("id, vote_type")
    .eq("itinerary_item_id", itemId)
    .eq("user_id", userId)
    .maybeSingle()

  if (checkError) {
    console.error("Error checking existing vote:", checkError)
    throw checkError
  }

  // If vote exists and is the same type, delete it (toggle off)
  if (existingVote && existingVote.vote_type === voteType) {
    const { error: deleteError } = await supabaseClient.from("votes").delete().eq("id", existingVote.id)

    if (deleteError) {
      console.error("Error deleting vote:", deleteError)
      throw deleteError
    }

    return null
  }
  // If vote exists but different type, update it
  else if (existingVote) {
    const { data, error: updateError } = await supabaseClient
      .from("votes")
      .update({ vote_type: voteType })
      .eq("id", existingVote.id)
      .select()

    if (updateError) {
      console.error("Error updating vote:", updateError)
      throw updateError
    }

    return data?.[0]
  }
  // If no vote exists, create new one
  else {
    const { data, error: insertError } = await supabaseClient
      .from("votes")
      .insert([
        {
          itinerary_item_id: itemId,
          user_id: userId,
          vote_type: voteType,
        },
      ])
      .select()

    if (insertError) {
      console.error("Error inserting vote:", insertError)
      throw insertError
    }

    return data?.[0]
  }
}

export async function addExpense(expenseData: Partial<Expense>) {
  const { data, error } = await supabaseClient.from("expenses").insert([expenseData]).select()

  if (error) {
    console.error("Error adding expense:", error)
    throw error
  }

  return data?.[0]
}

export async function addTripMember(tripId: string, userData: Partial<User>, role = "member") {
  // First check if user exists
  const { data: existingUser, error: userError } = await supabaseClient
    .from("users")
    .select("id")
    .eq("email", userData.email)
    .maybeSingle()

  let userId: string

  // If user doesn't exist, create them
  if (!existingUser) {
    const { data: newUser, error: createError } = await supabaseClient.from("users").insert([userData]).select()

    if (createError) {
      console.error("Error creating user:", createError)
      throw createError
    }

    userId = newUser?.[0].id
  } else {
    userId = existingUser.id
  }

  // Add user as trip member
  const { data, error } = await supabaseClient
    .from("trip_members")
    .insert([
      {
        trip_id: tripId,
        user_id: userId,
        role,
      },
    ])
    .select()

  if (error) {
    console.error("Error adding trip member:", error)
    throw error
  }

  return data?.[0]
}

// Helper functions
export function getCategoryColor(category: string): string {
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

export async function getExpenses(tripId: string) {
  const { data, error } = await supabaseClient
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
  const { data, error } = await supabaseClient.from("expenses").select("category, amount").eq("trip_id", tripId)

  if (error) {
    console.error("Error fetching expenses by category:", error)
    return []
  }

  // Group by category and sum amounts
  const categories = data.reduce(
    (acc, expense) => {
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

export async function getTripMembers(tripId: string) {
  const { data, error } = await supabaseClient
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
  const { data, error } = await supabaseClient
    .from("itinerary_items")
    .select("*")
    .eq("trip_id", tripId)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })

  if (error) {
    console.error("Error fetching itinerary items:", error)
    return []
  }

  return data
}
