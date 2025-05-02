import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { API_ROUTES } from '@/utils/constants/routes';
import { TABLES, FIELDS, ENUMS } from "@/utils/constants/database";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; memberId: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { tripId, memberId } = await params;

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an organizer of this trip
    const { data: organizer, error: organizerError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select()
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(FIELDS.TRIP_MEMBERS.USER_ID, session.user.id)
      .eq(FIELDS.TRIP_MEMBERS.ROLE, 'organizer')
      .maybeSingle();

    if (organizerError || !organizer) {
      return NextResponse.json({ error: 'Only organizers can remove members' }, { status: 403 });
    }

    // Check if caller is a member of this trip
    const { data: callerMember, error: callerError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select(FIELDS.TRIP_MEMBERS.ROLE)
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(FIELDS.TRIP_MEMBERS.USER_ID, session.user.id)
      .single();

    // Fetch the requested member's details
    const { data: memberToDelete, error: memberError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select('*')
      .eq(FIELDS.TRIP_MEMBERS.ID, memberId)
      .single();

    if (memberError || !memberToDelete) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Delete member
    const { error } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .delete()
      .eq(FIELDS.TRIP_MEMBERS.ID, memberId);

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
    const supabase = await createServerSupabaseClient();
    const { tripId, memberId } = await params;

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if caller is an admin of this trip
    const { data: callerMember, error: callerError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select(FIELDS.TRIP_MEMBERS.ROLE)
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(FIELDS.TRIP_MEMBERS.USER_ID, session.user.id)
      .single();

    if (callerError || !callerMember || callerMember.role !== 'organizer') {
      return NextResponse.json(
        { error: 'Only organizers can update member roles' },
        { status: 403 }
      );
    }

    // Get update data
    const { role } = await request.json();

    if (!role || (role !== 'organizer' && role !== 'member')) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Get member to update
    const { data: memberToUpdate, error: memberError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select()
      .eq(FIELDS.TRIP_MEMBERS.ID, memberId)
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .maybeSingle();

    if (memberError || !memberToUpdate) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // If downgrading from organizer, check if there's at least one other organizer
    if (memberToUpdate.role === 'organizer' && role === 'member') {
      // Count organizers
      const { count, error: countError } = await supabase
        .from(TABLES.TRIP_MEMBERS)
        .select('*', { count: 'exact', head: true })
        .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
        .eq(FIELDS.TRIP_MEMBERS.ROLE, 'organizer');

      if (countError) {
        return NextResponse.json({ error: countError.message }, { status: 500 });
      }

      if (count === 1) {
        return NextResponse.json({ error: 'Cannot downgrade the last organizer' }, { status: 400 });
      }
    }

    // Update member role
    const { data, error } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .update({ role })
      .eq(FIELDS.TRIP_MEMBERS.ID, memberId).select(`
        *,
        user:user_id(id, name, email, avatar_url)
      `);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ member: data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
