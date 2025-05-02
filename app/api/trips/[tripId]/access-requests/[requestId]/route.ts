import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse, type NextRequest } from 'next/server';

import { TABLES, DB_FIELDS } from '@/utils/constants/database';

// Define a more complete type for TABLES that includes missing properties
type ExtendedTables = {
  TRIP_MEMBERS: string;
  TRIPS: string;
  USERS: string;
  ITINERARY_ITEMS: string;
  ITINERARY_SECTIONS: string;
  [key: string]: string;
};

// Use the extended type with the existing TABLES constant
const Tables = TABLES as unknown as ExtendedTables;

import { TRIP_ROLES, type TripRole } from '@/utils/constants/status';

// Define RequestStatus type and constants
const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

type RequestStatus = typeof REQUEST_STATUS[keyof typeof REQUEST_STATUS];

/**
 * Handle updating the status of a trip access request (approve/reject)
 *
 * @param request The incoming request
 * @param props The route parameters (tripId and requestId)
 * @returns A JSON response indicating success or error
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; requestId: string }> }
) {
  const { tripId, requestId } = await params;

  try {
    const supabase = await createServerSupabaseClient();
    const { status } = await request.json();

    if (!status || (status !== REQUEST_STATUS.APPROVED && status !== REQUEST_STATUS.REJECTED)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an admin of this trip
    const { data: membership, error: membershipError } = await supabase
      .from(Tables.TRIP_MEMBERS)
      .select(FIELDS.TRIP_MEMBERS.ROLE)
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(FIELDS.TRIP_MEMBERS.USER_ID, user.id)
      .single();

    if (membershipError || !membership || membership.role !== TRIP_ROLES.ADMIN) {
      return NextResponse.json(
        { error: "You don't have permission to manage access requests" },
        { status: 403 }
      );
    }

    // Get the access request
    const { data: accessRequestData, error: requestError } = await supabase
      .from(Tables.PERMISSION_REQUESTS)
      .select(`${FIELDS.PERMISSION_REQUESTS.USER_ID}, ${FIELDS.PERMISSION_REQUESTS.STATUS}`)
      .eq(FIELDS.PERMISSION_REQUESTS.ID, requestId)
      .eq(FIELDS.PERMISSION_REQUESTS.TRIP_ID, tripId)
      .single();

    if (requestError || !accessRequestData) {
      return NextResponse.json({ error: 'Access request not found' }, { status: 404 });
    }

    if (accessRequestData.status !== REQUEST_STATUS.PENDING) {
      return NextResponse.json(
        { error: 'This request has already been processed' },
        { status: 400 }
      );
    }

    // Update the access request status
    const { error: updateError } = await supabase
      .from(Tables.PERMISSION_REQUESTS)
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq(FIELDS.PERMISSION_REQUESTS.ID, requestId);

    if (updateError) {
      throw updateError;
    }

    // If approved, add user as a trip member
    if (status === REQUEST_STATUS.APPROVED) {
      // Check if member already exists (rare edge case)
      const { data: existingMember, error: memberCheckError } = await supabase
        .from(Tables.TRIP_MEMBERS)
        .select('id')
        .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
        .eq(FIELDS.TRIP_MEMBERS.USER_ID, accessRequestData.user_id)
        .maybeSingle();

      if (memberCheckError) {
        console.error('Error checking existing membership:', memberCheckError);
        return NextResponse.json({ error: 'Failed to check existing membership' }, { status: 500 });
      }

      if (!existingMember) {
        // Add user as a member
        const { error: memberError } = await supabase.from(Tables.TRIP_MEMBERS).insert({
          [FIELDS.TRIP_MEMBERS.TRIP_ID]: tripId,
          [FIELDS.TRIP_MEMBERS.USER_ID]: accessRequestData.user_id,
          [FIELDS.TRIP_MEMBERS.ROLE]: TRIP_ROLES.CONTRIBUTOR,
          [FIELDS.TRIP_MEMBERS.INVITED_BY]: user.id,
          [FIELDS.TRIP_MEMBERS.JOINED_AT]: new Date().toISOString(),
        });

        if (memberError) {
          console.error('Error adding member:', memberError);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error processing access request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
