import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TRIP_ROLES } from '@/utils/constants/status';
import { z } from 'zod';
import { Database } from '@/types/database.types';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; memberId: string }> }
) {
  try {
    const { tripId, memberId } = await params;
    const supabase = await createRouteHandlerClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an Admin of this trip
    const { data: caller, error: callerError } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .eq('role', TRIP_ROLES.ADMIN)
      .maybeSingle();

    if (callerError || !caller) {
      return NextResponse.json({ error: 'Only admins can remove members' }, { status: 403 });
    }

    // Fetch the requested member's details
    const { data: memberToDelete, error: memberError } = await supabase
      .from('trip_members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (memberError || !memberToDelete) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Delete member
    const { error } = await supabase
      .from('trip_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; memberId: string }> }
) {
  try {
    const { tripId, memberId } = await params;
    const supabase = await createRouteHandlerClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if caller is an admin of this trip
    const { data: callerMember, error: callerError } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    if (callerError || !callerMember || callerMember.role !== TRIP_ROLES.ADMIN) {
      return NextResponse.json({ error: 'Only admins can update member roles' }, { status: 403 });
    }

    // Get update data
    const { role } = await request.json();

    // Validate role using allowed values
    const validRoles = [TRIP_ROLES.ADMIN, TRIP_ROLES.EDITOR, TRIP_ROLES.CONTRIBUTOR, TRIP_ROLES.VIEWER];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    // Get member to update
    const { data: memberToUpdate, error: memberError } = await supabase
      .from('trip_members')
      .select()
      .eq('id', memberId)
      .eq('trip_id', tripId)
      .maybeSingle();

    if (memberError || !memberToUpdate) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // If downgrading from admin, check if there's at least one other admin
    if (memberToUpdate.role === TRIP_ROLES.ADMIN && role !== TRIP_ROLES.ADMIN) {
      // Count admins
      const { count, error: countError } = await supabase
        .from('trip_members')
        .select('*', { count: 'exact', head: true })
        .eq('trip_id', tripId)
        .eq('role', TRIP_ROLES.ADMIN);

      if (countError) {
        return NextResponse.json({ error: countError.message }, { status: 500 });
      }

      if (count === 1) {
        return NextResponse.json({ error: 'Cannot remove the last admin' }, { status: 400 });
      }
    }

    // Update member role
    const { data, error } = await supabase
      .from('trip_members')
      .update({ role })
      .eq('id', memberId)
      .select(`
        *,
        user:user_id(id, name, email, avatar_url)
      `);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Ensure data is an array and return the first element
    const updatedMember = Array.isArray(data) ? data[0] : data;

    return NextResponse.json({ member: updatedMember });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
