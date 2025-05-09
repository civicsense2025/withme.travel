import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/database';

// GET /api/invitations/group/[token] - Get group invitation details by token
export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    if (!token) {
      return NextResponse.json(
        { error: 'Invalid group invitation token' },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();

    // Get invitation details
    const { data: invitation, error } = await supabase
      .from(TABLES.INVITATIONS)
      .select('*, inviter:profiles!inviter_id(*)')
      .eq('token', token)
      .eq('type', 'group')
      .single();

    if (error || !invitation) {
      console.error('Error fetching group invitation:', error);
      return NextResponse.json(
        { error: 'Group invitation not found or expired' },
        { status: 404 }
      );
    }

    // Check if invitation is expired
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < now) {
      return NextResponse.json(
        { error: 'Group invitation has expired' },
        { status: 404 }
      );
    }

    // Get group details
    const { data: group, error: groupError } = await supabase
      .from(TABLES.GROUPS)
      .select('id, name, description')
      .eq('id', invitation.group_id)
      .single();

    if (groupError || !group) {
      console.error('Error fetching group:', groupError);
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Get group members
    const { data: members, error: membersError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('*, profiles(*)')
      .eq('group_id', invitation.group_id)
      .eq('status', 'active')
      .limit(6);

    if (membersError) {
      console.error('Error fetching group members:', membersError);
    }

    // Check if user is already logged in
    const { data: { user } } = await supabase.auth.getUser();
    
    // Format the response
    const formattedMembers = (members || []).map(member => ({
      id: member.id || member.user_id,
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
    return NextResponse.json(
      { error: 'Failed to process group invitation' },
      { status: 500 }
    );
  }
} 