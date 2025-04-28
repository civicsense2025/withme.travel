import { createSupabaseServerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { TRIP_ROLES, DB_TABLES, DB_FIELDS } from '@/utils/constants';

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
  request: Request,
  { params }: { params: { tripId: string } }
) {
  const tripId = params.tripId;
  const supabase = await createSupabaseServerClient();

  try {
    // First, get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
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
            role: null
          } 
        },
        { status: 200 }
      );
    }
    
    // Check if the user is a member of the trip
    const { data: membership, error: membershipError } = await supabase
      .from(DB_TABLES.TRIP_MEMBERS)
      .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
      .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, user.id)
      .single();
    
    if (membershipError && membershipError.code !== 'PGRST116') {
      console.error('Error fetching trip membership:', membershipError);
      return NextResponse.json(
        { error: 'Failed to check trip membership' },
        { status: 500 }
      );
    }
    
    // Check if user is the creator of the trip
    const { data: trip, error: tripError } = await supabase
      .from(DB_TABLES.TRIPS)
      .select(`${DB_FIELDS.TRIPS.CREATED_BY}, ${DB_FIELDS.TRIPS.IS_PUBLIC}`)
      .eq(DB_FIELDS.TRIPS.ID, tripId)
      .single();
    
    if (tripError) {
      if (tripError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Trip not found' },
          { status: 404 }
        );
      }
      
      console.error('Error fetching trip details:', tripError);
      return NextResponse.json(
        { error: 'Failed to fetch trip details' },
        { status: 500 }
      );
    }
    
    const role = membership?.role;
    const isCreator = trip.created_by === user.id;
    const isPublic = trip.is_public || false;
    
    // Determine permissions based on role and creator status
    const permissions: PermissionCheck = {
      canView: !!role || isCreator || isPublic,
      canEdit: !!role && [TRIP_ROLES.ADMIN, TRIP_ROLES.EDITOR].includes(role) || isCreator,
      canManage: !!role && [TRIP_ROLES.ADMIN].includes(role) || isCreator,
      canAddMembers: !!role && [TRIP_ROLES.ADMIN].includes(role) || isCreator,
      canDeleteTrip: isCreator,
      isCreator,
      role
    };
    
    return NextResponse.json({ permissions });
  } catch (error) {
    console.error('Unexpected error in trip permissions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 