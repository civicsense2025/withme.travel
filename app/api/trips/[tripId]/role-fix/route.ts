import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { checkTripAccess } from '@/lib/trip-access';
// Direct table/field names used instead of imports
import { TRIP_ROLES } from '@/utils/constants/status';
import { Database } from '@/types/database.types';

// Define table names to avoid TypeScript errors
const TRIP_MEMBERS_TABLE = 'trip_members';
const PROFILES_TABLE = 'profiles';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const supabase = await createRouteHandlerClient();

  try {
    if (!tripId) {
      return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // IMPORTANT: In a real app, do proper admin verification here
    // This is a very basic check that would need to be improved
    const { data: userProfile, error: profileError } = await supabase
      .from(PROFILES_TABLE)
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if the user is a member of this trip
    const { data: member, error: memberError } = await supabase
      .from(TRIP_MEMBERS_TABLE)
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    if (memberError) {
      return NextResponse.json({ error: 'Failed to check membership' }, { status: 500 });
    }

    // Get all members of the trip
    const { data: members, error: membersError } = await supabase
      .from(TRIP_MEMBERS_TABLE)
      .select(`id, role`)
      .eq('trip_id', tripId);

    if (membersError) {
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }

    // Find members with invalid roles
    const membersToFix = members.filter((member) => {
      // Check for roles that don't match our expected values
      return ![
        TRIP_ROLES.ADMIN,
        TRIP_ROLES.EDITOR,
        TRIP_ROLES.CONTRIBUTOR,
        TRIP_ROLES.VIEWER,
      ].includes(member.role);
    });

    if (membersToFix.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No role update needed',
        currentRole: member?.role || null,
      });
    }

    // Fix roles (this is a simple example that sets invalid roles to viewer)
    const updatePromises = membersToFix.map((member) => {
      return supabase
        .from(TRIP_MEMBERS_TABLE)
        .update({ role: TRIP_ROLES.VIEWER })
        .eq('id', member.id);
    });

    const results = await Promise.all(updatePromises);
    const updateError = results.find((result) => result.error);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${membersToFix.length} invalid roles`,
      updated: membersToFix.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to fix roles',
        message: error.message,
      },
      { status: 500 }
    );
  }
}