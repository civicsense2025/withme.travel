import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { TABLES, ENUMS } from '@/utils/constants/database';

// POST /api/invitations/group/[token]/accept - Accept a group invitation
export async function POST(
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
      .eq('type', 'group')
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

    // Check if user is already a member of the group
    const { data: existingMember, error: memberError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('id')
      .eq('group_id', invitation.group_id)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      // User is already a member, mark invitation as used
      await supabase
        .from(TABLES.INVITATIONS)
        .update({ used: true, accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      return NextResponse.json({
        message: 'You are already a member of this group',
        groupId: invitation.group_id
      });
    }

    // Get group info
    const { data: group, error: groupError } = await supabase
      .from(TABLES.GROUPS)
      .select('id, name')
      .eq('id', invitation.group_id)
      .single();

    if (groupError || !group) {
      console.error('Error fetching group:', groupError);
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Add user to group members
    const { data: newMember, error: addError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .insert({
        group_id: invitation.group_id,
        user_id: user.id,
        role: ENUMS.GROUP_MEMBER_ROLES.MEMBER, // Default role for invited members
        status: 'active'
      })
      .select('id')
      .single();

    if (addError) {
      console.error('Error adding member:', addError);
      return NextResponse.json(
        { error: 'Failed to add you to the group' },
        { status: 500 }
      );
    }

    // Update invitation as used
    await supabase
      .from(TABLES.INVITATIONS)
      .update({ used: true, accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    // Create a notification for the group creator
    await supabase
      .from(TABLES.NOTIFICATIONS)
      .insert({
        user_id: invitation.inviter_id,
        type: 'group_invitation_accepted',
        data: {
          group_id: invitation.group_id,
          group_name: group.name,
          invitation_id: invitation.id,
          member_id: user.id
        },
        read: false
      });

    return NextResponse.json({
      message: 'Successfully joined group',
      groupId: invitation.group_id,
      memberId: newMember.id
    });
  } catch (err: any) {
    console.error('Error accepting group invitation:', err);
    return NextResponse.json(
      { error: 'Failed to accept group invitation' },
      { status: 500 }
    );
  }
} 