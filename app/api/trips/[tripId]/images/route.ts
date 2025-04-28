import { type NextRequest, NextResponse } from "next/server"
import { createApiClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest, { params }: { params: { tripId: string } }) {
  try {
    const tripId = params.tripId
    const supabase = createClient()

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has access to this trip
    const { data: membership, error: membershipError } = await supabase
      .from("trip_members")
      .select("role")
      .eq("trip_id", tripId)
      .eq("user_id", user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 })
    }

    // Check if user has write permission (not a viewer)
    if (membership.role === "viewer") {
      return NextResponse.json({ error: "You don't have permission to upload images" }, { status: 403 })
    }

    // Get form data with the file
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." 
      }, { status: 400 })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "File too large. Maximum size is 5MB." 
      }, { status: 400 })
    }

    // Generate a unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `trip-${tripId}-${timestamp}.${fileExtension}`
    const filePath = `trip-images/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('trip-content')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error("Error uploading image:", uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: publicURLData } = supabase
      .storage
      .from('trip-content')
      .getPublicUrl(filePath)

    // Store reference in the database
    const { error: dbError } = await supabase
      .from('trip_images')
      .insert({
        trip_id: tripId,
        file_path: filePath,
        file_name: file.name,
        created_by: user.id,
        content_type: file.type,
        size_bytes: file.size
      })

    if (dbError) {
      console.error("Error storing image reference:", dbError)
      // Continue anyway - the image is already uploaded
    }

    return NextResponse.json({ 
      success: true,
      url: publicURLData.publicUrl
    })
  } catch (error: any) {
    console.error("Error handling image upload:", error)
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 })
  }
} 