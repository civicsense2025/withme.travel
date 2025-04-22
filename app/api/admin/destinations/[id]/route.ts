import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const destinationId = params.id

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

    // Get update data from request
    const updateData = await request.json()

    // Update destination
    const { data, error } = await supabase
      .from("destinations")
      .update({
        name: updateData.name,
        city: updateData.city,
        country: updateData.country,
        continent: updateData.continent,
        description: updateData.description || null,
        image_url: updateData.image_url || null,
      })
      .eq("id", destinationId)
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({ destination: data[0] })
  } catch (error) {
    console.error("Error updating destination:", error)
    return NextResponse.json({ error: "Failed to update destination" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const destinationId = params.id

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

    // Delete destination
    const { error } = await supabase.from("destinations").delete().eq("id", destinationId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting destination:", error)
    return NextResponse.json({ error: "Failed to delete destination" }, { status: 500 })
  }
}
