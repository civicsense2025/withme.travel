import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { checkTripAccess } from '@/lib/trip-access';
import { TRIP_ROLES } from '@/utils/constants/status';
import { TABLES } from '@/utils/constants/tables';
import { Database } from '@/types/database.types';

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

// Define access request types
interface UserProfile {
  name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface AccessRequest {
  id: string;
  user_id: string;
  message: string | null;
  created_at: string;
  user: UserProfile | null;
}

// Define table names directly
const TRIP_MEMBERS_TABLE = TABLES.TRIP_MEMBERS;
const PERMISSION_REQUESTS_TABLE = TABLES.PERMISSION_REQUESTS;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const supabase = await createRouteHandlerClient();

    // Check if user is authenticated using getUser
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          success: false,
        } as ErrorResponse,
        { status: 401 }
      );
    }

    // Check if user is an admin of this trip
    const { data: membership, error: membershipError } = await supabase
      .from(TRIP_MEMBERS_TABLE)
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership || membership.role !== TRIP_ROLES.ADMIN) {
      return NextResponse.json(
        {
          error: "You don't have permission to view access requests",
          success: false,
        } as ErrorResponse,
        { status: 403 }
      );
    }

    // Fetch all pending access requests for this trip
    const { data, error } = await supabase
      .from(PERMISSION_REQUESTS_TABLE)
      .select(`id, user_id, message, created_at, user:user_id (name, email, avatar_url)`)
      .eq('trip_id', tripId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching access requests:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch access requests',
          success: false,
        } as ErrorResponse,
        { status: 500 }
      );
    }

    // Type assertion pattern: unknown first, then apply the expected type
    const accessRequests: AccessRequest[] = data as unknown as AccessRequest[];

    return NextResponse.json({
      data: accessRequests,
      success: true,
    } as SuccessResponse<AccessRequest[]>);
  } catch (error: any) {
    console.error('Error fetching access requests:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        success: false,
      } as ErrorResponse,
      { status: 500 }
    );
  }
}
