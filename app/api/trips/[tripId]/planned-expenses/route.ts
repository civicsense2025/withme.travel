import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { checkTripAccess } from '@/lib/trip-access';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> | { tripId: string } }
) {
  try {
    const { tripId } = await params;
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify user membership
    const { data: tripMembership, error: tripError } = await supabase
      .from('trip_members')
      .select('*')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    if (tripError || !tripMembership) {
      console.error('Error fetching trip membership or not a member:', tripError);
      return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    // In the future, this endpoint could calculate planned expenses based on
    // trip itinerary items that have cost information

    // For now, return an empty array
    return NextResponse.json({
      expenses: [],
      totalPlanned: 0,
    });
  } catch (error: any) {
    console.error('Error fetching planned expenses:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
