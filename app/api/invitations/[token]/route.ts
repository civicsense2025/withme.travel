import { createApiClient } from "@/utils/supabase/server";
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, props: { params: { token: string } }) {
  const { token } = props.params;

  try {
    const supabase = createClient()

    // Check if invitation exists and is valid
    const { data: invitation, error } = await supabase
      .from("invitations")
      .select(`
        *,
        trip:trip_id(*),
        inviter:invited_by(id, name, email, avatar_url)
      `)
      .eq("token", token)
      .single()

    if (error || !invitation) {
      return NextResponse.json({ error: "Invitation not found or expired" }, { status: 404 })
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: "Invitation has expired" }, { status: 410 })
    }

    return NextResponse.json({ invitation })
  } catch (error: any) {
    console.error("Error fetching invitation:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
