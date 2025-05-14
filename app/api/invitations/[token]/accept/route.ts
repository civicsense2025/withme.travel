import { createRouteHandlerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import plunk from '@/app/lib/plunk';
import { TABLES, ENUMS } from '@/utils/constants/tables';
import type { Tables } from '@/types/database.types';

// --- Types ---
interface AcceptInvitationResponse {
  message: string;
  tripId?: string;
  memberId?: string;
  success: true;
}

interface ErrorResponse {
  error: string;
  code?: string;
  success: false;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
): Promise<NextResponse> {
  try {
    const token = params.token;
    if (!token) {
      return NextResponse.json({ error: 'Missing invitation token' }, { status: 400 });
    }

    const supabase = await createRouteHandlerClient();

    // Get the current logged in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

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
      .eq('token', token ?? '')
      .maybeSingle();

    if (error || !invitation) {
      console.error('Error fetching invitation:', error);
      return NextResponse.json({ error: 'Invitation not found or expired' }, { status: 404 });
    }

    // Check if invitation is expired
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < now) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 });
    }

    // Check if invitation.trip_id is present
    if (!invitation.trip_id) {
      return NextResponse.json({ error: 'Invitation is missing trip ID' }, { status: 400 });
    }
    // Check if inviter_id is present for notifications
    if (!invitation.inviter_id) {
      return NextResponse.json({ error: 'Invitation is missing inviter ID' }, { status: 400 });
    }
    // Check if trip_id is present for trip lookup
    // Also use for trip_members check
    const { data: existingMember, error: memberError } = await supabase
      .from('trip_members')
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
        tripId: invitation.trip_id,
      });
    }

    // Check if trip_id is present for trip lookup
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, name')
      .eq('id', invitation.trip_id)
      .single();
    if (tripError || !trip) {
      console.error('Error fetching trip:', tripError);
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }
    // Add user to trip members
    const { data: newMember, error: addError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .insert({
        trip_id: invitation.trip_id,
        user_id: user.id,
        role: ENUMS.TRIP_ROLES.VIEWER as 'viewer',
        status: 'active',
      })
      .select('id')
      .single();
    if (addError) {
      console.error('Error adding member:', addError);
      return NextResponse.json({ error: 'Failed to add you to the trip' }, { status: 500 });
    }
    // Update invitation as used
    await supabase
      .from(TABLES.INVITATIONS)
      .update({ used: true, accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);
    // Create a notification for the trip creator if inviter_id is present
    if (typeof invitation.inviter_id === 'string' && invitation.inviter_id) {
      await supabase.from('notifications').insert({
        recipient_id: invitation.inviter_id,
        content: JSON.stringify({
          trip_id: invitation.trip_id ?? '',
          trip_name: trip.name ?? '',
          invitation_id: invitation.id,
          member_id: user.id,
        }),
      } as any);
    }
    // Update referral tracking if this is a new user
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', user.id)
      .single();
    // If user was created recently (within last hour), consider this a referral
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (profile && profile.created_at && new Date(profile.created_at) > oneHourAgo) {
      // Only update referred_by if it exists in your schema
      // await supabase.from('profiles').update({ referred_by: invitation.invited_by }).eq('id', user.id);
    }
    // After updating invitation status and referral tracking
    try {
      if (typeof user.email === 'string') {
        await plunk.events.track({
          event: 'user_invited_to_trip',
          email: user.email,
          data: {
            invitee_name: user.email.split('@')[0],
            inviter_name: invitation.invited_by ?? '',
            trip_name: invitation.trip_id ?? '',
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
      memberId: newMember.id,
    });
  } catch (err: any) {
    console.error('Error accepting invitation:', err);
    return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 });
  }
}
