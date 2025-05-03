import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';
import { TRIP_ROLES } from '@/utils/constants/status';
import type { Database } from '@/types/database.types';

// Define local constants for any tables not in central constants
const LOCAL_TABLES = {
  TRIPS: 'trips',
  TRIP_MEMBERS: 'trip_members'
};

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

// Interface for trip public check
interface TripPublicCheck {
  is_public: boolean;
}

// Interface for trip creator check
interface TripCreatorCheck {
  created_by: string;
  is_public: boolean;
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
      const { data: publicTripData, error: publicTripError } = await supabase
        .from(TABLES.TRIPS)
        .select(FIELDS.TRIPS.IS_PUBLIC)
        .eq('id', tripId)
        .maybeSingle<TripPublicCheck>();

      // Type guard for publicTripData
      const isPublicTrip = publicTripData && 'is_public' in publicTripData && publicTripData.is_public === true;

      if (!publicTripError && isPublicTrip) {
        return NextResponse.json({
          permissions: { ...defaultPermissions, canView: true },
        });
      }
      // Otherwise return default (no access)
      return NextResponse.json({ permissions: defaultPermissions });
    }

    // Check if the user is a member of the trip
    const { data: membership, error: membershipError } = await supabase
      .from(LOCAL_TABLES.TRIP_MEMBERS)
      .select(FIELDS.TRIP_MEMBERS.ROLE)
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    // Check if user is the creator of the trip
    const { data: trip, error: tripError } = await supabase
      .from(LOCAL_TABLES.TRIPS)
      .select(`${FIELDS.TRIPS.CREATED_BY}, ${FIELDS.TRIPS.IS_PUBLIC}`)
      .eq('id', tripId)
      .single<TripCreatorCheck>();

    // Handle errors fetching trip/membership details
    if (tripError) {
      console.error('Error fetching trip details:', tripError);
      return NextResponse.json({ error: 'Failed to fetch trip details' }, { status: 500 });
    }
    if (membershipError && membershipError.code !== 'PGRST116') {
      // PGRST116 is the expected error code when no rows are found
      console.error('Error fetching trip membership:', membershipError);
      return NextResponse.json({ error: 'Failed to check trip membership' }, { status: 500 });
    }
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Determine role, isCreator, isPublic with safe type checking
    const roleValue = membership && typeof membership === 'object' && 'role' in membership ? 
      (membership as { role: string }).role : undefined;
    const role = roleValue ? (roleValue as keyof typeof TRIP_ROLES) : null;
    const isCreator = trip.created_by === user.id;
    const isPublic = trip.is_public === true;

    // Define role types safely with type assertion
    const adminRoles: Array<keyof typeof TRIP_ROLES> = ['ADMIN'];
    const editorRoles: Array<keyof typeof TRIP_ROLES> = ['ADMIN', 'EDITOR'];

    // Helper function to check if a role is in a list of roles
    const hasRole = (userRole: keyof typeof TRIP_ROLES | null, allowedRoles: Array<keyof typeof TRIP_ROLES>): boolean => {
      return !!userRole && allowedRoles.includes(userRole);
    };

    // Determine permissions based on role, creator status, and public status
    const permissions: PermissionCheck = {
      canView: !!role || isCreator || isPublic,
      canEdit: isCreator || hasRole(role, editorRoles),
      canManage: isCreator || hasRole(role, adminRoles),
      canAddMembers: isCreator || hasRole(role, adminRoles),
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