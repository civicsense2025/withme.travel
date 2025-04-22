import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

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

    // Get expenses
    const { data: expenses, error } = await supabase
      .from("expenses")
      .select(`
        *,
        paid_by_user:paid_by(id, name, email, avatar_url)
      `)
      .eq("trip_id", params.id)
      .order("date", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get expense categories
    const { data: categories, error: categoryError } = await supabase
      .from("expenses")
      .select("category, amount")
      .eq("trip_id", params.id)

    if (categoryError) {
      return NextResponse.json({ error: categoryError.message }, { status: 500 })
    }

    // Group by category and sum amounts
    const categoryMap = categories.reduce(
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

    // Calculate total spent
    const totalSpent = Object.values(categoryMap).reduce((sum, amount) => sum + amount, 0)

    // Get trip budget
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("total_budget")
      .eq("id", params.id)
      .single()

    if (tripError) {
      return NextResponse.json({ error: tripError.message }, { status: 500 })
    }

    const totalBudget = Number(trip.total_budget) || 0
    const remaining = totalBudget - totalSpent

    // Format categories
    const formattedCategories = Object.entries(categoryMap).map(([name, amount]) => ({
      name,
      amount,
      color: getCategoryColor(name),
    }))

    return NextResponse.json({
      expenses,
      budget: {
        total: totalBudget,
        spent: totalSpent,
        remaining,
        categories: formattedCategories,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

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

    // Get expense data from request
    const expenseData = await request.json()

    // Insert expense into database
    const { data, error } = await supabase
      .from("expenses")
      .insert([
        {
          ...expenseData,
          trip_id: params.id,
        },
      ])
      .select(`
        *,
        paid_by_user:paid_by(id, name, email, avatar_url)
      `)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ expense: data[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
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
