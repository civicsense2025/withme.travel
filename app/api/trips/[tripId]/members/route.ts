import { type NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import type { Database } from '@/types/database.types';

// Define API response types
interface SuccessResponse<T> {
  data: T;
  success: true;
}

interface ErrorResponse {
  error: string;
  code?: string;
  success: false;
}

// Define member-related types
interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  email: string | null;
  username: string | null;
}

interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  created_at: string;
  profiles: Profile | null;
  profile?: Profile | null; // For backwards compatibility
}

// Define table names directly as string literals
const TRIP_MEMBERS_TABLE = TABLES.TRIP_MEMBERS;

// Define database field constants to avoid linting issues
const FIELDS = {
  TRIP_MEMBERS: {
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
    ROLE: 'role',
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
): Promise<NextResponse> {
  try {
    // Must await params in Next.js 15
    const { tripId } = await params;

    // UUID validation to prevent database errors
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!tripId || !UUID_REGEX.test(tripId)) {
      return NextResponse.json(
        {
          error: 'Invalid trip ID format',
          success: false,
        } as ErrorResponse,
        { status: 400 }
      );
    }

    // Create Supabase client without await (it's not an async function)
    const supabase = await createRouteHandlerClient();

    // Get the auth session cookie directly
    const cookieHeader = request.headers.get('cookie') || '';
    if (!cookieHeader.includes('sb-') && !cookieHeader.includes('supabase-auth')) {
      console.error('Missing auth cookies in request:', cookieHeader.substring(0, 100)); // Log first 100 chars
      return NextResponse.json(
        {
          error: 'Auth session missing in cookies',
          success: false,
        } as ErrorResponse,
        { status: 401 }
      );
    }

    // Use getUser() for a more secure auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error in members route:', authError || 'No user found');
      console.log('Request headers:', Object.fromEntries(request.headers.entries()));
      return NextResponse.json(
        {
          error: 'Unauthorized',
          success: false,
        } as ErrorResponse,
        { status: 401 }
      );
    }

    // Check if this user is a member of the trip (for authorization)
    const { data: userMembership, error: membershipError } = await supabase
      .from(TRIP_MEMBERS_TABLE)
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (membershipError) {
      console.error('Error checking membership:', membershipError);
    }

    // If not a member, check if trip is public
    if (!userMembership) {
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('is_public, privacy_setting')
        .eq('id', tripId)
        .single();

      if (tripError) {
        console.error('Error checking trip privacy:', tripError);
        return NextResponse.json(
          {
            error: 'Failed to verify trip access',
            success: false,
          } as ErrorResponse,
          { status: 500 }
        );
      }

      // Only allow viewing members if trip is public
      if (!tripData?.is_public && tripData?.privacy_setting !== 'public') {
        return NextResponse.json(
          {
            error: 'Not authorized to view this trip',
            success: false,
          } as ErrorResponse,
          { status: 403 }
        );
      }
    }

    // Fetch trip members
    const { data, error } = await supabase
      .from(TRIP_MEMBERS_TABLE)
      .select(`*, profiles:profiles!trip_members_user_id_fkey(*)`)
      .eq('trip_id', tripId);

    if (error) {
      console.error('Error fetching members:', error);
      return NextResponse.json(
        {
          error: error.message,
          success: false,
        } as ErrorResponse,
        { status: 500 }
      );
    }

    // Map 'profiles' to both 'profile' and 'profiles' for compatibility
    const membersWithProfile = (data || []).map((member) => ({
      ...member,
      profile: member.profiles,
      profiles: member.profiles,
    })) as TripMember[];

    // Return with success property for consistent API response format
    return NextResponse.json({
      data: membersWithProfile,
      success: true,
    } as SuccessResponse<TripMember[]>);
  } catch (error) {
    console.error('API route error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
      } as ErrorResponse,
      { status: 500 }
    );
  }
}
