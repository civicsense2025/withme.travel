import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: { id: string; itemId: string } }) {
  try {
    const supabase = createClient()
    const tripId = params.id
    const itemId = params.itemId
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
