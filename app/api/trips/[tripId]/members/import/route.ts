import { NextRequest, NextResponse } from 'next/server';
// import { createServerSupabaseClient } from '@/utils/supabase/server'; // Old import
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { checkTripAccess } from '@/lib/trip-access';
import { TRIP_ROLES } from '@/utils/constants/status';
import { z } from 'zod';
import type { Database } from '@/types/database.types';

// Define hasMinimumRole locally
function hasMinimumRole(userRole: string | null, requiredRole: string): boolean {
  if (!userRole) return false;

  const roleValues: { [key: string]: number } = {
    [TRIP_ROLES.ADMIN]: 4,
    [TRIP_ROLES.EDITOR]: 3,
    [TRIP_ROLES.CONTRIBUTOR]: 2,
    [TRIP_ROLES.VIEWER]: 1,
  };

  return (roleValues[userRole] || 0) >= (roleValues[requiredRole] || 0);
}

// Define table names directly as string literals
const TRIP_MEMBERS_TABLE = 'trip_members';
const TRIP_INVITATIONS_TABLE = 'trip_invitations';

// Define database field constants to avoid linting issues
const FIELDS = {
  TRIP_MEMBERS: {
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
    ROLE: 'role',
  },
};

// Schema for validating member data
const memberSchema = z.object({
  members: z.array(
    z.object({
      email: z.string().email(),
      role: z.enum(['admin', 'editor', 'viewer']).default('viewer'),
      name: z.string().optional(),
    })
  ),
});

// POST /api/trips/[tripId]/members/import
// Imports members from a linked Splitwise group to the trip
export async function POST(request: NextRequest, { params }: { params: { tripId: string } }) {
  const { tripId } = params;
  const supabase = await createRouteHandlerClient();

  try {
    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is authorized to invite members to this trip
    const { data: membership, error: membershipError } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Not a member of this trip' }, { status: 403 });
    }

    // Check if user has permission to invite members
    if (membership.role !== 'admin' && membership.role !== 'editor') {
      return NextResponse.json(
        { error: 'Insufficient permissions to invite members' },
        { status: 403 }
      );
    }

    // Validate request body
    const requestData = await request.json();
    const validation = memberSchema.safeParse(requestData);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid member data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { members } = validation.data;

    // Get trip information for invitation
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('name, description')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Process each member
    const results = await Promise.all(
      members.map(async (member) => {
        // Check if user already exists with this email
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', member.email)
          .single();

        if (existingUser) {
          // User exists, check if already a member of this trip
          const { data: existingMember } = await supabase
            .from('trip_members')
            .select('id, role')
            .eq('trip_id', tripId)
            .eq('user_id', existingUser.id)
            .single();

          if (existingMember) {
            // Already a member, update role if different
            if (existingMember.role !== member.role) {
              const { error: updateError } = await supabase
                .from('trip_members')
                .update({ role: member.role })
                .eq('id', existingMember.id);

              if (updateError) {
                return {
                  email: member.email,
                  status: 'error',
                  message: 'Failed to update member role',
                };
              }

              return {
                email: member.email,
                status: 'updated',
                message: `Role updated to ${member.role}`,
              };
            }

            return {
              email: member.email,
              status: 'skipped',
              message: 'Already a member with the same role',
            };
          }

          // Add existing user as a trip member
          const { error: addError } = await supabase.from('trip_members').insert({
            trip_id: tripId,
            user_id: existingUser.id,
            role: member.role,
            invited_by: user.id,
          });

          if (addError) {
            return {
              email: member.email,
              status: 'error',
              message: 'Failed to add to trip',
            };
          }

          return {
            email: member.email,
            status: 'added',
            message: 'Added as existing user',
          };
        }

        // User doesn't exist, create invitation
        const { error: inviteError } = await supabase.from('trip_invitations').insert({
          trip_id: tripId,
          email: member.email,
          role: member.role,
          invited_by: user.id,
          name: member.name || null,
        });

        if (inviteError) {
          return {
            email: member.email,
            status: 'error',
            message: 'Failed to create invitation',
          };
        }

        return {
          email: member.email,
          status: 'invited',
          message: 'Invitation created',
        };
      })
    );

    const successCount = results.filter(
      (result) => result.status === 'added' || result.status === 'updated'
    ).length;

    return NextResponse.json({ success: true, importedCount: successCount });
  } catch (error) {
    console.error('Error importing members:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
