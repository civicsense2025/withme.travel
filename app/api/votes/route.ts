/**
 * User Votes API Route
 * 
 * Handles fetching user votes for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

/**
 * GET handler to retrieve user votes
 * 
 * Requires authentication. Returns all votes by the current user.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Initialize Supabase client
    const supabase = await createRouteHandlerClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    
    // Fetch all votes for the user
    const { data: votes, error } = await supabase
      .from(TABLES.USER_TRIP_VOTES)
      .select('*')
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error fetching votes:', error);
      
      return NextResponse.json(
        { error: 'Failed to fetch votes', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(votes);
  } catch (error) {
    console.error('Unexpected error in votes API:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
} 