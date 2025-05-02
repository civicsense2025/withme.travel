import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from 'next/server';
import { TABLES, FIELDS, ENUMS } from "@/utils/constants/database";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;

  try {
    if (!tripId) {
      return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
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
      .from(TABLES.PROFILES)
      .select(FIELDS.PROFILES.IS_ADMIN)
      .eq(FIELDS.PROFILES.ID, user.id)
      .single();

    if (profileError || !userProfile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if the user is a member of this trip
    const { data: member, error: memberError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select(FIELDS.TRIP_MEMBERS.ROLE)
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(FIELDS.TRIP_MEMBERS.USER_ID, user.id)
      .single();

    if (memberError) {
      return NextResponse.json({ error: 'Failed to check membership' }, { status: 500 });
    }

    // Get all members of the trip
    const { data: members, error: membersError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select(`${FIELDS.COMMON.ID}, ${FIELDS.TRIP_MEMBERS.ROLE}`)
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId);

    if (membersError) {
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }

    // Find members with invalid roles
    const membersToFix = members.filter((member) => {
      // Check for roles that don't match our expected values
      return ![
        ENUMS.TRIP_ROLES.ADMIN,
        ENUMS.TRIP_ROLES.EDITOR,
        ENUMS.TRIP_ROLES.CONTRIBUTOR,
        ENUMS.TRIP_ROLES.VIEWER,
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
        .from(TABLES.TRIP_MEMBERS)
        .update({ [FIELDS.TRIP_MEMBERS.ROLE]: ENUMS.TRIP_ROLES.VIEWER })
        .eq(FIELDS.COMMON.ID, member.id);
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
