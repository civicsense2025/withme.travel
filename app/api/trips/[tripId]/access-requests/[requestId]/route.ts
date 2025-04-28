import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import { DB_TABLES, DB_FIELDS, DB_ENUMS } from "@/utils/constants/database"

/**
 * Handle updating the status of a trip access request (approve/reject)
 * 
 * @param request The incoming request
 * @param props The route parameters (tripId and requestId)
 * @returns A JSON response indicating success or error
 */
export async function PATCH(request: Request, props: { params: { tripId: string; requestId: string } }) {
  const { tripId, requestId } = props.params;

  try {
    const supabase = createClient()
    const { status } = await request.json()

    if (!status || (status !== DB_ENUMS.REQUEST_STATUSES.APPROVED && status !== DB_ENUMS.REQUEST_STATUSES.REJECTED)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin of this trip
    const { data: membership, error: membershipError } = await supabase
      .from(DB_TABLES.TRIP_MEMBERS)
      .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
      .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, user.id)
      .single()

    if (membershipError || !membership || membership.role !== DB_ENUMS.TRIP_ROLES.ADMIN) {
      return NextResponse.json({ error: "You don't have permission to manage access requests" }, { status: 403 })
    }

    // Get the access request
    const { data: request, error: requestError } = await supabase
      .from(DB_TABLES.ACCESS_REQUESTS)
      .select(`${DB_FIELDS.ACCESS_REQUESTS.USER_ID}, ${DB_FIELDS.ACCESS_REQUESTS.STATUS}`)
      .eq(DB_FIELDS.ACCESS_REQUESTS.ID, requestId)
      .eq(DB_FIELDS.ACCESS_REQUESTS.TRIP_ID, tripId)
      .single()

    if (requestError || !request) {
      return NextResponse.json({ error: "Access request not found" }, { status: 404 })
    }

    if (request.status !== DB_ENUMS.REQUEST_STATUSES.PENDING) {
      return NextResponse.json({ error: "This request has already been processed" }, { status: 400 })
    }

    // Update the access request status
    const { error: updateError } = await supabase
      .from(DB_TABLES.ACCESS_REQUESTS)
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq(DB_FIELDS.ACCESS_REQUESTS.ID, requestId)

    if (updateError) {
      throw updateError
    }

    // If approved, add user as a trip member
    if (status === DB_ENUMS.REQUEST_STATUSES.APPROVED) {
      // Check if member already exists (rare edge case)
      const { data: existingMember, error: memberCheckError } = await supabase
        .from(DB_TABLES.TRIP_MEMBERS)
        .select('id')
        .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
        .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, request.user_id)
        .maybeSingle();
        
      if (memberCheckError) {
        console.error("Error checking existing membership:", memberCheckError);
        return NextResponse.json({ error: "Failed to check existing membership" }, { status: 500 });
      }
      
      if (!existingMember) {
        // Add user as a member
        const { error: memberError } = await supabase
          .from(DB_TABLES.TRIP_MEMBERS)
          .insert({
            [DB_FIELDS.TRIP_MEMBERS.TRIP_ID]: tripId,
            [DB_FIELDS.TRIP_MEMBERS.USER_ID]: request.user_id,
            [DB_FIELDS.TRIP_MEMBERS.ROLE]: DB_ENUMS.TRIP_ROLES.CONTRIBUTOR,
            [DB_FIELDS.TRIP_MEMBERS.INVITED_BY]: user.id,
            [DB_FIELDS.TRIP_MEMBERS.JOINED_AT]: new Date().toISOString()
          });
          
        if (memberError) {
          console.error("Error adding member:", memberError);
          return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error processing access request:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
