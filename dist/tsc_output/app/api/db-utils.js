// Server-side database functions that were previously in lib/db.ts
// These functions use the createClient from @/utils/supabase/server and should only be used in API routes
import { createClient } from "@/utils/supabase/server";
// import { cookies } from "next/headers" // No longer needed directly
export async function getTrips() {
    // const cookieStore = cookies() // Handled by createClient
    const supabase = createClient(); // Corrected
    const { data, error } = await supabase
        .from("trips")
        .select("*, trip_members(count)")
        .order("created_at", { ascending: false });
    if (error) {
        console.error("Error fetching trips:", error);
        return [];
    }
    return data.map((trip) => {
        var _a;
        return (Object.assign(Object.assign({}, trip), { members: ((_a = trip.trip_members[0]) === null || _a === void 0 ? void 0 : _a.count) || 0 }));
    });
}
export async function getTripById(id) {
    var _a;
    // const cookieStore = cookies() // Handled by createClient
    const supabase = createClient(); // Corrected
    const { data, error } = await supabase
        .from("trips")
        .select(`
      *,
      trip_members(count),
      created_by(id, name, email, avatar_url)
    `)
        .eq("id", id)
        .single();
    if (error) {
        console.error("Error fetching trip:", error);
        return null;
    }
    return Object.assign(Object.assign({}, data), { members: ((_a = data.trip_members[0]) === null || _a === void 0 ? void 0 : _a.count) || 0 });
}
export async function getTripMembers(tripId) {
    // const cookieStore = cookies() // Handled by createClient
    const supabase = createClient(); // Corrected
    const { data, error } = await supabase
        .from("trip_members")
        .select(`
      *,
      user:user_id(id, name, email, avatar_url)
    `)
        .eq("trip_id", tripId);
    if (error) {
        console.error("Error fetching trip members:", error);
        return [];
    }
    return data;
}
export async function getItineraryItems(tripId, userId) {
    // const cookieStore = cookies() // Handled by createClient
    const supabase = createClient(); // Corrected
    // First get the itinerary items
    const { data: items, error } = await supabase
        .from("itinerary_items")
        .select("*")
        .eq("trip_id", tripId)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });
    if (error) {
        console.error("Error fetching itinerary items:", error);
        return [];
    }
    // If we have a userId, get the votes for this user
    if (userId) {
        const { data: votes, error: votesError } = await supabase
            .from("votes")
            .select("itinerary_item_id, vote_type")
            .eq("user_id", userId)
            .in("itinerary_item_id", items.map((item) => item.id));
        if (!votesError && votes) {
            // Create a map of item_id to vote_type
            const voteMap = votes.reduce((acc, vote) => {
                acc[vote.itinerary_item_id] = vote.vote_type;
                return acc;
            }, {});
            // Add user_vote to each item
            items.forEach((item) => {
                item.user_vote = voteMap[item.id] || null;
            });
        }
    }
    // Get vote counts for each item
    const { data: voteCounts, error: countError } = await supabase
        .from("votes")
        .select("itinerary_item_id, vote_type")
        .in("itinerary_item_id", items.map((item) => item.id));
    if (!countError && voteCounts) {
        // Calculate net votes for each item
        const voteCountMap = voteCounts.reduce((acc, vote) => {
            if (!acc[vote.itinerary_item_id]) {
                acc[vote.itinerary_item_id] = 0;
            }
            acc[vote.itinerary_item_id] += vote.vote_type === "up" ? 1 : -1;
            return acc;
        }, {});
        // Add votes to each item
        items.forEach((item) => {
            item.votes = voteCountMap[item.id] || 0;
        });
    }
    return items;
}
export async function getExpenses(tripId) {
    // const cookieStore = cookies() // Handled by createClient
    const supabase = createClient(); // Corrected
    const { data, error } = await supabase
        .from("expenses")
        .select(`
      *,
      paid_by_user:paid_by(id, name, email, avatar_url)
    `)
        .eq("trip_id", tripId)
        .order("date", { ascending: false });
    if (error) {
        console.error("Error fetching expenses:", error);
        return [];
    }
    return data;
}
export async function getExpensesByCategory(tripId) {
    // const cookieStore = cookies() // Handled by createClient
    const supabase = createClient(); // Corrected
    const { data, error } = await supabase.from("expenses").select("category, amount").eq("trip_id", tripId);
    if (error) {
        console.error("Error fetching expenses by category:", error);
        return [];
    }
    // Group by category and sum amounts
    const categories = data.reduce((acc, expense) => {
        const category = expense.category || "Other";
        if (!acc[category]) {
            acc[category] = 0;
        }
        acc[category] += Number(expense.amount);
        return acc;
    }, {});
    // Convert to array format
    return Object.entries(categories).map(([name, amount]) => ({
        name,
        amount,
        color: getCategoryColor(name),
    }));
}
// Helper function
function getCategoryColor(category) {
    const colors = {
        Accommodation: "bg-blue-500",
        "Food & Dining": "bg-green-500",
        Activities: "bg-yellow-500",
        Transportation: "bg-purple-500",
        Shopping: "bg-pink-500",
        Other: "bg-gray-500",
    };
    return colors[category] || colors.Other;
}
