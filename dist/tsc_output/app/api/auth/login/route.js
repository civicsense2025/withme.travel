import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
export async function POST(request) {
    const requestUrl = new URL(request.url);
    let requestBody;
    try {
        requestBody = await request.json();
    }
    catch (error) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { email, password } = requestBody;
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    const cookieStore = cookies();
    const supabase = createClient();
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            // Log the specific Supabase error for debugging
            console.error("Supabase Sign In Error:", error.message);
            // Provide a generic error message to the client
            return NextResponse.json({ error: "Invalid login credentials" }, { status: 401 }); // Use 401 for auth failure
        }
        // No need to explicitly return the user here, session is handled via cookies
        // The AuthProvider will call /api/auth/me to get user info
        return NextResponse.json({ success: true }, { status: 200 });
    }
    catch (error) {
        console.error("API Login Route Error:", error); // Log unexpected errors
        return NextResponse.json({ error: "An unexpected error occurred during login" }, { status: 500 });
    }
}
