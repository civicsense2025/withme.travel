import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { disconnectSplitwise, SplitwiseError } from "@/lib/services/splitwise";
export async function DELETE(request) {
    try {
        const supabase = createClient();
        // 1. Get User
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }
        // 2. Call the disconnect service function
        await disconnectSplitwise(user.id);
        return NextResponse.json({ success: true, message: "Splitwise connection removed." });
    }
    catch (error) {
        console.error("Error in DELETE /api/splitwise/connection:", error);
        if (error instanceof SplitwiseError) {
            // You might want specific handling, but for delete, often returning 500 is ok
            return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 });
        }
        else if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        else {
            return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
        }
    }
}
