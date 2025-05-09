import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/database';
import { cookies } from 'next/headers';

interface ProfileData {
  id: string;
  full_name?: string;
  avatar_url?: string;
}

interface MemberData {
  id: string;
  profiles?: ProfileData;
}

// GET /api/invitations/[token] - Get invitation details by token
export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    if (!token) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();

    // Get invitation details
    const { data: invitation, error } = await supabase
      .from(TABLES.INVITATIONS)
      .select('*, inviter:profiles!inviter_id(*)')
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
        { status: 404 }
      );
    }

    // Get trip details
    const { data: trip, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select('id, name, cover_image_url')
      .eq('id', invitation.trip_id)
      .single();

    if (tripError || !trip) {
      console.error('Error fetching trip:', tripError);
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Get trip members
    const { data: members, error: membersError } = await supabase
      .from(TABLES.MEMBERS)
      .select('*, profiles(*)')
      .eq('trip_id', invitation.trip_id)
      .eq('status', 'active')
      .limit(6);

    if (membersError) {
      console.error('Error fetching members:', membersError);
    }

    // Check if user is already logged in
    const { data: { user } } = await supabase.auth.getUser();
    
    // Format the response
    const formattedMembers = (members || []).map((member: MemberData) => ({
      id: member.id,
      name: member.profiles?.full_name || 'Unknown',
      avatarUrl: member.profiles?.avatar_url || null,
    }));

    const formattedInvitation = {
      id: invitation.id,
      token: invitation.token,
      expiresAt: invitation.expires_at,
      inviter: {
        id: invitation.inviter.id,
        name: invitation.inviter.full_name || 'Unknown',
        avatarUrl: invitation.inviter.avatar_url || null,
      },
      trip: {
        id: trip.id,
        name: trip.name,
        coverUrl: trip.cover_image_url,
        members: formattedMembers,
      },
      existingUser: !!user,
    };

    return NextResponse.json({ invitation: formattedInvitation });
  } catch (err: any) {
    console.error('Error processing invitation request:', err);
    return NextResponse.json(
      { error: 'Failed to process invitation' },
      { status: 500 }
    );
  }
}
