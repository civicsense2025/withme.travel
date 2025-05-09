import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { checkAdminAuth } from '@/app/admin/utils/auth';
import { TABLES } from '@/utils/constants/tables';

/**
 * Get all places for admin panel
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
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Parse search parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const orderBy = searchParams.get('orderBy') || 'name';
    const order = searchParams.get('order') || 'asc';
    const destinationId = searchParams.get('destinationId');
    
    // Get total count of places with search filter
    let countQuery = supabase
      .from(TABLES.PLACES)
      .select('id', { count: 'exact', head: true });
      
    // Apply filters
    if (query) {
      countQuery = countQuery.ilike('name', `%${query}%`);
    }
    
    if (destinationId) {
      countQuery = countQuery.eq('destination_id', destinationId);
    }
    
    // Execute count query
    const countResult = await countQuery;
    const total = countResult.count || 0;
    
    // Build the data query - join with destinations to get destination name
    let dataQuery = supabase
      .from(TABLES.PLACES)
      .select(`
        *,
        ${TABLES.DESTINATIONS}(name, slug)
      `)
      .order(orderBy, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);
      
    // Apply filters to data query
    if (query) {
      dataQuery = dataQuery.ilike('name', `%${query}%`);
    }
    
    if (destinationId) {
      dataQuery = dataQuery.eq('destination_id', destinationId);
    }
    
    // Execute the data query
    const { data: places, error: fetchError } = await dataQuery;

    if (fetchError) {
      console.error('Error fetching places:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch places', details: fetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      places,
      pagination: {
        total,
        limit,
        offset,
      }
    });
  } catch (error) {
    console.error('Error in places endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 