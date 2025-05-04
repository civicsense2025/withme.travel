import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
// Direct table/field names used instead of imports
import { TABLES } from '@/utils/constants/database';
import { PERMISSION_STATUSES } from '@/utils/constants/status';
import { EmailService } from '@/lib/services/email-service';
import { Database } from '@/types/database.types';

// Define table names to avoid TypeScript errors
const TRIPS_TABLE = 'trips';
const TRIP_MEMBERS_TABLE = 'trip_members';
const PERMISSION_REQUESTS_TABLE = 'permission_requests';

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
  const supabase = await createRouteHandlerClient();

  if (!tripId) return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });

  try {
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
      .from(TRIPS_TABLE)
      .select('id')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from(TRIP_MEMBERS_TABLE)
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json({ error: 'You are already a member of this trip' }, { status: 400 });
    }

    // Check if user already has a pending request
    const { data: existingRequest } = await supabase
      .from(PERMISSION_REQUESTS_TABLE)
      .select('id, status')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingRequest) {
      if (existingRequest.status === PERMISSION_STATUSES.PENDING) {
        return NextResponse.json(
          { error: 'You already have a pending request for this trip' },
          { status: 400 }
        );
      } else if (existingRequest.status === PERMISSION_STATUSES.REJECTED) {
        return NextResponse.json({ error: 'Your previous request was rejected' }, { status: 400 });
      } else {
        // If denied, allow to request again by updating the existing request
        const { error: updateError } = await supabase
          .from(PERMISSION_REQUESTS_TABLE)
          .update({
            status: PERMISSION_STATUSES.PENDING,
            message: message || '',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingRequest.id);

        if (updateError) {
          throw updateError;
        }
      }
    } else {
      // Create new request
      const { error: insertError } = await supabase.from(PERMISSION_REQUESTS_TABLE).insert({
        trip_id: tripId,
        user_id: user.id,
        message: message || '',
        status: PERMISSION_STATUSES.PENDING,
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
