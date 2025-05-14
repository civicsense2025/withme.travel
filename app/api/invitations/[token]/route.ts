import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { Database } from '@/utils/constants/database.types';

interface ProfileData {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
}

interface MemberWithProfile {
  id: string;
  user_id: string;
  profile?: {
    full_name?: string | null;
    avatar_url?: string | null;
  };
}

// --- Types ---
interface InvitationDetailsResponse {
  invitation: any;
  success: true;
}

interface ErrorResponse {
  error: string;
  code?: string;
  success: false;
}

// Define the invitation type
interface Invitation {
  id: string | number; // Support both types since Supabase might return either
  token: string;
  expires_at: string;
  inviter_id: string;
  trip_id: string;
  type: string;
}

// Define the trip type
interface Trip {
  id: string;
  name: string;
  cover_image_url: string | null;
}

// Define the member type
interface Member {
  id: string;
  user_id: string;
}

// GET /api/invitations/[token] - Get invitation details by token
export async function GET(request: Request, { params }: { params: { token: string } }) {
  try {
    const token = params.token;
    if (!token) {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 400 });
    }

    const supabase = await createRouteHandlerClient();

    // Get invitation details - use direct table name as string for Supabase
    const { data: rawInvitationData, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .eq('type', 'trip')
      .single();

    if (error || !rawInvitationData) {
      console.error('Error fetching invitation:', error);
      return NextResponse.json({ error: 'Invitation not found or expired' }, { status: 404 });
    }

    // Type assertion for invitation data - use double casting with unknown
    const invitation = rawInvitationData as unknown as Invitation;

    // Fetch inviter profile separately
    const { data: rawInviterProfile, error: inviterError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', invitation.inviter_id)
      .single();

    // Type assertion for profile data
    const inviterProfile: ProfileData | null =
      !inviterError && rawInviterProfile ? (rawInviterProfile as unknown as ProfileData) : null;

    if (inviterError) {
      console.error('Error fetching inviter profile:', inviterError);
      // Non-fatal error, continue with null inviter
    }

    // Check if invitation is expired
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < now) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 404 });
    }

    // Get trip details with string ID
    const tripId = String(invitation.trip_id);
    const { data: rawTripData, error: tripError } = await supabase
      .from('trips')
      .select('id, name, cover_image_url')
      .eq('id', tripId)
      .single();

    if (tripError || !rawTripData) {
      console.error('Error fetching trip:', tripError);
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Type assertion for trip data
    const trip = rawTripData as unknown as Trip;

    // Get trip members with their profiles
    const { data: rawMembersData, error: membersError } = await supabase
      .from('trip_members')
      .select('id, user_id')
      .eq('trip_id', tripId)
      .eq('status', 'active')
      .limit(6);

    // Type assertion for members data
    const members: Member[] = rawMembersData ? (rawMembersData as unknown as Member[]) : [];

    let memberProfiles: ProfileData[] = [];
    if (members && members.length > 0) {
      // Get profiles for all members in a separate query
      // Filter out any null user_ids before passing to the query
      const userIds = members.map((member) => member.user_id).filter(Boolean);

      if (userIds.length > 0) {
        const { data: rawProfilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        if (!profilesError && rawProfilesData) {
          // Type assertion for profiles data
          memberProfiles = rawProfilesData as unknown as ProfileData[];
        } else {
          console.error('Error fetching member profiles:', profilesError);
        }
      }
    }

    // Check if user is already logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Format the response
    const formattedMembers = members.map((member) => {
      const profile = memberProfiles.find((p) => p.id === member.user_id);
      return {
        id: member.id,
        name: profile?.full_name || 'Unknown',
        avatarUrl: profile?.avatar_url || null,
      };
    });

    const formattedInvitation = {
      id: String(invitation.id), // Convert to string for consistency
      token: invitation.token,
      expiresAt: invitation.expires_at,
      inviter: {
        id: inviterProfile?.id || null,
        name: inviterProfile?.full_name || 'Unknown',
        avatarUrl: inviterProfile?.avatar_url || null,
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
    return NextResponse.json({ error: 'Failed to process invitation' }, { status: 500 });
  }
}
