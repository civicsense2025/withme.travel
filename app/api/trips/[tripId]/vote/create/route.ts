import { createApiClient } from "@/utils/supabase/server";
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Define validation schema for poll creation
const createPollSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().optional(),
  options: z.array(z.object({
    title: z.string().min(1, 'Option title is required').max(200, 'Option title cannot exceed 200 characters'),
    description: z.string().optional(),
  })).min(2, 'At least 2 options are required'),
  expiresAt: z.date().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  const { tripId } = params;
  
  // Validate trip ID
  if (!tripId || !/^\d+$/.test(tripId)) {
    return NextResponse.json(
      { error: 'Invalid trip ID' },
      { status: 400 }
    );
  }
  
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const validationResult = createPollSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid poll data', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { title, description, options, expiresAt } = validationResult.data;
    
    // Get authenticated user
    const supabase = await createApiClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Verify user is a member of this trip with appropriate permissions
    const { data: tripMember, error: tripMemberError } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .single();
    
    if (tripMemberError || !tripMember) {
      return NextResponse.json(
        { error: 'You are not a member of this trip' },
        { status: 403 }
      );
    }
    
    // Check if user has appropriate role to create polls
    if (!['admin', 'editor'].includes(tripMember.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to create polls in this trip' },
        { status: 403 }
      );
    }
    
    // Create new poll
    const { data: poll, error: pollError } = await supabase
      .from('trip_polls')
      .insert({
        trip_id: parseInt(tripId),
        title,
        description: description || null,
        created_by: userId,
        expires_at: expiresAt || null,
      })
      .select('id')
      .single();
    
    if (pollError || !poll) {
      console.error('Error creating poll:', pollError);
      return NextResponse.json(
        { error: 'Failed to create poll' },
        { status: 500 }
      );
    }
    
    // Create poll options
    const optionsToInsert = options.map(option => ({
      poll_id: poll.id,
      text: option.title,
    }));
    
    const { data: createdOptions, error: optionsError } = await supabase
      .from('trip_poll_options')
      .insert(optionsToInsert)
      .select('id, text');
    
    if (optionsError) {
      console.error('Error creating poll options:', optionsError);
      
      // Clean up the poll if option creation failed
      await supabase
        .from('trip_polls')
        .delete()
        .eq('id', poll.id);
      
      return NextResponse.json(
        { error: 'Failed to create poll options' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      poll: {
        id: poll.id,
        title,
        description,
        expiresAt,
      },
      options: createdOptions,
    });
    
  } catch (error) {
    console.error('Error creating poll:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 