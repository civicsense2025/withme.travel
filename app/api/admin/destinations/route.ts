import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { checkAdminAuth } from '@/app/admin/utils/auth';
import { TABLES } from '@/utils/constants/tables';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

/**
 * Get all destinations for admin panel
 */
export async function GET(request: NextRequest) {
  try {
    // Check if the user is an admin
    const { isAdmin, supabase, error } = await checkAdminAuth();

    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Parse search parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const orderBy = searchParams.get('orderBy') || 'name';
    const order = searchParams.get('order') || 'asc';

    // Get total count of destinations with search filter
    let countQuery = supabase
      .from(TABLES.DESTINATIONS)
      .select('id', { count: 'exact', head: true });

    // Add search filter to count query if provided
    if (query) {
      countQuery = countQuery.ilike('name', `%${query}%`);
    }

    // Use a more generic type for the count result
    const countResult = await countQuery;
    const total = countResult.count || 0;

    // Build the data query
    let dataQuery = supabase
      .from(TABLES.DESTINATIONS)
      .select('*')
      .order(orderBy, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    // Add search filter to data query if provided
    if (query) {
      dataQuery = dataQuery.ilike('name', `%${query}%`);
    }

    // Execute the data query
    const { data: destinations, error: fetchError } = await dataQuery;

    if (fetchError) {
      console.error('Error fetching destinations:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch destinations', details: fetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      destinations,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Error in destinations endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
