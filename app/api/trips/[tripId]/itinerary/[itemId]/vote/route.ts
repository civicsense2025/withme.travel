import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TRIP_ROLES } from '@/utils/constants/status';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { z } from 'zod';

// Define table names as string literals
const TRIP_MEMBERS_TABLE = 'trip_members';
const ITINERARY_ITEMS_TABLE = 'itinerary_items';
const ITINERARY_ITEM_VOTES_TABLE = 'itinerary_item_votes';

// Define interfaces for our data models
interface TripMember {
  role: string;
}

// Type guard for TripMember
function isTripMember(obj: any): obj is TripMember {
  return obj && typeof obj === 'object' && 'role' in obj && typeof obj.role === 'string';
}

// Define local constants
const VOTE_TYPES = {
  UP: 'up',
  DOWN: 'down',
};

type VoteType = (typeof VOTE_TYPES)[keyof typeof VOTE_TYPES];

// Define fields for database access
const FIELDS = {
  COMMON: {
    ID: 'id',
  },
  TRIP_MEMBERS: {
    ROLE: 'role',
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
  },
  ITINERARY_ITEMS: {
    TRIP_ID: 'trip_id',
  },
  ITINERARY_ITEM_VOTES: {
    ITEM_ID: 'item_id',
    USER_ID: 'user_id',
    VOTE_TYPE: 'vote_type',
  },
};

// Helper function to check user membership and role
async function checkTripAccess(
  supabase: SupabaseClient<Database>,
  tripId: string,
  userId: string,
  allowedRoles: string[] = [
    TRIP_ROLES.ADMIN,
    TRIP_ROLES.EDITOR,
    TRIP_ROLES.CONTRIBUTOR,
    TRIP_ROLES.VIEWER,
  ]
): Promise<{ allowed: boolean; error?: string; status?: number }> {
  const { data: member, error } = await supabase
    .from(TRIP_MEMBERS_TABLE)
    .select('role')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error checking trip membership:', error);
    return { allowed: false, error: error.message, status: 500 };
  }

  if (!member) {
    return {
      allowed: false,
      error: 'Access Denied: You are not a member of this trip.',
      status: 403,
    };
  }

  // Check if member has role property
  if (!isTripMember(member)) {
    console.error('Invalid member data format:', member);
    return { allowed: false, error: 'Invalid member data format', status: 500 };
  }

  if (!allowedRoles.includes(member.role)) {
    return {
      allowed: false,
      error: 'Access Denied: You do not have sufficient permissions for this action.',
      status: 403,
    };
  }

  return { allowed: true };
}

// Helper to check trip membership
async function checkTripMembership(
  supabase: SupabaseClient<Database>,
  tripId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from(TRIP_MEMBERS_TABLE)
    .select('user_id')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error checking trip membership:', error);
    return false;
  }
  return !!data; // Return true if a membership record exists
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  try {
    const { tripId, itemId } = await params;
    const supabase = await createRouteHandlerClient();

    if (!tripId || !itemId) {
      return NextResponse.json({ error: 'Trip ID and Item ID are required' }, { status: 400 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    // Check if user is part of the trip
    const isMember = await checkTripMembership(supabase, tripId, userId);
    if (!isMember) {
      return NextResponse.json(
        { error: 'Forbidden: User is not a member of this trip.' },
        { status: 403 }
      );
    }

    let voteType: VoteType;
    try {
      const body = await request.json();
      // Validate using defined vote types
      const validVoteTypes = Object.values(VOTE_TYPES);
      if (!body.voteType || !validVoteTypes.includes(body.voteType)) {
        throw new Error(`Invalid vote type. Must be one of: ${validVoteTypes.join(', ')}`);
      }
      voteType = body.voteType;
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Invalid request body or vote type' },
        { status: 400 }
      );
    }

    // Upsert the vote: If the user already voted on this item, update the vote. Otherwise, insert a new vote.
    const { error: upsertError } = await supabase.from(ITINERARY_ITEM_VOTES_TABLE).upsert(
      {
        itinerary_item_id: itemId,
        user_id: userId,
        vote: voteType as Database['public']['Enums']['vote_type'],
      },
      {
        onConflict: 'itinerary_item_id,user_id',
      }
    );

    if (upsertError) {
      console.error('Error upserting vote:', upsertError);
      throw upsertError;
    }

    // Optional: Recalculate and return new vote counts if needed by the client immediately,
    // otherwise the client can refetch or update optimistically.
    // For now, just return success.
    return NextResponse.json({ success: true, message: 'Vote recorded' }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing vote:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
