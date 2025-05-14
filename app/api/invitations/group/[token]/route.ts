import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import type { Database } from '@/utils/constants/database.types';

// --- Types ---
interface InvitationDetailsResponse {
  invitation: {
    id: string;
    token: string;
    expiresAt: string;
    inviter: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
    group: {
      id: string;
      name: string;
      description: string | null;
      members: Array<{
        id: string;
        name: string;
        avatarUrl: string | null;
      }>;
    };
    existingUser: boolean;
  };
}

interface ErrorResponse {
  error: string;
  code?: string;
  success: false;
}

// GET /api/invitations/group/[token] - Get group invitation details by token
export async function GET(request: Request, { params }: { params: { token: string } }) {
  try {
    const token = params.token;
    if (!token) {
      return NextResponse.json({ error: 'Invalid group invitation token' }, { status: 400 });
    }

    const supabase = await createRouteHandlerClient();

    // Get invitation details
    const { data: invitation, error } = await supabase
      .from('invitations')
      .select(
        'id, token, expires_at, group_id, inviter_id, inviter:profiles!inviter_id(id, name, avatar_url)'
      )
      .eq('token', token)
      .eq('type', 'group')
      .single();

    if (error || !invitation) {
      console.error('Error fetching group invitation:', error);
      return NextResponse.json({ error: 'Group invitation not found or expired' }, { status: 404 });
    }

    // Defensive: check required fields
    if (
      typeof invitation.id !== 'number' ||
      !invitation.token ||
      !invitation.group_id ||
      !invitation.expires_at
    ) {
      return NextResponse.json({ error: 'Malformed invitation record' }, { status: 500 });
    }

    // Check if invitation is expired
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < now) {
      return NextResponse.json({ error: 'Group invitation has expired' }, { status: 404 });
    }

    // Get group details
    const groupId = invitation?.group_id || '';
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, name, description')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      console.error('Error fetching group:', groupError);
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Get group members
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('*, profiles(*)')
      .eq('group_id', groupId)
      .eq('status', 'active')
      .limit(6);

    if (membersError) {
      console.error('Error fetching group members:', membersError);
    }

    // Check if user is already logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Format the response
    const formattedMembers = (members || []).map((member: any) => ({
      id: member.id || member.user_id,
      name: member.profiles?.name || 'Unknown',
      avatarUrl: member.profiles?.avatar_url || null,
    }));

    const formattedInvitation = {
      id: invitation.id,
      token: invitation.token,
      expiresAt: invitation.expires_at,
      inviter: {
        id: invitation.inviter_id,
        name:
          invitation.inviter &&
          typeof invitation.inviter === 'object' &&
          'name' in invitation.inviter
            ? (invitation.inviter as any).name
            : 'Unknown',
        avatarUrl:
          invitation.inviter &&
          typeof invitation.inviter === 'object' &&
          'avatar_url' in invitation.inviter
            ? (invitation.inviter as any).avatar_url
            : null,
      },
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        members: formattedMembers,
      },
      existingUser: !!user,
    };

    return NextResponse.json({ invitation: formattedInvitation });
  } catch (err: any) {
    console.error('Error processing group invitation request:', err);
    return NextResponse.json({ error: 'Failed to process group invitation' }, { status: 500 });
  }
}
