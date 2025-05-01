import { createServerSupabaseClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { TABLES, FIELDS, ENUMS } from '@/utils/constants/database';

// Use imported ENUMS directly
const TRIP_ROLES = ENUMS.TRIP_ROLES;

export interface PermissionCheck {
  canView: boolean;
  canEdit: boolean;
  canManage: boolean;
  canAddMembers: boolean;
  canDeleteTrip: boolean;
  isCreator: boolean;
  role: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const supabase = createServerSupabaseClient();

  try {
    // First, get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          permissions: {
            canView: false,
            canEdit: false,
            canManage: false,
            canAddMembers: false,
            canDeleteTrip: false,
            isCreator: false,
            role: null,
          },
        },
        { status: 200 }
      );
    }

    // Check if the user is a member of the trip
    const { data: membership, error: membershipError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select(FIELDS.TRIP_MEMBERS.ROLE)
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(FIELDS.TRIP_MEMBERS.USER_ID, user.id)
      .single();

    if (membershipError && membershipError.code !== 'PGRST116') {
      console.error('Error fetching trip membership:', membershipError);
      return NextResponse.json({ error: 'Failed to check trip membership' }, { status: 500 });
    }

    // Check if user is the creator of the trip
    // Define expected type for the trip query result
    type TripCreatorCheck = {
      created_by: string | null;
      is_public: boolean | null;
    }
    const { data: trip, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select(`${FIELDS.TRIPS.CREATED_BY}, ${FIELDS.TRIPS.IS_PUBLIC}`)
      .eq(FIELDS.TRIPS.ID, tripId)
      .single<TripCreatorCheck>(); // Apply the type here

    if (tripError) {
      if (tripError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
      }

      console.error('Error fetching trip details:', tripError);
      return NextResponse.json({ error: 'Failed to fetch trip details' }, { status: 500 });
    }
    
    // Add a null check for trip data, although .single() should guarantee it or throw
    if (!trip) {
      return NextResponse.json({ error: 'Trip data not found after query' }, { status: 404 });
    }

    // Simplify role handling - type assertion might be needed depending on DB type
    const role: string | null = membership?.role || null;
    const isCreator = trip.created_by === user.id;
    const isPublic = trip.is_public === true; // Explicit boolean check

    // Determine permissions based on role and creator status
    const permissions: PermissionCheck = {
      canView: !!role || isCreator || isPublic,
      // Ensure role is not null and is a valid role string before checking includes
      canEdit: (!!role && [TRIP_ROLES.ADMIN, TRIP_ROLES.EDITOR].includes(role as any)) || isCreator,
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
