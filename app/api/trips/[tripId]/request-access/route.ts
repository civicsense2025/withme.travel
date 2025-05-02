import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse, type NextRequest } from 'next/server';

import { ENUMS } from "@/utils/constants/database";
import { TABLES, FIELDS } from "@/utils/constants/database";

/**
 * Handle a user's request to access a trip
 *
 * @param request The incoming request containing the message
 * @param props The route parameters (tripId)
 * @returns A JSON response indicating success or error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;

  if (!tripId) return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });

  try {
    const supabase = await createServerSupabaseClient();
    const { message } = await request.json();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if trip exists
    const { data: trip, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select(FIELDS.TRIPS.ID)
      .eq(FIELDS.TRIPS.ID, tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select('id')
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(FIELDS.TRIP_MEMBERS.USER_ID, user.id)
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json({ error: 'You are already a member of this trip' }, { status: 400 });
    }

    // Check if user already has a pending request
    const { data: existingRequest } = await supabase
      .from(TABLES.PERMISSION_REQUESTS)
      .select(`id, ${FIELDS.PERMISSION_REQUESTS.STATUS}`)
      .eq(FIELDS.PERMISSION_REQUESTS.TRIP_ID, tripId)
      .eq(FIELDS.PERMISSION_REQUESTS.USER_ID, user.id)
      .maybeSingle();

    if (existingRequest) {
      if (existingRequest.status === ENUMS.REQUEST_STATUSES.PENDING) {
        return NextResponse.json(
          { error: 'You already have a pending request for this trip' },
          { status: 400 }
        );
      } else if (existingRequest.status === ENUMS.REQUEST_STATUSES.REJECTED) {
        return NextResponse.json({ error: 'Your previous request was rejected' }, { status: 400 });
      } else {
        // If denied, allow to request again by updating the existing request
        const { error: updateError } = await supabase
          .from(TABLES.PERMISSION_REQUESTS)
          .update({
            [FIELDS.PERMISSION_REQUESTS.STATUS]: ENUMS.REQUEST_STATUSES.PENDING,
            [FIELDS.PERMISSION_REQUESTS.MESSAGE]: message || '',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingRequest.id);

        if (updateError) {
          throw updateError;
        }
      }
    } else {
      // Create new request
      const { error: insertError } = await supabase.from(TABLES.PERMISSION_REQUESTS).insert({
        [FIELDS.PERMISSION_REQUESTS.TRIP_ID]: tripId,
        [FIELDS.PERMISSION_REQUESTS.USER_ID]: user.id,
        [FIELDS.PERMISSION_REQUESTS.MESSAGE]: message || '',
        [FIELDS.PERMISSION_REQUESTS.STATUS]: ENUMS.REQUEST_STATUSES.PENDING,
      });

      if (insertError) {
        throw insertError;
      }
    }

    // Notify trip organizers (in a real app, you would send emails or notifications here)
    // For now, we'll just return success

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error requesting access:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
