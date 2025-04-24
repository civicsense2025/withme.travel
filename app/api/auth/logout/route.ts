import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createClient()

  try {
    // Attempt to sign the user out
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Supabase Sign Out Error:", error.message);
      // Even if Supabase fails, we might still want to clear client-side state,
      // but returning an error indicates the server-side session might still be active.
      return NextResponse.json({ error: "Failed to sign out properly." }, { status: 500 });
    }

    // Sign out successful on the server
    // AuthProvider will handle clearing the client-state
    return NextResponse.json({ success: true, message: "Successfully signed out" }, { status: 200 });

  } catch (error: any) {
    console.error("API Logout Route Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during sign out" }, { status: 500 });
  }
} 