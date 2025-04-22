/**
 * This is a temporary placeholder for database functions.
 * These functions are implemented to provide types and minimal functionality
 * to prevent build errors, but should be replaced with real database interactions.
 */

import { supabase } from "@/utils/supabase/client";

// Type definitions
export interface Expense {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  paid_by: string;
  created_at: string;
  user?: {
    name: string;
    avatar_url?: string;
  };
}

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: string;
  status: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface ItineraryItem {
  id: string;
  trip_id: string;
  title: string;
  description?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  date?: string;
  category?: string;
  status?: string;
  created_by?: string;
  notes?: string[];
}

// Mock data and functions
const EXPENSE_CATEGORIES = [
  { name: "Accommodation", color: "bg-blue-500" },
  { name: "Food", color: "bg-green-500" },
  { name: "Transportation", color: "bg-yellow-500" },
  { name: "Activities", color: "bg-purple-500" },
  { name: "Shopping", color: "bg-pink-500" },
  { name: "Other", color: "bg-gray-500" },
];

/**
 * Get expenses for a trip
 */
export async function getExpenses(tripId: string): Promise<Expense[]> {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .select(`*, user:paid_by (name, avatar_url)`)
      .eq("trip_id", tripId)
      .order("date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
}

/**
 * Get expenses grouped by category
 */
export async function getExpensesByCategory(
  tripId: string
): Promise<{ name: string; amount: number; color: string }[]> {
  try {
    const expenses = await getExpenses(tripId);
    
    // Create a map of categories with amounts
    const categoryMap = new Map<string, number>();
    
    // Initialize categories with 0
    EXPENSE_CATEGORIES.forEach(cat => {
      categoryMap.set(cat.name, 0);
    });
    
    // Sum expenses by category
    expenses.forEach(expense => {
      const currentAmount = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, currentAmount + expense.amount);
    });
    
    // Convert to array with category info
    return Array.from(categoryMap.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        color: EXPENSE_CATEGORIES.find(c => c.name === name)?.color || "bg-gray-500"
      }))
      .filter(cat => cat.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  } catch (error) {
    console.error("Error fetching expenses by category:", error);
    return [];
  }
}

/**
 * Get trip members
 */
export async function getTripMembers(tripId: string): Promise<TripMember[]> {
  try {
    const { data, error } = await supabase
      .from("trip_members")
      .select(`*, user:user_id (id, name, email, avatar_url)`)
      .eq("trip_id", tripId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching trip members:", error);
    return [];
  }
}

/**
 * Add a new expense
 */
export async function addExpense(expenseData: {
  trip_id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  paid_by: string;
}): Promise<Expense | null> {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .insert(expenseData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding expense:", error);
    return null;
  }
}

/**
 * Get itinerary items for a trip
 */
export async function getItineraryItems(tripId: string): Promise<ItineraryItem[]> {
  try {
    const { data, error } = await supabase
      .from("itinerary_items")
      .select("*")
      .eq("trip_id", tripId)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching itinerary items:", error);
    return [];
  }
}

/**
 * Add an itinerary item
 */
export async function addItineraryItem(itemData: Partial<ItineraryItem>): Promise<ItineraryItem | null> {
  try {
    const { data, error } = await supabase
      .from("itinerary_items")
      .insert(itemData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding itinerary item:", error);
    return null;
  }
}

/**
 * Update an itinerary item
 */
export async function updateItineraryItem(
  itemId: string, 
  itemData: Partial<ItineraryItem>
): Promise<ItineraryItem | null> {
  try {
    const { data, error } = await supabase
      .from("itinerary_items")
      .update(itemData)
      .eq("id", itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating itinerary item:", error);
    return null;
  }
}

/**
 * Delete an itinerary item
 */
export async function deleteItineraryItem(itemId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("itinerary_items")
      .delete()
      .eq("id", itemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting itinerary item:", error);
    return false;
  }
}

/**
 * Vote for an itinerary item
 */
export async function voteForItem(itemId: string, userId: string): Promise<boolean> {
  try {
    // First check if the user has already voted
    const { data: existingVote, error: checkError } = await supabase
      .from("itinerary_votes")
      .select("id")
      .eq("item_id", itemId)
      .eq("user_id", userId)
      .single();
    
    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }
    
    // If vote exists, remove it (toggle behavior)
    if (existingVote) {
      const { error: deleteError } = await supabase
        .from("itinerary_votes")
        .delete()
        .eq("id", existingVote.id);
        
      if (deleteError) throw deleteError;
      return false; // Vote removed
    }
    
    // Otherwise add a new vote
    const { error: insertError } = await supabase
      .from("itinerary_votes")
      .insert({
        item_id: itemId,
        user_id: userId
      });
      
    if (insertError) throw insertError;
    return true; // Vote added
  } catch (error) {
    console.error("Error voting for item:", error);
    return false;
  }
} 