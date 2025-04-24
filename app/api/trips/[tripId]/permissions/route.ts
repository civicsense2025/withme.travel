import { createClient } from "@/utils/supabase/server"
import { NextResponse, NextRequest } from "next/server"
import { PERMISSION_STATUSES, TRIP_ROLES } from "@/utils/constants"

// Get all permission requests for a trip
export async function GET(request: NextRequest, props: { params: { tripId: string } }) {
  // Extract tripId properly
  const { tripId } = props.params;

  if (!tripId) return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });

  try {
    const supabase = createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin of this trip
    const { data: member, error: memberError } = await supabase
      .from("trip_members")
      .select("role")
      .eq("trip_id", tripId)
      .eq("user_id", user.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: "You don't have access to this trip" }, { status: 403 })
    }

    // Only trip admins and editors can see permission requests (adjust if contributors should too)
    // Changed OWNER to ADMIN
    if (member.role !== TRIP_ROLES.ADMIN && 
        member.role !== TRIP_ROLES.EDITOR) { // Use direct role check
      return NextResponse.json({ error: "Only admins or editors can view permission requests" }, { status: 403 })
    }

    // Get all pending permission requests for this trip
    const { data: requests, error } = await supabase
      .from("permission_requests")
      .select(`
        *,
        user:user_id(id, name, email, avatar_url)
      `)
      .eq("trip_id", tripId)
      .eq("status", PERMISSION_STATUSES.PENDING)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ requests })
  } catch (error: any) {
    console.error(`Error fetching permissions for trip ${tripId}:`, error);
    return NextResponse.json({ error: error.message || "Failed to fetch permissions" }, { status: 500 })
  }
}

// Create a new permission request
export async function POST(request: Request, { params }: { params: { tripId: string } }) {
  if (!params.tripId) return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });

  try {
    const supabase = createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is already a member of this trip
    const { data: existingMember, error: checkError } = await supabase
      .from("trip_members")
      .select()
      .eq("trip_id", params.tripId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this trip" },
        { status: 400 }
      )
    }

    // Get request body
    const { role = "EDITOR", message } = await request.json()

    // Check if request already exists
    const { data: existingRequest, error: requestError } = await supabase
      .from("permission_requests")
      .select()
      .eq("trip_id", params.tripId)
      .eq("user_id", user.id)
      .eq("status", PERMISSION_STATUSES.PENDING)
      .maybeSingle()

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending request for this trip" },
        { status: 400 }
      )
    }

    // Create permission request
    const { data, error } = await supabase
      .from("permission_requests")
      .insert([
        {
          trip_id: params.tripId,
          user_id: user.id,
          role,
          message,
          status: PERMISSION_STATUSES.PENDING
        }
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ request: data[0] })
  } catch (error: any) {
    console.error(`Error creating permission request for trip ${params.tripId}:`, error);
    return NextResponse.json({ error: error.message || "Failed to create permission request" }, { status: 500 })
  }
}

// Update a permission request status (approve/reject)
export async function PATCH(request: NextRequest, { params }: { params: { tripId: string, requestId: string } }) {
  if (!params.tripId || !params.requestId) return NextResponse.json({ error: "Trip ID and Request ID are required" }, { status: 400 });

  try {
    const supabase = createClient()
    const { status } = await request.json()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate status
    if (!status || !Object.values(PERMISSION_STATUSES).includes(status)) {
      return NextResponse.json({ error: "Invalid status provided" }, { status: 400 })
    }

    // Verify user is admin of the trip
    const { data: memberData, error: memberError } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', params.tripId)
      .eq('user_id', user.id)
      .single()

    if (memberError || !memberData || memberData.role !== TRIP_ROLES.ADMIN) { // Check for ADMIN role
      return NextResponse.json({ error: "Forbidden: User is not an admin of this trip" }, { status: 403 })
    }

    // Validate requestId format (assuming UUID)
    // Add actual UUID validation if needed
    if (!params.requestId) {
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 })
    }

    // Get the permission request
    const { data: permissionRequest, error: fetchError } = await supabase
      .from("permission_requests")
      .select()
      .eq("id", params.requestId)
      .eq("trip_id", params.tripId)
      .single()

    if (fetchError || !permissionRequest) {
      return NextResponse.json({ error: "Permission request not found" }, { status: 404 })
    }

    // Update the permission request status
    const { error: updateError } = await supabase
      .from("permission_requests")
      .update({ status })
      .eq("id", params.requestId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // If approved, add user as a trip member
    if (status === PERMISSION_STATUSES.APPROVED) {
      const { error: addError } = await supabase
        .from("trip_members")
        .insert([
          {
            trip_id: params.tripId,
            user_id: permissionRequest.user_id,
            role: permissionRequest.role,
            invited_by: user.id,
            joined_at: new Date().toISOString()
          }
        ])

      if (addError) {
        console.error("Error adding approved user to trip_members:", addError);
      }
    }

    return NextResponse.json({ success: true, status })
  } catch (error: any) {
    console.error(`Error updating permission request ${params.requestId} for trip ${params.tripId}:`, error);
    return NextResponse.json({ error: error.message || "Failed to update permission request" }, { status: 500 })
  }
} 