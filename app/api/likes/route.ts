import { getRouteHandlerClient } from '@/utils/supabase/unified';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

// GET /api/likes?type=destination
// Gets all likes for the current user, optionally filtered by type
export async function GET(request: NextRequest) {
  try {
    const supabase = await getRouteHandlerClient();

    // Get authenticated user - use getUser instead of getSession
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      logger.error('API Likes GET Error: Unauthorized', 'api', userError);
      return NextResponse.json({ error: 'Unauthorized - Auth user missing!' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Build query
    let query = supabase.from('likes').select('*').eq('user_id', userData.user.id);

    if (type) {
      query = query.eq('item_type', type);
    }

    // Execute query
    const { data: likes, error } = await query;
    if (error) {
      logger.error('API Likes GET Error: Database query failed', 'api', error);
      return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 });
    }

    return NextResponse.json({ data: likes });
  } catch (error) {
    logger.error('API Likes GET Error: Unexpected error', 'api', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/likes
// Creates a new like for the current user
export async function POST(request: NextRequest) {
  try {
    const supabase = await getRouteHandlerClient();

    // Get authenticated user - use getUser instead of getSession
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      logger.error('API Likes POST Error: Unauthorized', 'api', userError);
      return NextResponse.json({ error: 'Unauthorized - Auth user missing!' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { itemId, itemType } = body;

    if (!itemId || !itemType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Optional: Add item existence check here if needed
    // ... (code to verify itemId exists in the relevant table based on itemType)

    // Create like
    const { data, error } = await supabase
      .from('likes')
      .insert({
        user_id: userData.user.id,
        item_id: itemId,
        item_type: itemType,
      })
      .select() // Select the newly created record
      .single(); // Expect only one record

    // Handle unique constraint violation (already liked)
    if (error?.code === '23505') {
      logger.info(
        `API Likes POST: Item ${itemId} (${itemType}) already liked by user ${userData.user.id}.`
      );
      // You could fetch the existing like here if needed, or just return conflict
      return NextResponse.json({ error: 'Item already liked' }, { status: 409 }); // 409 Conflict
    }

    // Handle other potential errors during insert
    if (error) {
      logger.error('API Likes POST Error: Error inserting like', 'api', error);
      throw error; // Re-throw other errors
    }

    // Return the newly created like data
    return NextResponse.json(data);
  } catch (error) {
    logger.error('API Likes POST Error: Unexpected error', 'api', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/likes?itemId=123&itemType=destination
// Deletes a like for the current user
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getRouteHandlerClient();

    // Get authenticated user - use getUser instead of getSession
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      logger.error('API Likes DELETE Error: Unauthorized', 'api', userError);
      return NextResponse.json({ error: 'Unauthorized - Auth user missing!' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const itemType = searchParams.get('itemType');

    if (!itemId || !itemType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Delete like
    const { error, count } = await supabase
      .from('likes')
      .delete({ count: 'exact' }) // Request count of deleted rows
      .eq('user_id', userData.user.id) // Use user.id
      .eq('item_id', itemId)
      .eq('item_type', itemType);

    if (error) {
      logger.error('API Likes DELETE Error: Error deleting like', 'api', error);
      throw error; // Re-throw
    }

    // Check if any row was actually deleted
    if (count === 0) {
      logger.info(
        `API Likes DELETE: Like not found for item ${itemId}, type ${itemType}, user ${userData.user.id}`
      );
      // Return 404 if the like didn't exist to be deleted
      return NextResponse.json({ error: 'Like not found' }, { status: 404 });
    }

    // Return 204 No Content on successful deletion
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error('API Likes DELETE Error: Unexpected error', 'api', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
