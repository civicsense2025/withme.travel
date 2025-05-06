import { NextResponse } from 'next/server';
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
 * Get all ideas for a group
 * GET /api/groups/[id]/ideas
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const orderBy = searchParams.get('orderBy') || 'created_at';
    const direction = searchParams.get('direction') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const supabase = await createRouteHandlerClient();
    const cookieStore = await cookies();
    
    // Get the current user if authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Get guest token if not authenticated
    const guestToken = user ? null : await getGuestToken();
    
    // Verify user membership or public access (you should implement your own access control)
    if (userError || (!user && !guestToken)) {
      return NextResponse.json(
        { error: userError?.message || 'Authentication or guest token required to view group ideas' },
        { status: 401 }
      );
    }
    
    // Fetch ideas and their creator info in a single join query
    const { data: ideas, error } = await supabase
      .from(TABLES.GROUP_IDEAS)
      .select(`
        *,
        creator:${FIELDS.GROUP_IDEAS.CREATED_BY}(
          id,
          email,
          user_metadata
        )
      `)
      .eq(FIELDS.GROUP_IDEAS.GROUP_ID, params.id)
      .order(orderBy as any, { ascending: direction === 'asc' })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching group ideas:', error);
      return NextResponse.json(
        { error: 'Failed to fetch group ideas' },
        { status: 500 }
      );
    }
    
    // For each idea, check if the current user or guest has voted on it
    if (ideas.length > 0) {
      // Fetch all votes for the user or guest for these ideas
      const { data: votes } = await supabase
        .from(TABLES.GROUP_IDEA_VOTES)
        .select('*')
        .in(
          FIELDS.GROUP_IDEA_VOTES.IDEA_ID, 
          ideas.map(idea => idea.id)
        )
        .or(
          user 
            ? `${FIELDS.GROUP_IDEA_VOTES.USER_ID}.eq.${user.id}`
            : `${FIELDS.GROUP_IDEA_VOTES.GUEST_TOKEN}.eq.${guestToken}`
        );
      
      // Create a map of idea ID to vote type for quick lookup
      const voteMap = (votes || []).reduce((map, vote) => {
        map[vote.idea_id] = vote.vote_type;
        return map;
      }, {} as Record<string, string>);
      
      // Add user voting info to each idea
      const ideasWithVotes = ideas.map(idea => ({
        ...idea,
        user_vote: voteMap[idea.id] || null
      }));
      
      return NextResponse.json({ ideas: ideasWithVotes });
    }
    
    return NextResponse.json({ ideas });
  } catch (error) {
    console.error('Error processing group ideas request:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Create a new idea for a group
 * POST /api/groups/[id]/ideas
 */
export async function POST(
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
        { error: userError?.message || 'Authentication or guest token required to create ideas' },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    
    try {
      ideaSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Validation error', 
            details: validationError.errors 
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Invalid idea data' },
        { status: 400 }
      );
    }
    
    const ideaData = {
      group_id: params.id,
      title: body.title,
      description: body.description || null,
      type: body.type,
      created_by: user?.id || null,
      guest_token: !user ? guestToken : null,
      position: body.position || { x: 0, y: 0, w: 3, h: 2 },
      meta: body.meta || null
    };
    
    // Insert the new idea
    const { data: newIdea, error } = await supabase
      .from(TABLES.GROUP_IDEAS)
      .insert(ideaData)
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
      console.error('Error creating group idea:', error);
      return NextResponse.json(
        { error: 'Failed to create idea' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ idea: newIdea }, { status: 201 });
  } catch (error) {
    console.error('Error processing create idea request:', error);
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