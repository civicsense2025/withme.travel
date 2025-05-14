import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { checkTripAccess } from '@/lib/trip-access';
import { EmailService } from '@/lib/services/email-service';
import { TRIP_ROLES } from '@/utils/constants/status';
import { z } from 'zod';
import { Database } from '@/types/database.types';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { TABLES } from '@/utils/constants/tables';

// Basic schema for invitation body validation
const inviteSchema = z.object({
  emails: z.array(z.string().email()),
  message: z.string().optional().nullable(),
});

export async function POST(request: NextRequest, { params }: { params: { tripId: string } }) {
  const supabase = await createRouteHandlerClient();

  // Get the current user to check permissions
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const tripId = params.tripId;

    // Validate trip exists and user is a member with admin privileges
    const { data: memberData, error: memberError } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !memberData) {
      return NextResponse.json(
        { error: 'You do not have permission to invite members to this trip' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const result = inviteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }

    const { emails, message } = result.data;

    // Check if some emails already have invitations
    const { data: existingInvites, error: inviteError } = await supabase
      .from('invitations')
      .select('email')
      .eq('trip_id', tripId)
      .in('email', emails);

    if (inviteError) {
      console.error('Error checking existing invitations:', inviteError);
      return NextResponse.json({ error: 'Error checking existing invitations' }, { status: 500 });
    }

    // Filter out emails that already have invitations
    const existingEmails = existingInvites?.map((invite) => invite.email) || [];
    const newEmails = emails.filter((email) => !existingEmails.includes(email));

    if (newEmails.length === 0) {
      return NextResponse.json(
        { message: 'All emails already have pending invitations' },
        { status: 200 }
      );
    }

    // Create invitations for each email
    const invitations = newEmails.map((email) => ({
      trip_id: tripId,
      inviter_id: user.id,
      email,
      token: crypto.randomUUID(),
      message: message || null,
      type: 'trip' as const,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    }));

    const { data: createdInvites, error: createError } = await supabase
      .from('invitations')
      .insert(invitations)
      .select();

    if (createError) {
      console.error('Error creating invitations:', createError);
      return NextResponse.json({ error: 'Failed to create invitations' }, { status: 500 });
    }

    // Return success with the newly created invitations
    return NextResponse.json({
      message: `Sent ${newEmails.length} invitation(s)`,
      invitations: createdInvites,
    });
  } catch (error) {
    console.error('Error sending invitations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
