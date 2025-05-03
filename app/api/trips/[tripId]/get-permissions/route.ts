import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';
import { TRIP_ROLES } from '@/utils/constants/status';
import type { Database } from '@/types/database.types';

// Define field constants locally to avoid linting issues
const FIELDS = {
  TRIPS: {
    CREATED_BY: 'created_by',
    IS_PUBLIC: 'is_public'
  },
  TRIP_MEMBERS: {
    ROLE: 'role'
  }
};

export interface PermissionCheck {
  canView: boolean;
  canEdit: boolean;
  canManage: boolean;
  canAddMembers: boolean;
  canDeleteTrip: boolean;
  isCreator: boolean;
  role: keyof typeof TRIP_ROLES | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
): Promise<NextResponse> {
  try {
    const { tripId } = params;
    const supabase = createRouteHandlerClient();

    // First, get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // Default permissions for unauthenticated users
    const defaultPermissions: PermissionCheck = {
      canView: false,
      canEdit: false,
      canManage: false,
      canAddMembers: false,
      canDeleteTrip: false,
      isCreator: false,
      role: null,
    };

    if (userError || !user) {
      // Check if trip is public before returning default
      const { data: publicTrip, error: publicTripError } = await supabase
        .from(TABLES.TRIPS)
        .select(FIELDS.TRIPS.IS_PUBLIC)
        .eq('id', tripId)
        .maybeSingle();

      if (!publicTripError && publicTrip?.is_public) {
        return NextResponse.json({
          permissions: { ...defaultPermissions, canView: true },
        });
      }
      // Otherwise return default (no access)
      return NextResponse.json({ permissions: defaultPermissions });
    }

    // Check if the user is a member of the trip
    const { data: membership, error: membershipError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select(FIELDS.TRIP_MEMBERS.ROLE)
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    // Check if user is the creator of the trip
    type TripCreatorCheck = {
      created_by: string | null;
      is_public: boolean | null;
    };
    const { data: trip, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select(`${FIELDS.TRIPS.CREATED_BY}, ${FIELDS.TRIPS.IS_PUBLIC}`)
      .eq('id', tripId)
      .single<TripCreatorCheck>();

    // Handle errors fetching trip/membership details
    if (tripError) {
      if (!publicTripError && publicTrip && 'is_public' in publicTrip && publicTrip.is_public) {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
      }
      console.error('Error fetching trip details:', tripError);
      return NextResponse.json({ error: 'Failed to fetch trip details' }, { status: 500 });
    }
    if (membershipError && membershipError.code !== 'PGRST116') {
      console.error('Error fetching trip membership:', membershipError);
      return NextResponse.json({ error: 'Failed to check trip membership' }, { status: 500 });
    }
    if (!trip) {
      return NextResponse.json({ error: 'Trip data not found after query' }, { status: 404 });
    }

    // Determine role, isCreator, isPublic
    const role = (membership?.role as keyof typeof TRIP_ROLES) || null;
    const isCreator = trip.created_by === user.id;
    const isPublic = trip.is_public === true;

    // Determine permissions based on role, creator status, and public status
    const permissions: PermissionCheck = {
      canView: !!role || isCreator || isPublic,
      canEdit: 
        (!!role && [TRIP_ROLES.ADMIN, TRIP_ROLES.EDITOR].includes(role as any)) || isCreator,
      canManage: (!!role && [TRIP_ROLES.ADMIN].includes(role as any)) || isCreator,
      canAddMembers: (!!role && [TRIP_ROLES.ADMIN].includes(role as any)) || isCreator,
      canDeleteTrip: isCreator,
      isCreator,
      role: role,
    };

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error('Unexpected error in trip permissions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}