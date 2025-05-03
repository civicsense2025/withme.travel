import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
// Direct table/field names used instead of imports
import { checkTripAccess } from '@/lib/trip-access';
import { Database } from '@/types/database.types';

/**
 * Check if a user has access to a specific trip
 *
 * @param request The incoming request
 * @param props The route parameters (tripId)
 * @returns A JSON response with access information and user role if available
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const supabase = createRouteHandlerClient();

  try {
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a member of this trip
    const { data: membership, error: membershipError } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (membershipError) {
      console.error('Error checking trip membership:', membershipError);
      return NextResponse.json({ access: false, reason: 'error', error: membershipError.message });
    }

    if (membership) {
      return NextResponse.json({
        access: true,
        isMember: true,
        role: membership.role,
      });
    }

    // Check if trip is public
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('is_public')
      .eq('id', tripId)
      .maybeSingle();

    if (tripError) {
      console.error('Error checking trip public status:', tripError);
      return NextResponse.json({ access: false, reason: 'error', error: tripError.message });
    }

    // Return access status
    return NextResponse.json({
      access: trip?.is_public || false,
      isMember: false,
      isPublic: trip?.is_public || false,
    });
  } catch (error: any) {
    console.error('Error checking trip access:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
