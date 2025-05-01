import { createSupabaseServerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { DB_TABLES, DB_FIELDS, DB_ENUMS } from '@/utils/constants/database';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;

  try {
    const supabase = await createSupabaseServerClient();
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
      .from(DB_TABLES.TRIP_MEMBERS)
      .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
      .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, user.id)
      .single();

    if (membershipError || !membership || ![DB_ENUMS.TRIP_ROLES.ADMIN].includes(membership.role)) {
      return NextResponse.json(
        { error: "You don't have permission to invite members" },
        { status: 403 }
      );
    }

    // Check if trip exists
    const { data: trip, error: tripError } = await supabase
      .from(DB_TABLES.TRIPS)
      .select(DB_FIELDS.TRIPS.NAME)
      .eq(DB_FIELDS.TRIPS.ID, tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from(DB_TABLES.PROFILES)
      .select(DB_FIELDS.PROFILES.ID)
      .eq(DB_FIELDS.PROFILES.EMAIL, email)
      .single();

    let userId = existingUser?.id;

    // If user doesn't exist, create a placeholder profile
    if (!userId) {
      userId = uuidv4();
      await supabase.from(DB_TABLES.PROFILES).insert({
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
      .from(DB_TABLES.TRIP_MEMBERS)
      .select('id')
      .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, userId)
      .single();

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member of this trip' }, { status: 400 });
    }

    // Create invitation
    const inviteToken = uuidv4();

    // Store the invitation in the invitations table
    await supabase.from(DB_TABLES.INVITATIONS).insert({
      trip_id: tripId,
      email: email,
      invited_by: user.id,
      token: inviteToken,
      role: DB_ENUMS.TRIP_ROLES.CONTRIBUTOR,
    });

    // Add user as a pending member
    await supabase.from(DB_TABLES.TRIP_MEMBERS).insert({
      trip_id: tripId,
      user_id: userId,
      role: DB_ENUMS.TRIP_ROLES.CONTRIBUTOR,
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
