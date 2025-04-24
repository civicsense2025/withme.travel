import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: { tripId: string; itemId: string } }) {
  try {
    const awaited = await params;
    const tripId = awaited.tripId;
    const itemId = awaited.itemId;
    const supabase = createClient()
    const { content } = await request.json()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.error()
  }
}
