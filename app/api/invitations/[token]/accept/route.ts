import { createRouteHandlerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import plunk from '@/app/lib/plunk';
import { TABLES, ENUMS } from '@/utils/constants/database';

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
): Promise<NextResponse> {
  try {
    const token = params.token;
    if (!token) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();

    // Get the current logged in user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to accept an invitation' },
        { status: 401 }
      );
    }

    // Get invitation details
    const { data: invitation, error } = await supabase
      .from(TABLES.INVITATIONS)
      .select('*')
      .eq('token', token)
      .single();

    if (error || !invitation) {
      console.error('Error fetching invitation:', error);
      return NextResponse.json(
        { error: 'Invitation not found or expired' },
        { status: 404 }
      );
    }

    // Check if invitation is expired
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < now) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    // Check if user is already a member of the trip
    const { data: existingMember, error: memberError } = await supabase
      .from(TABLES.MEMBERS)
      .select('id')
      .eq('trip_id', invitation.trip_id)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      // User is already a member, mark invitation as used
      await supabase
        .from(TABLES.INVITATIONS)
        .update({ used: true, accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      return NextResponse.json({
        message: 'You are already a member of this trip',
        tripId: invitation.trip_id
      });
    }

    // Get trip info
    const { data: trip, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select('id, name')
      .eq('id', invitation.trip_id)
      .single();

    if (tripError || !trip) {
      console.error('Error fetching trip:', tripError);
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Add user to trip members
    const { data: newMember, error: addError } = await supabase
      .from(TABLES.MEMBERS)
      .insert({
        trip_id: invitation.trip_id,
        user_id: user.id,
        role: ENUMS.TRIP_ROLES.VIEWER, // Default role for invited members
        status: 'active'
      })
      .select('id')
      .single();

    if (addError) {
      console.error('Error adding member:', addError);
      return NextResponse.json(
        { error: 'Failed to add you to the trip' },
        { status: 500 }
      );
    }

    // Update invitation as used
    await supabase
      .from(TABLES.INVITATIONS)
      .update({ used: true, accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    // Create a notification for the trip creator
    await supabase
      .from(TABLES.NOTIFICATIONS)
      .insert({
        user_id: invitation.inviter_id,
        type: 'trip_invitation_accepted',
        data: {
          trip_id: invitation.trip_id,
          trip_name: trip.name,
          invitation_id: invitation.id,
          member_id: user.id
        },
        read: false
      });

    // Update referral tracking if this is a new user
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', user.id)
      .single();

    // If user was created recently (within last hour), consider this a referral
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (profile && new Date(profile.created_at) > oneHourAgo) {
      // Update the referred_by field
      await supabase
        .from('profiles')
        .update({
          referred_by: invitation.invited_by,
        })
        .eq('id', user.id);
    }

    // After updating invitation status and referral tracking
    try {
      if (typeof user.email === 'string') {
        await plunk.events.track({
          event: 'user_invited_to_trip',
          email: user.email,
          data: {
            invitee_name: user.email.split('@')[0],
            inviter_name: invitation.invited_by,
            trip_name: invitation.trip_id,
            invitation_link: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/invite/${token}`,
          },
        });
      }
    } catch (plunkError) {
      console.error('Failed to trigger Plunk trip invitation event:', plunkError);
    }

    return NextResponse.json({
      message: 'Successfully joined trip',
      tripId: invitation.trip_id,
      memberId: newMember.id
    });
  } catch (err: any) {
    console.error('Error accepting invitation:', err);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
