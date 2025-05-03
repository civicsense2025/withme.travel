import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { PERMISSION_STATUSES, TRIP_ROLES } from '@/utils/constants/status';
import { z } from 'zod';
import { Database } from '@/types/database.types';

// Define table names as constants to keep code consistent
const TRIP_MEMBERS_TABLE = 'trip_members';
const PERMISSION_REQUESTS_TABLE = 'permission_requests';

// Define RequestStatus type and constants
const REQUEST_STATUS = PERMISSION_STATUSES;
type RequestStatus = keyof typeof PERMISSION_STATUSES;

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
): Promise<NextResponse> {
  const { tripId, requestId } = await params;
  const supabase = await createRouteHandlerClient();

  try {
    const { status } = await request.json();

    // Validate status using REQUEST_STATUS
    const validStatuses = Object.values(REQUEST_STATUS);
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
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
      .from(TRIP_MEMBERS_TABLE)
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership || membership.role !== TRIP_ROLES.ADMIN) {
      return NextResponse.json(
        { error: "You don't have permission to manage access requests" },
        { status: 403 }
      );
    }

    // Get the access request
    const { data: accessRequestData, error: requestError } = await supabase
      .from(PERMISSION_REQUESTS_TABLE)
      .select('user_id, status, role')
      .eq('id', requestId)
      .eq('trip_id', tripId)
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
      .from(PERMISSION_REQUESTS_TABLE)
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      throw updateError;
    }

    // If approved, add user as a trip member
    if (status === REQUEST_STATUS.APPROVED) {
      // Check if member already exists (rare edge case)
      const { data: existingMember, error: memberCheckError } = await supabase
        .from(TRIP_MEMBERS_TABLE)
        .select('id')
        .eq('trip_id', tripId)
        .eq('user_id', accessRequestData.user_id)
        .maybeSingle();

      if (memberCheckError) {
        console.error('Error checking existing membership:', memberCheckError);
        return NextResponse.json({ error: 'Failed to check existing membership' }, { status: 500 });
      }

      if (!existingMember) {
        // Add user as a member with the role from the request (or default)
        const requestedRole = accessRequestData.role || TRIP_ROLES.CONTRIBUTOR;
        const { error: memberError } = await supabase.from(TRIP_MEMBERS_TABLE).insert({
          trip_id: tripId,
          user_id: accessRequestData.user_id,
          role: requestedRole,
          invited_by: user.id,
          joined_at: new Date().toISOString(),
        });

        if (memberError) {
          console.error('Error adding member:', memberError);
          // Don't fail the whole request if adding member fails, but log it.
          // Might happen due to race conditions or other issues.
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error processing access request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}