import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { NextResponse } from "next/server"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const id = params.id

  try {
    // Check if user is authenticated and is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (userError || !userData?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Create admin client to bypass RLS
    const adminClient = createAdminClient()

    // First delete trip_members to avoid foreign key constraints
    const { error: memberError } = await adminClient
      .from("trip_members")
      .delete()
      .eq("trip_id", id)

    if (memberError) {
      console.error("Error deleting trip members:", memberError)
      // Continue anyway to try deleting the trip
    }

    // Delete the trip
    const { error } = await adminClient
      .from("trips")
      .delete()
      .eq("id", id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting trip:", error)
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const id = params.id

  try {
    // Check if user is authenticated and is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (userError || !userData?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Parse the request body
    const body = await request.json()
    
    // Create admin client to bypass RLS
    const adminClient = createAdminClient()

    // Update the trip
    const { data, error } = await adminClient
      .from("trips")
      .update({
        name: body.name,
        start_date: body.start_date,
        end_date: body.end_date,
        is_public: body.is_public,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        id, 
        name, 
        destination_id,
        destination_name,
        start_date, 
        end_date, 
        created_by,
        created_at,
        updated_at,
        is_public,
        slug
      `)
      .single()

    if (error) {
      throw error
    }

    // Fetch user information
    if (data) {
      const { data: userData, error: userError } = await adminClient
        .from("users")
        .select("id, email, name")
        .eq("id", data.created_by)
        .single()

      if (!userError && userData) {
        (data as any).users = userData
      }
    }

    return NextResponse.json({ trip: data })
  } catch (error) {
    console.error("Error updating trip:", error)
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 })
  }
}
