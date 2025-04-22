import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { destinationId } = await request.json()

    if (!destinationId) {
      return NextResponse.json({ error: "Destination ID is required" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Increment the popularity counter for this destination
    const { error } = await supabase
      .from("destinations")
      .update({
        popularity: supabase.rpc("increment_counter", { row_id: destinationId }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", destinationId)

    if (error) {
      console.error("Error updating destination popularity:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Unexpected error in destination selection:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
