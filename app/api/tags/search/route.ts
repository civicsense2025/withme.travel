/**
 * Tag Search API Route
 *
 * Handle requests for searching tags.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { getCurrentUserId } from '@/utils/auth';

/**
 * GET handler for searching tags
 */
export async function GET(request: NextRequest) {
  try {
    // Get search query
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // Get the current user
    const supabase = await createRouteHandlerClient();
    const userId = await getCurrentUserId(supabase);

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Search tags - we use ILIKE for case-insensitive matching
    const { data, error } = await supabase
      .from('tags')
      .select('id, name')
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(10);

    if (error) {
      console.error('Error searching tags:', error);
      return NextResponse.json({ error: 'Failed to search tags' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in tag search handler:', error);
    return NextResponse.json({ error: 'Failed to search tags' }, { status: 500 });
  }
}
