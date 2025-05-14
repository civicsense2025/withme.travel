import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { TABLES, ENUMS } from '@/utils/constants/tables';
import type { Database } from '@/utils/constants/tables.types';

// --- Types ---
interface AcceptGroupInvitationResponse {
  message: string;
  groupId?: string;
  memberId?: string;
  success: true;
}

interface ErrorResponse {
  error: string;
  code?: string;
  success: false;
}

// POST /api/invitations/group/[token]/accept - Accept a group invitation
export async function POST(request: Request, { params }: { params: { token: string } }) {
  try {
    const token = params.token;
    if (!token) {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 400 });
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
      .eq('token', token)
      .eq('type', 'group')
      .single<Database['public']['Tables']['invitations']['Row']>();

    if (error || !invitation) {
      console.error('Error fetching invitation:', error);
      return NextResponse.json({ error: 'Invitation not found or expired' }, { status: 404 });
    }

    // Check if invitation is expired
    const now = new Date();
    if (!invitation?.expires_at) {
      return NextResponse.json({ error: 'Invitation missing expiration' }, { status: 400 });
    }
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < now) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 });
    }

    // Check if user is already a member of the group
    if (!invitation.group_id) {
      return NextResponse.json({ error: 'Invitation is missing group_id' }, { status: 400 });
    }
    const { data: existingMember, error: memberError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('id')
      .eq('group_id', invitation.group_id)
      .eq('user_id', user.id)
      .single<Database['public']['Tables']['group_members']['Row']>();

    if (existingMember) {
      // User is already a member, mark invitation as used
      await supabase
        .from(TABLES.INVITATIONS)
        .update({ used: true, accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      return NextResponse.json({
        message: 'You are already a member of this group',
        groupId: invitation.group_id,
        success: true,
      });
    }

    // Get group info
    const { data: group, error: groupError } = await supabase
      .from(TABLES.GROUPS)
      .select('id, name')
      .eq('id', invitation.group_id)
      .single<Database['public']['Tables']['groups']['Row']>();

    if (groupError || !group) {
      console.error('Error fetching group:', groupError);
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Add user to group members
    const { data: newMember, error: addError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .insert({
        group_id: invitation.group_id,
        user_id: user.id,
        role: 'member',
        status: 'active',
      })
      .select('id')
      .single<Database['public']['Tables']['group_members']['Row']>();

    if (addError) {
      console.error('Error adding member:', addError);
      return NextResponse.json({ error: 'Failed to add you to the group' }, { status: 500 });
    }

    // Update invitation as used
    await supabase
      .from(TABLES.INVITATIONS)
      .update({ used: true, accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    // Create a notification for the group creator
    /*
    const groupId = invitation.group_id;
    const invitationId = invitation.id;
    const inviterId = invitation.inviter_id;
    if (typeof inviterId === 'string') {
      await supabase.from('notifications').insert({
        user_id: inviterId,
        notification_type: 'group_invite',
        title: 'Group Invitation Accepted',
        content: JSON.stringify({ group_id: groupId, group_name: group?.name, invitation_id: invitationId, member_id: user.id }),
        read: false,
      });
    }
    */

    return NextResponse.json({
      message: 'Successfully joined group',
      groupId: invitation.group_id,
      memberId: newMember && 'id' in newMember ? newMember.id : undefined,
      success: true,
    });
  } catch (err: any) {
    console.error('Error accepting group invitation:', err);
    return NextResponse.json({ error: 'Failed to accept group invitation' }, { status: 500 });
  }
}
