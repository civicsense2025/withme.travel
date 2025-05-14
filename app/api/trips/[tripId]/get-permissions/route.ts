import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TRIP_ROLES } from '@/utils/constants/status';
import { TABLES } from '@/utils/constants/tables';
import { isTripMembership, TripMembership } from '@/utils/type-guards';

// Define field constants locally to avoid linting issues
const FIELDS = {
  TRIPS: {
    CREATED_BY: 'created_by',
    IS_PUBLIC: 'is_public',
  },
  TRIP_MEMBERS: {
    ROLE: 'role',
  },
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

/**
 * GET handler for retrieving a user's permissions for a trip
 * @param request The incoming request
 * @param params Contains the tripId parameter
 */
export async function GET(request: NextRequest, { params }: { params: { tripId: string } }) {
  const { tripId } = params;

  // Validate trip ID
  if (!tripId) {
    return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
  }

  try {
    const supabase = await createRouteHandlerClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a member of this trip
    const { data: membershipData, error: membershipError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select('role, is_active')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    // Not a member or error fetching membership
    if (membershipError || !membershipData) {
      // Check if trip is public
      const { data: trip, error: tripError } = await supabase
        .from(TABLES.TRIPS)
        .select('is_public')
        .eq('id', tripId)
        .single();

      if (tripError || !trip) {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
      }

      if (trip.is_public) {
        // Public trips can be viewed by anyone
        return NextResponse.json({
          role: 'viewer',
          is_active: true,
          permissions: {
            view: true,
            edit: false,
            manage: false,
            invite: false,
          },
        });
      }

      // Not a public trip and not a member
      return NextResponse.json({ error: 'Not a member of this trip' }, { status: 403 });
    }

    // Validate membership data using type guard
    if (!isTripMembership(membershipData)) {
      return NextResponse.json({ error: 'Invalid membership data' }, { status: 500 });
    }

    // Inactive members lose their permissions
    if (!membershipData.is_active) {
      return NextResponse.json({
        role: membershipData.role,
        is_active: false,
        permissions: {
          view: false,
          edit: false,
          manage: false,
          invite: false,
        },
      });
    }

    // Determine permissions based on role
    const permissions = {
      view: true,
      edit: membershipData.role === 'admin' || membershipData.role === 'editor',
      manage: membershipData.role === 'admin',
      invite: membershipData.role === 'admin' || membershipData.role === 'editor',
    };

    return NextResponse.json({
      role: membershipData.role,
      is_active: true,
      permissions,
    });
  } catch (error) {
    console.error('Error getting permissions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get permissions';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
