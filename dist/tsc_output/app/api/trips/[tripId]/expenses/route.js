import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { getGroupExpenses } from "@/lib/services/splitwise";
export async function GET(request, { params }) {
    try {
        const supabase = createClient();
        // Check if user is authenticated
        const { data: { user }, } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Check if user is a member of this trip
        const { data: member, error: memberError } = await supabase
            .from("trip_members")
            .select()
            .eq("trip_id", params.tripId)
            .eq("user_id", user.id)
            .maybeSingle();
        if (memberError || !member) {
            return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 });
        }
        // Get trip data including Splitwise group ID
        const { data: trip, error: tripError } = await supabase
            .from("trips")
            .select("total_budget, splitwise_group_id")
            .eq("id", params.tripId)
            .single();
        if (tripError) {
            return NextResponse.json({ error: tripError.message }, { status: 500 });
        }
        // Get local expenses
        const { data: localExpenses, error } = await supabase
            .from("expenses")
            .select(`
        *,
        paid_by_user:paid_by(id, name, email, avatar_url)
      `)
            .eq("trip_id", params.tripId)
            .order("date", { ascending: false });
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        // Initialize expenses array with local expenses
        let allExpenses = localExpenses || [];
        // If trip is linked to Splitwise, fetch and merge Splitwise expenses
        if (trip.splitwise_group_id) {
            try {
                const splitwiseExpenses = await getGroupExpenses(user.id, trip.splitwise_group_id);
                // Format Splitwise expenses to match our schema
                const formattedSplitwiseExpenses = splitwiseExpenses.map(expense => {
                    var _a;
                    return ({
                        id: `splitwise_${expense.id}`,
                        description: expense.description,
                        amount: parseFloat(expense.cost),
                        currency: expense.currency_code,
                        date: expense.date,
                        category: ((_a = expense.category) === null || _a === void 0 ? void 0 : _a.name) || "Other",
                        paid_by: expense.created_by.id.toString(),
                        paid_by_user: {
                            id: expense.created_by.id.toString(),
                            name: `${expense.created_by.first_name} ${expense.created_by.last_name}`,
                            email: null,
                            avatar_url: null
                        },
                        trip_id: params.tripId,
                        created_at: expense.created_at,
                        updated_at: expense.updated_at,
                        source: "splitwise"
                    });
                });
                // Merge expenses, with Splitwise expenses first
                allExpenses = [...formattedSplitwiseExpenses, ...allExpenses];
            }
            catch (splitwiseError) {
                // If Splitwise is not connected, just continue with local expenses
                if (splitwiseError.message === "Splitwise not connected") {
                    console.log("Splitwise not connected for user, continuing with local expenses only");
                }
                else {
                    console.error("Error fetching Splitwise expenses:", splitwiseError);
                }
            }
        }
        // Group all expenses by category and sum amounts
        const categoryMap = allExpenses.reduce((acc, expense) => {
            const category = expense.category || "Other";
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += Number(expense.amount);
            return acc;
        }, {});
        // Calculate total spent
        const totalSpent = Object.values(categoryMap).reduce((sum, amount) => sum + amount, 0);
        const totalBudget = Number(trip.total_budget) || 0;
        const remaining = totalBudget - totalSpent;
        // Format categories
        const formattedCategories = Object.entries(categoryMap).map(([name, amount]) => ({
            name,
            amount,
            color: getCategoryColor(name),
        }));
        return NextResponse.json({
            expenses: allExpenses,
            budget: {
                total: totalBudget,
                spent: totalSpent,
                remaining,
                categories: formattedCategories,
            },
            splitwiseConnected: trip.splitwise_group_id != null
        });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function POST(request, { params }) {
    try {
        const supabase = createClient();
        // Check if user is authenticated
        const { data: { session }, } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Check if user is a member of this trip
        const { data: member, error: memberError } = await supabase
            .from("trip_members")
            .select()
            .eq("trip_id", params.tripId)
            .eq("user_id", session.user.id)
            .maybeSingle();
        if (memberError || !member) {
            return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 });
        }
        // Get expense data from request
        const expenseData = await request.json();
        // Insert expense into database
        const { data, error } = await supabase
            .from("expenses")
            .insert([
            Object.assign(Object.assign({}, expenseData), { trip_id: params.tripId }),
        ])
            .select(`
        *,
        paid_by_user:paid_by(id, name, email, avatar_url)
      `);
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ expense: data[0] });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
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
