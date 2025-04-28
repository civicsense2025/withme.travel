import { createApiClient } from "@/utils/supabase/server";
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET /api/likes?type=destination
// Gets all likes for the current user, optionally filtered by type
export async function GET(request: Request) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error("API Likes GET Error: Unauthorized - ", userError?.message);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    // Build query
    let query = supabase
      .from('likes')
      .select('*')
      .eq('user_id', user.id) // Use user.id

    if (type) {
      query = query.eq('item_type', type)
    }

    // Execute query
    const { data: likes, error } = await query
    if (error) {
        console.error('API Likes GET: Error fetching likes -', error.message);
        throw error; // Re-throw to be caught by the outer catch block
    }

    return NextResponse.json(likes)
  } catch (error: any) {
    console.error('Error fetching likes:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/likes
// Creates a new like for the current user
export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
       console.error("API Likes POST Error: Unauthorized - ", userError?.message);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { itemId, itemType } = body

    if (!itemId || !itemType) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Optional: Add item existence check here if needed
    // ... (code to verify itemId exists in the relevant table based on itemType)

    // Create like
    const { data, error } = await supabase
      .from('likes')
      .insert({
        user_id: user.id, // Use user.id
        item_id: itemId,
        item_type: itemType
      })
      .select() // Select the newly created record
      .single() // Expect only one record

    // Handle unique constraint violation (already liked)
    if (error?.code === '23505') { 
        console.log(`API Likes POST: Item ${itemId} (${itemType}) already liked by user ${user.id}.`);
        // You could fetch the existing like here if needed, or just return conflict
        return NextResponse.json({ error: 'Item already liked' }, { status: 409 }); // 409 Conflict
    }
    
    // Handle other potential errors during insert
    if (error) {
        console.error('API Likes POST: Error inserting like -', error.message);
        throw error; // Re-throw other errors
    }

    // Return the newly created like data
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Error creating like:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE /api/likes?itemId=123&itemType=destination
// Deletes a like for the current user
export async function DELETE(request: Request) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error("API Likes DELETE Error: Unauthorized - ", userError?.message);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')
    const itemType = searchParams.get('itemType')

    if (!itemId || !itemType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Delete like
    const { error, count } = await supabase
      .from('likes')
      .delete({ count: 'exact' }) // Request count of deleted rows
      .eq('user_id', user.id) // Use user.id
      .eq('item_id', itemId)
      .eq('item_type', itemType)

    if (error) {
        console.error('API Likes DELETE: Error deleting like -', error.message);
        throw error; // Re-throw
    }

    // Check if any row was actually deleted
    if (count === 0) {
        console.log(`API Likes DELETE: Like not found for item ${itemId}, type ${itemType}, user ${user.id}`);
        // Return 404 if the like didn't exist to be deleted
        return NextResponse.json({ error: 'Like not found' }, { status: 404 });
    }

    // Return 204 No Content on successful deletion
    return new NextResponse(null, { status: 204 })
    
  } catch (error: any) {
    console.error('Error deleting like:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 