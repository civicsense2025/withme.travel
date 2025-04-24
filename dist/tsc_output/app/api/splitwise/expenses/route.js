import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { getGroupExpenses, SplitwiseError, getGroup } from "@/lib/services/splitwise";
import { getSplitwiseCredentials } from "@/lib/services/splitwise";
import { DB_TABLES, DB_FIELDS } from "@/utils/constants";
// Get Splitwise expenses for a trip
export async function GET(request) {
    try {
        const url = new URL(request.url);
        const tripId = url.searchParams.get("tripId");
        if (!tripId) {
            return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
        }
        // Get the authenticated user
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        // Verify the user has access to the trip
        const { data: tripMembership, error: tripError } = await supabase
            .from("trip_members")
            .select("role")
            .eq("trip_id", tripId)
            .eq("user_id", user.id)
            .single();
        if (tripError) {
            return NextResponse.json({ error: "Failed to verify trip membership" }, { status: 500 });
        }
        if (!tripMembership) {
            return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 });
        }
        // Get the Splitwise group ID linked to this trip
        const { data: tripData, error: tripDataError } = await supabase
            .from(DB_TABLES.TRIPS)
            .select(DB_FIELDS.TRIPS.SPLITWISE_GROUP_ID)
            .eq(DB_FIELDS.TRIPS.ID, tripId)
            .single();
        if (tripDataError) {
            return NextResponse.json({ error: "Failed to fetch trip data" }, { status: 500 });
        }
        if (!tripData) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }
        if (!tripData.splitwise_group_id) {
            return NextResponse.json({ error: "This trip is not linked to a Splitwise group" }, { status: 400 });
        }
        try {
            // 2. Get Splitwise credentials for the user
            // getSplitwiseCredentials handles potential 401 if not connected
            await getSplitwiseCredentials(user.id);
            // 3. Fetch expenses from Splitwise using the service
            const { expenses: fetchedExpenses } = await getGroupExpenses(user.id, tripData.splitwise_group_id);
            // 4. Fetch Group Details to get the name (NEW STEP)
            let groupName = null;
            try {
                const { group } = await getGroup(user.id, tripData.splitwise_group_id);
                groupName = group === null || group === void 0 ? void 0 : group.name;
            }
            catch (groupFetchError) {
                // Log the error but don't fail the whole request if group fetch fails
                console.error(`Failed to fetch group name for group ${tripData.splitwise_group_id}:`, groupFetchError);
                // You could potentially check the error type here (e.g., if it was a 404 from Splitwise)
            }
            // Format the expenses for the frontend
            const formattedExpenses = fetchedExpenses.map(expense => {
                var _a;
                return ({
                    id: expense.id,
                    description: expense.description,
                    amount: parseFloat(expense.cost),
                    currency: expense.currency_code,
                    date: expense.date,
                    category: ((_a = expense.category) === null || _a === void 0 ? void 0 : _a.name) || "Uncategorized",
                    paidBy: `${expense.created_by.first_name} ${expense.created_by.last_name}`,
                    paidById: expense.created_by.id,
                    splits: expense.users.map(user => ({
                        userId: user.user_id,
                        name: `${user.user.first_name} ${user.user.last_name}`,
                        paidShare: parseFloat(user.paid_share),
                        owedShare: parseFloat(user.owed_share),
                        netBalance: parseFloat(user.net_balance)
                    }))
                });
            });
            return NextResponse.json({
                expenses: formattedExpenses,
                groupId: tripData.splitwise_group_id,
                groupName
            });
        }
        catch (splitwiseError) {
            // Log errors
            console.error("Splitwise API Error in /api/splitwise/expenses:", splitwiseError);
            // Handle specific errors like "not connected"
            if (splitwiseError instanceof SplitwiseError && splitwiseError.message === "Splitwise not connected") {
                return NextResponse.json({ error: "Splitwise account not connected" }, { status: 401 });
            }
            // Determine the status code to return
            // Use the statusCode from SplitwiseError if available, otherwise default to 503
            const status = (splitwiseError instanceof SplitwiseError && splitwiseError.statusCode)
                ? splitwiseError.statusCode
                : 503;
            const errorMessage = (splitwiseError instanceof Error)
                ? splitwiseError.message
                : "Failed to fetch Splitwise expenses";
            return NextResponse.json({ error: errorMessage }, { status } // Use the determined status code
            );
        }
    }
    catch (error) {
        console.error("Error in Splitwise expenses endpoint:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}
