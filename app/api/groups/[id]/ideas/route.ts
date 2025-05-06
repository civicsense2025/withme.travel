import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { TABLES, FIELDS, ENUMS } from '@/utils/constants/database';
import { getGuestToken } from '@/utils/guest';
import { z } from 'zod';

// Validation schema for creating/updating ideas
const ideaSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100),
  description: z.string().trim().nullish(),
  type: z.enum([
    ENUMS.IDEA_TYPES.DESTINATION,
    ENUMS.IDEA_TYPES.DATE,
    ENUMS.IDEA_TYPES.ACTIVITY,
    ENUMS.IDEA_TYPES.BUDGET,
    ENUMS.IDEA_TYPES.OTHER
  ]),
  position: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number()
  }).nullish(),
  meta: z.record(z.any()).nullish()
});

/**
 * GET /api/groups/[id]/ideas
 * Get all ideas for a group, optionally filtered by plan_id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is a member of the group
    const { data: membership, error: membershipError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('*')
      .eq(FIELDS.GROUP_MEMBERS.GROUP_ID, params.id)
      .eq(FIELDS.GROUP_MEMBERS.USER_ID, user.id)
      .maybeSingle();
    
    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      );
    }
    
    // Extract query params
    const url = new URL(request.url);
    const planId = url.searchParams.get('planId');
    const selectedOnly = url.searchParams.get('selectedOnly') === 'true';
    
    // Build query
    let query = supabase
      .from(TABLES.GROUP_IDEAS)
      .select(`
        *,
        creator:${FIELDS.GROUP_IDEAS.CREATED_BY}(
          id,
          email,
          user_metadata
        ),
        votes:${TABLES.GROUP_IDEA_VOTES}(
          id,
          user_id,
          vote_type
        )
      `)
      .eq(FIELDS.GROUP_IDEAS.GROUP_ID, params.id);
    
    // Add filters if provided
    if (planId) {
      query = query.eq('plan_id', planId);
    }
    
    if (selectedOnly) {
      query = query.eq('selected', true);
    }
    
    // Execute query with proper ordering
    const { data: ideas, error } = await query
      .order('position', { ascending: true })
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching ideas:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ideas' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ ideas: ideas || [] });
  } catch (error) {
    console.error('Error in group ideas API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups/[id]/ideas
 * Create a new idea for a group
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is a member of the group
    const { data: membership, error: membershipError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('*')
      .eq(FIELDS.GROUP_MEMBERS.GROUP_ID, params.id)
      .eq(FIELDS.GROUP_MEMBERS.USER_ID, user.id)
      .maybeSingle();
    
    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      );
    }
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.type) {
      return NextResponse.json(
        { error: 'Title and type are required' },
        { status: 400 }
      );
    }
    
    // Insert new idea
    const { data: idea, error } = await supabase
      .from(TABLES.GROUP_IDEAS)
      .insert({
        [FIELDS.GROUP_IDEAS.GROUP_ID]: params.id,
        [FIELDS.GROUP_IDEAS.TITLE]: body.title,
        [FIELDS.GROUP_IDEAS.DESCRIPTION]: body.description,
        [FIELDS.GROUP_IDEAS.TYPE]: body.type,
        [FIELDS.GROUP_IDEAS.CREATED_BY]: user.id,
        plan_id: body.plan_id || null,
        // Optional fields
        start_date: body.start_date || null,
        end_date: body.end_date || null,
        position: body.position || null,
        notes: body.notes || null,
        meta: body.meta || null,
      })
      .select(`
        *,
        creator:${FIELDS.GROUP_IDEAS.CREATED_BY}(
          id,
          email,
          user_metadata
        )
      `)
      .single();
    
    if (error) {
      console.error('Error creating idea:', error);
      return NextResponse.json(
        { error: 'Failed to create idea' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ idea });
  } catch (error) {
    console.error('Error in create idea API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Update multiple ideas positions at once (batch update)
 * PATCH /api/groups/[id]/ideas
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get the current user if authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Get guest token if not authenticated
    const guestToken = user ? null : await getGuestToken();
    
    // Require either user auth or guest token
    if (userError || (!user && !guestToken)) {
      return NextResponse.json(
        { error: userError?.message || 'Authentication or guest token required to update ideas' },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const { positions } = body;
    
    if (!Array.isArray(positions)) {
      return NextResponse.json(
        { error: 'Invalid positions data format' },
        { status: 400 }
      );
    }
    
    // Start a batch transaction to update all idea positions
    const updates = positions.map(pos => {
      if (!pos.id || !pos.position) return null;
      
      return supabase
        .from(TABLES.GROUP_IDEAS)
        .update({ position: pos.position })
        .eq('id', pos.id)
        .eq('group_id', params.id);
    }).filter(Boolean);
    
    // Execute all updates
    await Promise.all(updates);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating idea positions:', error);
    return NextResponse.json(
      { error: 'Failed to update idea positions' },
      { status: 500 }
    );
  }
} 