import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES, FIELDS } from '@/utils/constants/database';

// POST /api/trips/[tripId]/members/import
// Imports members from a linked Splitwise group to the trip
export async function POST(
  request: NextRequest, 
  context: { params: Promise<{ tripId: string }> }
) {
  const supabase = await createRouteHandlerClient();
  const { data, error: authError } = await supabase.auth.getUser();

  if (authError || !data.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tripId } = await context.params;
  if (!tripId) {
    return NextResponse.json({ error: 'Missing tripId parameter' }, { status: 400 });
  }

  let importData: {
    // New users to invite via email
    invitations?: Array<{ email: string; role?: string }>;
    // Existing users to add directly
    members?: Array<{ userId: string; role?: string }>;
  };

  try {
    importData = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Validate import data
  if (
    (!importData.invitations || importData.invitations.length === 0) &&
    (!importData.members || importData.members.length === 0)
  ) {
    return NextResponse.json(
      {
        error: 'No members to import. Please provide invitations and/or members.',
      },
      { status: 400 }
    );
  }

  try {
    // 1. Check if user has permission to manage this trip
    const { data: memberData, error: permissionError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select('role')
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(FIELDS.TRIP_MEMBERS.USER_ID, data.user.id)
      .maybeSingle();

    if (permissionError || !memberData) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Optional: Check if role allows adding members
    // const userRole = memberData.role
    // if (!['admin', 'owner'].includes(userRole)) {
    //   return NextResponse.json({ error: "You don't have permission to add members" }, { status: 403 })
    // }

    const results = {
      invitations: { sent: 0, failed: 0, errors: [] as string[] },
      members: { added: 0, failed: 0, errors: [] as string[] },
    };

    // 2. Process invitations for new users
    if (importData.invitations && importData.invitations.length > 0) {
      for (const invitation of importData.invitations) {
        try {
          // Validate email
          if (!invitation.email || !invitation.email.includes('@')) {
            results.invitations.failed++;
            results.invitations.errors.push(`Invalid email: ${invitation.email}`);
            continue;
          }

          // Set a default role if none provided
          const role = invitation.role || 'member';

          // Insert invitation record
          const { error: inviteError } = await supabase
            .from('trip_invitations') // Adjust table name if different
            .insert({
              trip_id: tripId,
              email: invitation.email.toLowerCase(),
              role,
              invited_by: data.user.id,
              created_at: new Date().toISOString(),
            });

          if (inviteError) {
            console.error(`Error creating invitation for ${invitation.email}:`, inviteError);
            results.invitations.failed++;
            results.invitations.errors.push(
              `Failed to invite ${invitation.email}: ${inviteError.message}`
            );
          } else {
            results.invitations.sent++;
            // Would trigger email notification here in a complete implementation
          }
        } catch (err: any) {
          console.error(`Error processing invitation for ${invitation.email}:`, err);
          results.invitations.failed++;
          results.invitations.errors.push(`Error processing ${invitation.email}: ${err.message}`);
        }
      }
    }

    // 3. Process direct additions for existing users
    if (importData.members && importData.members.length > 0) {
      for (const member of importData.members) {
        try {
          // Validate userId
          if (!member.userId) {
            results.members.failed++;
            results.members.errors.push(`Invalid userId: ${member.userId}`);
            continue;
          }

          // Set a default role if none provided
          const role = member.role || 'member';

          // Check if user already exists in trip
          const { count, error: checkError } = await supabase
            .from(TABLES.TRIP_MEMBERS)
            .select('*', { count: 'exact', head: true })
            .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
            .eq(FIELDS.TRIP_MEMBERS.USER_ID, member.userId);

          if (checkError) {
            console.error(`Error checking membership for ${member.userId}:`, checkError);
            results.members.failed++;
            results.members.errors.push(`Failed to check membership for ${member.userId}`);
            continue;
          }

          // Skip if already a member
          if (count && count > 0) {
            results.members.failed++;
            results.members.errors.push(`User ${member.userId} is already a member of this trip`);
            continue;
          }

          // Add user to trip
          const { error: addError } = await supabase.from(TABLES.TRIP_MEMBERS).insert({
            trip_id: tripId,
            user_id: member.userId,
            role,
            created_at: new Date().toISOString(),
          });

          if (addError) {
            console.error(`Error adding member ${member.userId}:`, addError);
            results.members.failed++;
            results.members.errors.push(`Failed to add ${member.userId}: ${addError.message}`);
          } else {
            results.members.added++;
          }
        } catch (err: any) {
          console.error(`Error processing member ${member.userId}:`, err);
          results.members.failed++;
          results.members.errors.push(`Error processing ${member.userId}: ${err.message}`);
        }
      }
    }

    return NextResponse.json({
      results,
      success: results.invitations.sent > 0 || results.members.added > 0,
    });
  } catch (error: any) {
    console.error('Error importing members:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while importing members.' },
      { status: 500 }
    );
  }
}
