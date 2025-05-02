import { createServerSupabaseClient } from "@/utils/supabase/server";
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { TABLES, FIELDS, ENUMS } from "@/utils/constants/database";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;

  try {
    const supabase = await createServerSupabaseClient();
    const { email } = await request.json();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to invite (is admin or owner)
    const { data: membership, error: membershipError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select(FIELDS.TRIP_MEMBERS.ROLE)
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(FIELDS.TRIP_MEMBERS.USER_ID, user.id)
      .single();

    if (membershipError || !membership || ![ENUMS.TRIP_ROLES.ADMIN].includes(membership.role)) {
      return NextResponse.json(
        { error: "You don't have permission to invite members" },
        { status: 403 }
      );
    }

    // Check if trip exists
    const { data: trip, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select(FIELDS.TRIPS.NAME)
      .eq(FIELDS.TRIPS.ID, tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from(TABLES.PROFILES)
      .select(FIELDS.PROFILES.ID)
      .eq(FIELDS.PROFILES.EMAIL, email)
      .single();

    let userId = existingUser?.id;

    // If user doesn't exist, create a placeholder profile
    if (!userId) {
      userId = uuidv4();
      await supabase.from(TABLES.PROFILES).insert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url,
        username: user.user_metadata?.username,
        updated_at: new Date().toISOString(),
      });
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select('id')
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(FIELDS.TRIP_MEMBERS.USER_ID, userId)
      .single();

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member of this trip' }, { status: 400 });
    }

    // Create invitation
    const inviteToken = uuidv4();

    // Store the invitation in the invitations table
    await supabase.from(TABLES.INVITATIONS).insert({
      trip_id: tripId,
      email: email,
      invited_by: user.id,
      token: inviteToken,
      role: ENUMS.TRIP_ROLES.CONTRIBUTOR,
    });

    // Add user as a pending member
    await supabase.from(TABLES.TRIP_MEMBERS).insert({
      trip_id: tripId,
      user_id: userId,
      role: ENUMS.TRIP_ROLES.CONTRIBUTOR,
      status: 'pending',
      invited_by: user.id,
    });

    // Generate invitation URL with token
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${inviteToken}`;

    // In a real app, you would send an email here with the inviteUrl
    console.log(`Invitation URL for ${email}: ${inviteUrl}`);

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${email}`,
      inviteUrl,
    });
  } catch (error: any) {
    console.error('Error inviting member:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
