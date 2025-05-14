import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

// Define type for trip roles
export type TripRole = 'admin' | 'editor' | 'contributor' | 'viewer';

// Define constants directly
const TRIP_ROLES = {
  ADMIN: 'admin' as TripRole,
  EDITOR: 'editor' as TripRole,
  CONTRIBUTOR: 'contributor' as TripRole,
  VIEWER: 'viewer' as TripRole,
};

// Define table names as string literals
const TRIPS_TABLE = 'trips';
const TRIP_MEMBERS_TABLE = 'trip_members';

// Define FIELDS locally to avoid import errors
const FIELDS = {
  TRIPS: {
    ID: 'id',
    CREATED_BY: 'created_by',
  },
  TRIP_MEMBERS: {
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
    ROLE: 'role',
  },
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, find all trips created by this user
    const { data: userTripsRaw, error: tripsError } = await supabase
      .from(TRIPS_TABLE)
      .select('id, title, created_by')
      .eq('created_by', user.id);

    if (tripsError) {
      console.error('[fix-membership] Error fetching trips:', tripsError);
      return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
    }

    if (!userTripsRaw || userTripsRaw.length === 0) {
      return NextResponse.json({ fixed: 0, message: 'No trips found' });
    }

    let fixedCount = 0;
    if (Array.isArray(userTripsRaw)) {
      for (const trip of userTripsRaw as any[]) {
        if (!trip || typeof trip !== 'object' || typeof trip.id !== 'string') {
          continue;
        }
        // Now trip is safe to use as { id: string }
        // Check if there's a membership record for this user and trip
        const { data: membershipRecord, error: membershipError } = await supabase
          .from(TRIP_MEMBERS_TABLE)
          .select('id')
          .eq('trip_id', trip.id)
          .eq('user_id', user.id)
          .single();

        if (membershipError && membershipError.code !== 'PGRST116') {
          console.error(
            `[fix-membership] Error checking membership for trip ${trip.id}:`,
            membershipError
          );
          continue;
        }

        // If no membership record exists, create one
        if (!membershipRecord) {
          // Only allowed values for role: 'admin', 'editor', 'contributor', 'viewer' (see types/database.types.ts)
          const { error: insertError } = await supabase.from(TRIP_MEMBERS_TABLE).insert({
            trip_id: trip.id,
            user_id: user.id,
            role: TRIP_ROLES.ADMIN,
            status: 'confirmed',
          });

          if (insertError) {
            console.error(
              `[fix-membership] Error creating membership for trip ${trip.id}:`,
              insertError
            );
            continue;
          }

          fixedCount++;
        }
      }
    }

    return NextResponse.json({
      fixed: fixedCount,
      message:
        fixedCount > 0
          ? `Fixed ${fixedCount} trips with missing membership records`
          : 'No trips needed fixing',
    });
  } catch (error) {
    console.error('[fix-membership] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --- POST Handler --- //
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createRouteHandlerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Implementation for POST handler would go here
    return NextResponse.json(
      {
        message: 'POST endpoint not fully implemented yet',
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('[fix-membership] Unexpected error in POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
